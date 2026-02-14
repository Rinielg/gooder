import { anthropic } from "@ai-sdk/anthropic";
import type { AIModel, ContentTypeDetection } from "@/types";

export const MODELS = {
  sonnet: "claude-sonnet-4-5-20250929" as const,
  opus: "claude-opus-4-6" as const,
};

export function getModel(modelId: AIModel) {
  return anthropic(modelId);
}

/**
 * Select the model for a given task.
 * Currently: Sonnet 4.5 for all tasks.
 *
 * To re-enable intelligent routing, uncomment the block below
 * and change the complex tasks return to MODELS.opus.
 */
export function selectModelForTask(taskType: string): AIModel {
  return MODELS.sonnet;

  /* RE-ENABLE INTELLIGENT ROUTING:
  const complexTasks = [
    "full_ux_journey",
    "email_campaign",
    "multi_variant",
    "complex_generation",
    "multi_tier_content",
  ];

  if (complexTasks.includes(taskType)) {
    return MODELS.opus;
  }

  return MODELS.sonnet;
  */
}

/**
 * Detect the content type from a user message.
 */
export function detectContentType(message: string): ContentTypeDetection {
  const lower = message.toLowerCase();

  if (/\b(ux|user experience|journey|flow|screen|page|onboarding|checkout|form|modal|tooltip|empty state|error state)\b/.test(lower)) {
    return "ux_journey";
  }
  if (/\b(email|emailer|subject line|preheader|newsletter|campaign)\b/.test(lower)) {
    return "email";
  }
  if (/\b(sms|text message|160 char)\b/.test(lower)) {
    return "sms";
  }
  if (/\b(push notification|push copy|notification)\b/.test(lower)) {
    return "push";
  }

  if (/figma\.com/.test(lower)) {
    return "ux_journey";
  }

  return "unknown";
}

/**
 * Determine task complexity from the message and detected type.
 */
export function classifyTaskComplexity(
  message: string,
  contentType: ContentTypeDetection
): string {
  const lower = message.toLowerCase();

  if (/\b(journey|flow|full|complete|end.to.end|multi|several|all screens)\b/.test(lower)) {
    return "full_ux_journey";
  }

  if (/\b(campaign|series|sequence|drip|lifecycle)\b/.test(lower)) {
    return "email_campaign";
  }

  if (/\b(variant|version|a\/b|alternative|option)\b/.test(lower)) {
    return "multi_variant";
  }

  if (/\b(button|cta|heading|title|label|placeholder|tooltip)\b/.test(lower)) {
    return "single_element";
  }

  if (contentType === "sms") return "sms_copy";
  if (contentType === "push") return "push_copy";
  if (contentType === "email") return "complex_generation";
  if (contentType === "ux_journey") return "complex_generation";

  return "complex_generation";
}