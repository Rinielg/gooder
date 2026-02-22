// ── Auth & Users ─────────────────────────────────────────────────────────
export type UserRole = "admin" | "editor";

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  email?: string;
}

export interface Workspace {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  settings: Record<string, unknown>;
}

// ── Brand Profiles ───────────────────────────────────────────────────────
export type ProfileStatus = "draft" | "training" | "active" | "archived";

export interface BrandProfile {
  id: string;
  workspace_id: string;
  name: string;
  status: ProfileStatus;
  completeness: number;
  profile_data: BrandProfileData;
  active_modules: string[];
  tier_config: TierConfig | null;
  training_sources: TrainingSource[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface BrandProfileData {
  system_meta?: {
    template_version: string;
    brand_name: string;
    compliance_mode: "standard" | "elevated" | "strict";
    adherence_threshold: number;
  };
  voice_identity?: {
    pillars: VoicePillar[];
    archetype: {
      primary: string;
      secondary: string;
      description: string;
      sounds_like: string;
      never_sounds_like: string;
    };
    spectrum: {
      formality: number;
      seriousness: number;
      technicality: number;
      enthusiasm: number;
      authority: number;
    };
  };
  tone_architecture?: {
    situational_tone_map: SituationalTone[];
    emotional_gradient: Record<string, string>;
    tone_rules: Record<string, unknown>;
  };
  lifecycle_language?: Record<string, LifecycleStage>;
  content_patterns?: Record<string, unknown>;
  grammar_style?: Record<string, unknown>;
  channel_adaptation?: Record<string, unknown>;
  governance?: Record<string, unknown>;
  module_configurations?: Record<string, unknown>[];
}

export interface VoicePillar {
  name: string;
  meaning: string;
  sounds_like: string;
  anti_pattern: string;
  dial_range: string;
  example_good: string;
  example_bad: string;
}

export interface SituationalTone {
  situation: string;
  default_tone: string;
  leading_pillar: string;
  guidance: string;
}

export interface LifecycleStage {
  stage: string;
  relationship: string;
  priorities: string[];
  principles: string[];
  sample_good: string;
  sample_bad: string;
}

export interface TierConfig {
  enabled: boolean;
  tier_count: number;
  tiers: TierDefinition[];
  global_rules: Record<string, string>;
}

export interface TierDefinition {
  name: string;
  internal_id: string;
  position: number;
  description: string;
  modulation_settings: Record<string, string>;
  language_examples: Record<string, string>;
}

export interface TrainingSource {
  type: "document" | "questionnaire";
  document_id?: string;
  file_name?: string;
  fields_populated: string[];
  created_at: string;
}

// ── Training Documents ───────────────────────────────────────────────────
export type ProcessingStatus = "pending" | "processing" | "complete" | "error";

export interface TrainingDocument {
  id: string;
  brand_profile_id: string;
  workspace_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  extracted_content: Record<string, unknown> | null;
  processing_status: ProcessingStatus;
  created_at: string;
  created_by: string;
}

// ── Platform Standards ───────────────────────────────────────────────────
export type StandardType = "predefined" | "custom";
export type StandardCategory = "all" | "ux_journey" | "email" | "sms" | "push" | "general";

export interface PlatformStandard {
  id: string;
  workspace_id: string;
  name: string;
  type: StandardType;
  category: StandardCategory;
  content: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Objectives ───────────────────────────────────────────────────────────
export interface Objective {
  id: string;
  workspace_id: string;
  title: string;
  description: string;
  priority: number;
  is_active: boolean;
  created_at: string;
}

// ── Definitions ──────────────────────────────────────────────────────────
export interface Definition {
  id: string;
  workspace_id: string;
  term: string;
  definition: string;
  created_at: string;
  updated_at: string;
}

// ── Structured Output Schema ─────────────────────────────────────────────
// The typed tree returned by the Output Agent as a JSON string.
// Parse with: const output: StructuredOutput = JSON.parse(message.content)

export type ChannelType = "email" | "sms" | "push_notification" | "ux_journey" | "ad_copy";
export type TierLabel = "Classic" | "Plus" | "VIP";

export interface EmailSection {
  type: "hero" | "body" | "cta" | "footer";
  headline?: string;
  subheadline?: string;
  content?: string;
  label?: string;
  supporting_text?: string;
}

export interface EmailChannel {
  type: "email";
  tier: TierLabel | null;
  subject: string;
  preheader: string;
  sections: EmailSection[];
}

export interface SMSChannel {
  type: "sms";
  tier: TierLabel | null;
  message: string;
  character_count: number;
}

export interface PushChannel {
  type: "push_notification";
  tier: TierLabel | null;
  title: string;
  body: string;
  deep_link_label: string | null;
}

export interface UXJourneyStep {
  step: number;
  screen_name: string;
  heading: string | null;
  body_copy: string;
  cta_label: string | null;
  helper_text: string | null;
  error_text: string | null;
}

export interface UXJourneyChannel {
  type: "ux_journey";
  tier: TierLabel | null;
  journey_name: string;
  steps: UXJourneyStep[];
}

export interface AdCopyChannel {
  type: "ad_copy";
  tier: TierLabel | null;
  headline: string;
  body: string;
  cta_label: string;
}

export type Channel =
  | EmailChannel
  | SMSChannel
  | PushChannel
  | UXJourneyChannel
  | AdCopyChannel;

export interface ToneDecision {
  lifecycle_stage: string;
  situation: string;
  tier: string | null;
  emotional_gradient: string;
  conflict_resolution_applied: string | null;
}

export interface SelfScore {
  overall: number;
  voice_alignment: number;
  tone_match: number;
  tier_compliance: number | null;
  terminology: number;
  readability: number;
  channel_compliance: number;
  lifecycle_fit: number;
  module_compliance: number;
  reasoning: string;
}

export interface OutputObjectiveScore {
  objective: string;
  score: number;
  reasoning: string;
}

/**
 * The complete structured response from the Output Agent.
 * message.content on the frontend is a JSON string matching this interface.
 */
export interface StructuredOutput {
  channels: Channel[];
  tone_decision: ToneDecision;
  self_score: SelfScore;
  objective_scores: OutputObjectiveScore[];
  suggestions: string[];
  compliance_notes: string[];
}

// ── Saved Outputs ────────────────────────────────────────────────────────
export type OutputType = "ux_journey" | "email" | "sms" | "push";

export interface SavedOutput {
  id: string;
  workspace_id: string;
  brand_profile_id: string | null;
  type: OutputType;
  title: string;
  content: GeneratedContent;
  adherence_score: AdherenceScore | null;
  objective_scores: ObjectiveScore[] | null;
  metadata: Record<string, unknown>;
  created_at: string;
  created_by: string;
}

export interface GeneratedContent {
  raw: string;
  structured?: Record<string, unknown>;
  variants?: string[];
}

// ── Adherence Scoring ────────────────────────────────────────────────────
export interface DimensionScore {
  score: number; // 0–10
  weight: number;
  flags: AdherenceFlag[];
  notes: string;
}

export interface AdherenceScore {
  overall_score: number;
  pass: boolean;
  scores: {
    voice_consistency: DimensionScore;
    tone_accuracy: DimensionScore;
    compliance: DimensionScore;
    terminology: DimensionScore;
    platform_optimization: DimensionScore;
    objective_alignment: DimensionScore;
    pattern_adherence: DimensionScore;
    overall_quality: DimensionScore;
  };
  flags: AdherenceFlag[];
  suggestions: string[];
}

export interface AdherenceFlag {
  dimension: string;
  severity: "info" | "warning" | "fail" | "automatic_fail";
  issue: string;
  suggestion: string;
}

export interface ObjectiveScore {
  objective_id: string;
  objective_title: string;
  score: number;
  reasoning: string;
}

// ── Chat ─────────────────────────────────────────────────────────────────
export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  created_at: string;
  metadata?: {
    content_type?: OutputType;
    adherence_score?: AdherenceScore;
    objective_scores?: ObjectiveScore[];
    model_used?: string;
    is_saved?: boolean;
  };
}

export type ContentTypeDetection = "ux_journey" | "email" | "sms" | "push" | "unknown";

// ── AI Model Config ──────────────────────────────────────────────────────
export type AIModel = "claude-sonnet-4-5-20250929" | "claude-opus-4-6";

export interface ModelConfig {
  id: AIModel;
  name: string;
  description: string;
  costTier: "standard" | "premium";
}

export const AI_MODELS: ModelConfig[] = [
  {
    id: "claude-sonnet-4-5-20250929",
    name: "Claude Sonnet 4.5",
    description: "Fast and efficient for routine tasks",
    costTier: "standard",
  },
  {
    id: "claude-opus-4-6",
    name: "Claude Opus 4.6",
    description: "Maximum capability for complex generation",
    costTier: "premium",
  },
];
