import type { BrandProfileData, VoicePillar, SituationalTone } from "@/types";

/**
 * Merge extracted profile data into an existing profile.
 *
 * Rules:
 * - Empty/null existing fields → use extracted
 * - Arrays (pillars, tones) → merge & deduplicate by name/situation
 * - Objects (archetype, spectrum) → keep existing, fill missing sub-fields
 * - Primitives → keep existing (user manual input takes priority)
 * - Never overwrite a populated field with null/undefined
 */
export function mergeProfileData(
  existing: BrandProfileData,
  extracted: Partial<BrandProfileData>
): BrandProfileData {
  const result: BrandProfileData = { ...existing };

  // ── system_meta ─────────────────────────────────────────────────────
  if (extracted.system_meta) {
    result.system_meta = mergeObject(existing.system_meta, extracted.system_meta) as BrandProfileData["system_meta"];
  }

  // ── voice_identity ──────────────────────────────────────────────────
  if (extracted.voice_identity) {
    const existVi = existing.voice_identity;
    const extVi = extracted.voice_identity;

    result.voice_identity = {
      pillars: mergeArrayByKey<VoicePillar>(
        existVi?.pillars,
        extVi.pillars,
        "name"
      ),
      archetype: mergeObject(existVi?.archetype, extVi.archetype) as BrandProfileData["voice_identity"] extends undefined ? never : NonNullable<BrandProfileData["voice_identity"]>["archetype"],
      spectrum: mergeObject(existVi?.spectrum, extVi.spectrum) as BrandProfileData["voice_identity"] extends undefined ? never : NonNullable<BrandProfileData["voice_identity"]>["spectrum"],
    };
  }

  // ── tone_architecture ───────────────────────────────────────────────
  if (extracted.tone_architecture) {
    const existTa = existing.tone_architecture;
    const extTa = extracted.tone_architecture;

    result.tone_architecture = {
      situational_tone_map: mergeArrayByKey<SituationalTone>(
        existTa?.situational_tone_map,
        extTa.situational_tone_map,
        "situation"
      ),
      emotional_gradient: mergeObject(
        existTa?.emotional_gradient,
        extTa.emotional_gradient
      ) as Record<string, string>,
      tone_rules: mergeObject(
        existTa?.tone_rules,
        extTa.tone_rules
      ) as Record<string, unknown>,
    };
  }

  // ── Simple object fields — fill if empty ────────────────────────────
  if (extracted.lifecycle_language) {
    result.lifecycle_language = mergeObject(
      existing.lifecycle_language,
      extracted.lifecycle_language
    ) as BrandProfileData["lifecycle_language"];
  }

  if (extracted.grammar_style) {
    result.grammar_style = mergeObject(
      existing.grammar_style,
      extracted.grammar_style
    ) as BrandProfileData["grammar_style"];
  }

  if (extracted.content_patterns) {
    result.content_patterns = mergeObject(
      existing.content_patterns,
      extracted.content_patterns
    ) as BrandProfileData["content_patterns"];
  }

  if (extracted.channel_adaptation) {
    result.channel_adaptation = mergeObject(
      existing.channel_adaptation,
      extracted.channel_adaptation
    ) as BrandProfileData["channel_adaptation"];
  }

  if (extracted.governance) {
    result.governance = mergeObject(
      existing.governance,
      extracted.governance
    ) as BrandProfileData["governance"];
  }

  return result;
}

/**
 * Merge two arrays by a key field, deduplicating by that key.
 * Existing items take priority — if both arrays have an item with the same key,
 * the existing item is kept.
 */
function mergeArrayByKey<T extends { [K: string]: any }>(
  existing: T[] | undefined,
  incoming: T[] | undefined,
  key: keyof T & string
): T[] {
  if (!incoming?.length) return existing || [];
  if (!existing?.length) return incoming;

  const existingKeys = new Set(existing.map((item) => String(item[key]).toLowerCase()));
  const newItems = incoming.filter(
    (item) => !existingKeys.has(String(item[key]).toLowerCase())
  );

  return [...existing, ...newItems];
}

/**
 * Merge two plain objects. Existing non-null values take priority.
 * Fills in missing keys from the incoming object.
 */
function mergeObject(
  existing: Record<string, unknown> | null | undefined,
  incoming: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  if (!incoming) return existing || {};
  if (!existing || Object.keys(existing).length === 0) return { ...incoming };

  const result = { ...existing };
  for (const [key, value] of Object.entries(incoming)) {
    if (value == null) continue;
    if (result[key] == null || result[key] === "" || result[key] === 0) {
      result[key] = value;
    }
  }
  return result;
}
