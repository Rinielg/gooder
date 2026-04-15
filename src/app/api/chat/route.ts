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
    const { messages, profileId, figmaContext: clientFigmaContext, modelOverride } = body as {
      messages: UIMessage[];
      profileId?: string;
      figmaContext?: string;
      modelOverride?: string;
    };

    // Require a brand profile for content generation
    if (!profileId) {
      return new Response(
        JSON.stringify({ error: "A brand profile must be selected before generating content." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

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
      { data: trainingDocs },
    ] = await Promise.all([
      supabase.from("platform_standards").select("*").eq("workspace_id", workspaceId).eq("is_active", true),
      supabase.from("objectives").select("*").eq("workspace_id", workspaceId).eq("is_active", true),
      supabase.from("definitions").select("*").eq("workspace_id", workspaceId),
      profileId
        ? supabase
            .from("training_documents")
            .select("file_name, extracted_content")
            .eq("brand_profile_id", profileId)
            .eq("processing_status", "complete")
        : Promise.resolve({ data: null }),
    ]);

    // Build training context from uploaded documents
    let trainingContext: string | undefined;
    if (trainingDocs?.length) {
      const docTexts = trainingDocs.map((doc: any) => {
        const text = doc.extracted_content?.text || "";
        const truncated = text.length > 2000 ? text.slice(0, 2000) + "..." : text;
        return `[Source: ${doc.file_name}]\n${truncated}`;
      });
      trainingContext = docTexts.join("\n\n---\n\n");
    }

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
    const selectedModel = modelOverride || selectModelForTask(taskComplexity);

    // Use client-extracted Figma context if provided, otherwise note the URL
    let figmaContext: string | undefined;
    if (clientFigmaContext) {
      figmaContext = clientFigmaContext;
    } else {
      const figmaMatch = userContent.match(/\[Figma:\s*(https:\/\/[^\]]+)\]/);
      if (figmaMatch) {
        figmaContext = `Figma URL provided: ${figmaMatch[1]}. No extracted data available — user may not have confirmed extraction.`;
      }
    }

    // Build system prompt
    const systemPromptContent = buildSystemPrompt({
      profile,
      standards: (standards || []) as PlatformStandard[],
      objectives: (objectives || []) as Objective[],
      definitions: (definitions || []) as Definition[],
      figmaContext,
      trainingContext,
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

    // Stream — the Output Agent returns pure JSON.
    // message.content on the frontend will be a JSON string matching StructuredOutput.
    // Parse with: JSON.parse(message.content) to get the typed tree.
    const result = streamText({
      model: anthropic(selectedModel),
      system: systemPromptContent,
      messages: convertedMessages,
      maxOutputTokens: 4096,
      // Lower temperature improves JSON schema compliance
      temperature: 0.4,
      // Validate the completed output is parseable JSON; log a warning if not
      onFinish: ({ text }) => {
        try {
          JSON.parse(text);
        } catch {
          console.warn(
            "[Output Agent] Response was not valid JSON. The model may have deviated from the schema.",
            text.slice(0, 200)
          );
        }
      },
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
