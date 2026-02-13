import Anthropic from "@anthropic-ai/sdk";
import { mergeProfileData } from "@/lib/training/merge";
import { calculateCompleteness } from "@/lib/training/completeness";
import type { BrandProfile, BrandProfileData, TrainingSource } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";

const ANALYSIS_MODEL = "claude-sonnet-4-5-20250929";

interface AnalyzeParams {
  documentId: string;
  profileId: string;
  workspaceId: string;
  extractedText: string;
  fileName: string;
  serviceClient: SupabaseClient;
}

interface AnalysisResult {
  completeness: number;
  fields_populated: string[];
  gaps: string[];
  confidence: string;
  definitions_added: number;
  profile_status: string;
}

function buildAnalysisPrompt(
  currentProfile: BrandProfileData,
  extractedText: string
): { system: string; user: string } {
  const system = `You are the Brand Voice Analysis Agent. You extract brand voice attributes from documents and map them to a structured brand profile.

## YOUR TASK
Analyze the provided brand document and extract any brand voice attributes you can confidently identify. Map your findings to the BrandProfileData structure.

## CURRENT PROFILE STATE
The following fields are already populated. Do NOT re-extract these unless the document contains significantly more complete data:
${JSON.stringify(currentProfile, null, 2)}

## OUTPUT FORMAT
Respond with ONLY valid JSON matching this exact schema. Only include fields you can confidently extract from the document:

{
  "extracted_fields": {
    "system_meta": {
      "brand_name": "string or omit",
      "template_version": "BVST-2026",
      "compliance_mode": "standard",
      "adherence_threshold": 7
    },
    "voice_identity": {
      "pillars": [
        {
          "name": "string",
          "meaning": "what this pillar means for the brand",
          "sounds_like": "example phrases/qualities",
          "anti_pattern": "what this should never sound like",
          "dial_range": "when to dial up/down",
          "example_good": "good example",
          "example_bad": "bad example"
        }
      ],
      "archetype": {
        "primary": "string",
        "secondary": "string",
        "description": "string",
        "sounds_like": "string",
        "never_sounds_like": "string"
      },
      "spectrum": {
        "formality": 1-10,
        "seriousness": 1-10,
        "technicality": 1-10,
        "enthusiasm": 1-10,
        "authority": 1-10
      }
    },
    "tone_architecture": {
      "situational_tone_map": [
        {
          "situation": "string",
          "default_tone": "string",
          "leading_pillar": "string",
          "guidance": "string"
        }
      ],
      "emotional_gradient": {},
      "tone_rules": {}
    },
    "lifecycle_language": {},
    "grammar_style": {},
    "content_patterns": {},
    "channel_adaptation": {},
    "governance": {}
  },
  "definitions_found": [
    { "term": "string", "definition": "string" }
  ],
  "confidence": "low" | "medium" | "high",
  "fields_populated": ["voice_identity.pillars", "tone_architecture.situational_tone_map"],
  "gaps": ["No lifecycle language found", "Missing channel-specific rules"]
}

## RULES
- Only include fields you have clear evidence for in the document
- Omit entire sections if the document provides no relevant information
- For voice pillars, look for: personality traits, brand values, tone descriptors, "we are/we aren't" lists
- For archetype, look for: brand personality descriptions, character comparisons
- For spectrum, infer numerical positions from language style and descriptors
- For tones, look for: situational guidelines, "in this case use X tone" patterns
- For grammar, look for: style guide rules, writing conventions, formatting preferences
- For definitions, look for: glossaries, "we call X", branded terminology
- confidence should reflect how much relevant brand voice data the document contains`;

  const user = `Analyze the following brand document and extract all brand voice attributes you can identify.

<user_brand_materials>
${extractedText.slice(0, 50000)}
</user_brand_materials>

Return ONLY valid JSON. No markdown, no explanation.`;

  return { system, user };
}

/**
 * Analyze extracted document text and merge results into the brand profile.
 * Used by both the upload route (inline) and the standalone analyze route.
 */
export async function analyzeDocument(params: AnalyzeParams): Promise<AnalysisResult> {
  const { documentId, profileId, workspaceId, extractedText, fileName, serviceClient } = params;

  // ── Load current profile ──────────────────────────────────────────
  const { data: profileData } = await serviceClient
    .from("brand_profiles")
    .select("*")
    .eq("id", profileId)
    .single();

  if (!profileData) {
    throw new Error("Profile not found");
  }

  const profile = profileData as BrandProfile;

  // ── Call Claude for analysis ──────────────────────────────────────
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const { system, user } = buildAnalysisPrompt(
    profile.profile_data || {},
    extractedText
  );

  const response = await anthropic.messages.create({
    model: ANALYSIS_MODEL,
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: user }],
  });

  const responseText = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");

  // ── Parse JSON ────────────────────────────────────────────────────
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON in analysis response");
  }

  let analysisResult: {
    extracted_fields: Partial<BrandProfileData>;
    definitions_found?: { term: string; definition: string }[];
    confidence: string;
    fields_populated: string[];
    gaps: string[];
  };

  try {
    analysisResult = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error("Invalid JSON from analysis model");
  }

  // ── Merge into profile ────────────────────────────────────────────
  const merged = mergeProfileData(
    profile.profile_data || {},
    analysisResult.extracted_fields || {}
  );

  const completeness = calculateCompleteness(merged);

  // ── Build training source entry ───────────────────────────────────
  const newSource: TrainingSource = {
    type: "document",
    document_id: documentId,
    file_name: fileName,
    fields_populated: analysisResult.fields_populated || [],
    created_at: new Date().toISOString(),
  };

  const existingSources: TrainingSource[] = profile.training_sources || [];
  const updatedSources = [
    ...existingSources.filter((s) => s.document_id !== documentId),
    newSource,
  ];

  let newStatus = profile.status;
  if (profile.status === "draft") {
    newStatus = "training";
  }

  // ── Update profile ────────────────────────────────────────────────
  const { error: updateError } = await serviceClient
    .from("brand_profiles")
    .update({
      profile_data: merged,
      completeness,
      training_sources: updatedSources,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (updateError) {
    throw new Error(`Profile update failed: ${updateError.message}`);
  }

  // ── Insert definitions ────────────────────────────────────────────
  let definitionsAdded = 0;
  if (analysisResult.definitions_found?.length) {
    const definitions = analysisResult.definitions_found.map((d) => ({
      workspace_id: workspaceId,
      term: d.term,
      definition: d.definition,
    }));

    await serviceClient
      .from("definitions")
      .upsert(definitions, { onConflict: "workspace_id,term", ignoreDuplicates: true })
      .select();

    definitionsAdded = definitions.length;
  }

  return {
    completeness,
    fields_populated: analysisResult.fields_populated || [],
    gaps: analysisResult.gaps || [],
    confidence: analysisResult.confidence || "medium",
    definitions_added: definitionsAdded,
    profile_status: newStatus,
  };
}
