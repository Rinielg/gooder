import { streamText, type UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildSetupPrompt } from "@/lib/ai/prompts/system";
import { MODELS } from "@/lib/ai/models";
import type { BrandProfile, BrandProfileData } from "@/types";

export const maxDuration = 60;

/**
 * Parse ```profile_update JSON blocks from assistant text
 * and return an array of { field_path, value } objects.
 */
function parseProfileUpdates(
  text: string
): Array<{ field_path: string; value: unknown }> {
  const updates: Array<{ field_path: string; value: unknown }> = [];
  const regex = /```profile_update\s*([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed.field_path && parsed.value !== undefined) {
        updates.push(parsed);
      }
    } catch {
      // skip malformed blocks
    }
  }
  return updates;
}

/**
 * Set a value on an object using a dot/bracket path like
 * "voice_identity.pillars[0].name".
 */
function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const keys = path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);

  let current: any = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];
    if (current[key] === undefined || current[key] === null) {
      current[key] = /^\d+$/.test(nextKey) ? [] : {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

/**
 * Calculate profile completeness (0-100) based on critical fields.
 */
function calculateCompleteness(data: BrandProfileData): number {
  let filled = 0;
  const total = 5;

  // 1. At least 3 voice pillars
  if (data.voice_identity?.pillars && data.voice_identity.pillars.length >= 3) {
    filled++;
  }

  // 2. Brand archetype (primary + secondary)
  if (
    data.voice_identity?.archetype?.primary &&
    data.voice_identity?.archetype?.secondary
  ) {
    filled++;
  }

  // 3. Voice spectrum (all 5 axes)
  const spectrum = data.voice_identity?.spectrum;
  if (
    spectrum &&
    spectrum.formality != null &&
    spectrum.seriousness != null &&
    spectrum.technicality != null &&
    spectrum.enthusiasm != null &&
    spectrum.authority != null
  ) {
    filled++;
  }

  // 4. At least 3 situational tones
  if (
    data.tone_architecture?.situational_tone_map &&
    data.tone_architecture.situational_tone_map.length >= 3
  ) {
    filled++;
  }

  // 5. Grammar preferences
  if (data.grammar_style && Object.keys(data.grammar_style).length > 0) {
    filled++;
  }

  return Math.round((filled / total) * 100);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, profileId } = body as {
      messages: UIMessage[];
      profileId?: string;
    };

    if (!profileId) {
      return new Response(
        JSON.stringify({ error: "profileId is required for training" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get workspace
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id, role")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!membership) {
      return new Response(JSON.stringify({ error: "No workspace found" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const workspaceId = membership.workspace_id;

    // Load brand profile
    const { data: profileRow, error: profileError } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("id", profileId)
      .eq("workspace_id", workspaceId)
      .single();

    if (profileError || !profileRow) {
      return new Response(
        JSON.stringify({ error: "Brand profile not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const profile = profileRow as BrandProfile;

    // Build setup agent system prompt
    const systemPromptContent = buildSetupPrompt({
      existingProfile: profile.profile_data,
    });

    // Convert UIMessages to the format streamText expects
    const convertedMessages = messages.map((m: any) => {
      let textContent = "";
      if (typeof m.content === "string") {
        textContent = m.content;
      } else if (Array.isArray(m.parts)) {
        textContent = m.parts
          .filter((p: any) => p.type === "text")
          .map((p: any) => p.text)
          .join("\n");
      }
      return {
        role: m.role as "user" | "assistant",
        content: textContent,
      };
    });

    // Stream with Sonnet (training always uses Sonnet)
    const result = streamText({
      model: anthropic(MODELS.sonnet),
      system: systemPromptContent,
      messages: convertedMessages,
      maxOutputTokens: 4096,
      temperature: 0.7,
      async onFinish({ text }) {
        // Parse profile_update blocks from assistant response
        const updates = parseProfileUpdates(text);
        if (updates.length === 0) return;

        // Merge updates into existing profile_data
        const profileData: BrandProfileData = {
          ...(profile.profile_data || {}),
        };

        for (const update of updates) {
          setNestedValue(
            profileData as Record<string, unknown>,
            update.field_path,
            update.value
          );
        }

        // Recalculate completeness
        const completeness = calculateCompleteness(profileData);

        // Persist to Supabase
        await supabase
          .from("brand_profiles")
          .update({
            profile_data: profileData,
            completeness,
            updated_at: new Date().toISOString(),
          })
          .eq("id", profileId)
          .eq("workspace_id", workspaceId);
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Training API error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
