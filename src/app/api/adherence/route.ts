import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildAdherencePrompt } from "@/lib/ai/prompts/system";
import { MODELS } from "@/lib/ai/models";
import type {
  BrandProfile,
  PlatformStandard,
  Objective,
  Definition,
  AdherenceScore,
  DimensionScore,
  AdherenceFlag,
} from "@/types";

export const maxDuration = 30;

const DIMENSION_KEYS = [
  "voice_consistency",
  "tone_accuracy",
  "compliance",
  "terminology",
  "platform_optimization",
  "objective_alignment",
  "pattern_adherence",
  "overall_quality",
] as const;

type DimensionKey = (typeof DIMENSION_KEYS)[number];

const DEFAULT_WEIGHTS: Record<DimensionKey, number> = {
  voice_consistency: 0.2,
  tone_accuracy: 0.15,
  compliance: 0.2,
  terminology: 0.1,
  platform_optimization: 0.1,
  objective_alignment: 0.1,
  pattern_adherence: 0.05,
  overall_quality: 0.1,
};

function clampScore(val: unknown): number {
  const n = Number(val);
  if (isNaN(n)) return 0;
  return Math.max(0, Math.min(10, Math.round(n * 10) / 10));
}

function parseDimension(raw: unknown, key: DimensionKey): DimensionScore {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    score: clampScore(obj.score),
    weight: DEFAULT_WEIGHTS[key],
    flags: Array.isArray(obj.flags)
      ? obj.flags.map((f: any) => ({
          dimension: String(f.dimension ?? key),
          severity: (["info", "warning", "fail", "automatic_fail"].includes(f.severity)
            ? f.severity
            : "info") as AdherenceFlag["severity"],
          issue: String(f.issue ?? ""),
          suggestion: String(f.suggestion ?? ""),
        }))
      : [],
    notes: typeof obj.notes === "string" ? obj.notes : "",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, profileId, contentType } = body as {
      content: string;
      profileId: string;
      contentType?: string;
    };

    if (!content || !profileId) {
      return NextResponse.json(
        { error: "content and profileId are required" },
        { status: 400 }
      );
    }

    // ── Auth ───────────────────────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Workspace ─────────────────────────────────────────────────────
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id, role")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "No workspace found" },
        { status: 403 }
      );
    }

    const workspaceId = membership.workspace_id;

    // ── Load profile ──────────────────────────────────────────────────
    const { data: profileData } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("id", profileId)
      .eq("workspace_id", workspaceId)
      .single();

    if (!profileData) {
      return NextResponse.json(
        { error: "Profile not found in your workspace" },
        { status: 404 }
      );
    }

    const profile = profileData as BrandProfile;

    // ── Load context in parallel ──────────────────────────────────────
    const [
      { data: standards },
      { data: objectives },
      { data: definitions },
    ] = await Promise.all([
      supabase
        .from("platform_standards")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("is_active", true),
      supabase
        .from("objectives")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("is_active", true),
      supabase
        .from("definitions")
        .select("*")
        .eq("workspace_id", workspaceId),
    ]);

    // ── Build prompt & call Claude Sonnet ─────────────────────────────
    const systemPrompt = buildAdherencePrompt({
      profile,
      generatedContent: content,
      contentType,
      standards: (standards || []) as PlatformStandard[],
      objectives: (objectives || []) as Objective[],
      definitions: (definitions || []) as Definition[],
    });

    const { text } = await generateText({
      model: anthropic(MODELS.sonnet),
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: "Score the content above. Return ONLY valid JSON.",
        },
      ],
      maxOutputTokens: 2048,
      temperature: 0.2,
    });

    // ── Parse JSON response ───────────────────────────────────────────
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Adherence: no JSON in response", text.slice(0, 300));
      return NextResponse.json(
        { error: "Failed to parse adherence response" },
        { status: 502 }
      );
    }

    let rawResult: Record<string, unknown>;
    try {
      rawResult = JSON.parse(jsonMatch[0]);
    } catch {
      console.error("Adherence: invalid JSON", jsonMatch[0].slice(0, 300));
      return NextResponse.json(
        { error: "Invalid JSON from adherence model" },
        { status: 502 }
      );
    }

    // ── Normalise dimension scores ────────────────────────────────────
    const rawScores = (rawResult.scores ?? rawResult) as Record<string, unknown>;

    const scores = {} as AdherenceScore["scores"];
    for (const key of DIMENSION_KEYS) {
      scores[key] = parseDimension(rawScores[key], key);
    }

    // ── Calculate weighted overall score ──────────────────────────────
    let weightedSum = 0;
    let totalWeight = 0;
    const allFlags: AdherenceFlag[] = [];

    for (const key of DIMENSION_KEYS) {
      const dim = scores[key];
      weightedSum += dim.score * dim.weight;
      totalWeight += dim.weight;
      allFlags.push(...dim.flags);
    }

    const overallScore =
      totalWeight > 0
        ? Math.round((weightedSum / totalWeight) * 10) / 10
        : 0;

    // ── Determine pass/fail ───────────────────────────────────────────
    const threshold =
      profile.profile_data?.system_meta?.adherence_threshold ?? 7;

    // CRITICAL: compliance < 7 = automatic fail
    const complianceFail = scores.compliance.score < 7;
    const pass = !complianceFail && overallScore >= threshold;

    if (complianceFail) {
      allFlags.push({
        dimension: "compliance",
        severity: "automatic_fail",
        issue: `Compliance score ${scores.compliance.score} is below minimum threshold of 7`,
        suggestion:
          "Review compliance requirements: disclosures, prohibited language, and governance rules.",
      });
    }

    // ── Gather suggestions ────────────────────────────────────────────
    const suggestions: string[] = Array.isArray(rawResult.suggestions)
      ? rawResult.suggestions.filter((s): s is string => typeof s === "string")
      : [];

    // Add suggestion for any dimension scoring below 5
    for (const key of DIMENSION_KEYS) {
      const dim = scores[key];
      if (dim.score < 5 && dim.notes) {
        suggestions.push(`${key}: ${dim.notes}`);
      }
    }

    // ── Build response ────────────────────────────────────────────────
    const result: AdherenceScore = {
      overall_score: overallScore,
      pass,
      scores,
      flags: allFlags,
      suggestions,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Adherence API error:", error);
    return NextResponse.json(
      { error: "An error occurred scoring content adherence" },
      { status: 500 }
    );
  }
}
