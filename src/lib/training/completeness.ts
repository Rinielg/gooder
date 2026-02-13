import type { BrandProfileData } from "@/types";

/**
 * Calculate profile completeness as a 0–100 percentage.
 *
 * Weights:
 *   voice_identity.pillars (3+ pillars)        20%
 *   voice_identity.archetype (primary filled)   10%
 *   voice_identity.spectrum (all 5 axes)        10%
 *   tone_architecture.situational_tone_map (3+) 15%
 *   tone_architecture.tone_rules                 5%
 *   grammar_style (non-empty)                   10%
 *   lifecycle_language (1+ stages)              10%
 *   content_patterns (non-empty)                 5%
 *   channel_adaptation (non-empty)               5%
 *   governance (non-empty)                       5%
 *   system_meta.brand_name (filled)              5%
 */
export function calculateCompleteness(profileData: BrandProfileData | null | undefined): number {
  if (!profileData) return 0;

  let total = 0;

  // voice_identity.pillars — 20% (proportional to 3 required)
  const pillars = profileData.voice_identity?.pillars;
  if (pillars?.length) {
    total += Math.min(pillars.length / 3, 1) * 20;
  }

  // voice_identity.archetype — 10%
  const archetype = profileData.voice_identity?.archetype;
  if (archetype?.primary) {
    total += 10;
  }

  // voice_identity.spectrum — 10% (proportional to 5 axes)
  const spectrum = profileData.voice_identity?.spectrum;
  if (spectrum) {
    const axes = ["formality", "seriousness", "technicality", "enthusiasm", "authority"] as const;
    const filled = axes.filter((a) => typeof spectrum[a] === "number").length;
    total += (filled / 5) * 10;
  }

  // tone_architecture.situational_tone_map — 15% (proportional to 3 required)
  const tones = profileData.tone_architecture?.situational_tone_map;
  if (tones?.length) {
    total += Math.min(tones.length / 3, 1) * 15;
  }

  // tone_architecture.tone_rules — 5%
  if (profileData.tone_architecture?.tone_rules && Object.keys(profileData.tone_architecture.tone_rules).length > 0) {
    total += 5;
  }

  // grammar_style — 10%
  if (profileData.grammar_style && Object.keys(profileData.grammar_style).length > 0) {
    total += 10;
  }

  // lifecycle_language — 10% (proportional, 1+ stages)
  if (profileData.lifecycle_language && Object.keys(profileData.lifecycle_language).length > 0) {
    total += 10;
  }

  // content_patterns — 5%
  if (profileData.content_patterns && Object.keys(profileData.content_patterns).length > 0) {
    total += 5;
  }

  // channel_adaptation — 5%
  if (profileData.channel_adaptation && Object.keys(profileData.channel_adaptation).length > 0) {
    total += 5;
  }

  // governance — 5%
  if (profileData.governance && Object.keys(profileData.governance).length > 0) {
    total += 5;
  }

  // system_meta.brand_name — 5%
  if (profileData.system_meta?.brand_name) {
    total += 5;
  }

  return Math.round(total);
}
