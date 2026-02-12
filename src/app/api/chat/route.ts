import { streamText, type UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildSystemPrompt } from "@/lib/ai/prompts/system";
import {
  detectContentType,
  classifyTaskComplexity,
  selectModelForTask,
} from "@/lib/ai/models";
import type { BrandProfile, PlatformStandard, Objective, Definition } from "@/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, profileId } = body as {
      messages: UIMessage[];
      profileId?: string;
    };

    // Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

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
    let profile: BrandProfile | null = null;
    if (profileId) {
      const { data } = await supabase
        .from("brand_profiles")
        .select("*")
        .eq("id", profileId)
        .eq("workspace_id", workspaceId)
        .single();
      profile = data as BrandProfile | null;
    }

    // Load context data in parallel
    const [
      { data: standards },
      { data: objectives },
      { data: definitions },
    ] = await Promise.all([
      supabase.from("platform_standards").select("*").eq("workspace_id", workspaceId).eq("is_active", true),
      supabase.from("objectives").select("*").eq("workspace_id", workspaceId).eq("is_active", true),
      supabase.from("definitions").select("*").eq("workspace_id", workspaceId),
    ]);

    // Extract last user message text for model selection
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
    let userContent = "";
    if (lastUserMsg) {
      const msg = lastUserMsg as any;
      if (typeof msg.content === "string") {
        userContent = msg.content;
      } else if (Array.isArray(msg.parts)) {
        userContent = msg.parts
          .filter((p: any) => p.type === "text")
          .map((p: any) => p.text)
          .join(" ");
      }
    }

    const contentType = detectContentType(userContent);
    const taskComplexity = classifyTaskComplexity(userContent, contentType);
    const selectedModel = selectModelForTask(taskComplexity);

    // Check for Figma URL
    let figmaContext: string | undefined;
    const figmaMatch = userContent.match(/\[Figma:\s*(https:\/\/[^\]]+)\]/);
    if (figmaMatch) {
      figmaContext = `Figma URL provided: ${figmaMatch[1]}. Frame data extraction available in future update.`;
    }

    // Build system prompt
    const systemPromptContent = buildSystemPrompt({
      profile,
      standards: (standards || []) as PlatformStandard[],
      objectives: (objectives || []) as Objective[],
      definitions: (definitions || []) as Definition[],
      figmaContext,
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

    // Stream
    const result = streamText({
      model: anthropic(selectedModel),
      system: systemPromptContent,
      messages: convertedMessages,
      maxOutputTokens: 4096,
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
