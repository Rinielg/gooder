import { UXJourneyChannel, UXJourneyStep } from "../types";
import {
  COLORS, TYPOGRAPHY,
  createText, createAutoFrame,
  createLibraryButton, createLibraryBadge, createLibraryAlert,
  setFirstText,
} from "./shared";

async function createStepFrame(
  step: UXJourneyStep,
  journeyName: string,
  totalSteps: number,
  width: number,
  height: number,
): Promise<FrameNode> {
  const frame = createAutoFrame({
    name: `${journeyName} - Step ${step.step}: ${step.screen_name}`,
    direction: "VERTICAL",
    width,
    height,
    fill: COLORS.background,
  });

  // Header area with journey context
  const header = createAutoFrame({
    name: "Header",
    direction: "VERTICAL",
    padding: 20,
    gap: 8,
    fill: COLORS.card,
  });
  header.paddingBottom = 16;

  // Journey name + step indicator row
  const titleRow = createAutoFrame({
    name: "Title Row",
    direction: "HORIZONTAL",
    gap: 8,
  });
  titleRow.counterAxisAlignItems = "CENTER";

  const badge = await createLibraryBadge(`${step.step}/${totalSteps}`, "default");
  titleRow.appendChild(badge);

  const journeyLabel = await createText({
    text: journeyName,
    style: TYPOGRAPHY.captionMedium,
    color: COLORS.mutedForeground,
  });
  titleRow.appendChild(journeyLabel);
  header.appendChild(titleRow);

  // Screen name as heading
  const screenName = await createText({
    text: step.screen_name,
    style: TYPOGRAPHY.heading4,
    color: COLORS.foreground,
    width: width - 40,
  });
  header.appendChild(screenName);

  frame.appendChild(header);
  header.layoutSizingHorizontal = "FILL";

  // Content area
  const content = createAutoFrame({
    name: "Content",
    direction: "VERTICAL",
    padding: 20,
    gap: 16,
  });

  if (step.heading) {
    const heading = await createText({
      text: step.heading,
      style: TYPOGRAPHY.paragraphLarge,
      color: COLORS.foreground,
      width: width - 40,
    });
    content.appendChild(heading);
  }

  const body = await createText({
    text: step.body_copy,
    style: TYPOGRAPHY.paragraph,
    color: COLORS.foreground,
    width: width - 40,
    lineHeight: 24,
  });
  content.appendChild(body);

  if (step.helper_text) {
    const helper = await createText({
      text: step.helper_text,
      style: TYPOGRAPHY.caption,
      color: COLORS.mutedForeground,
      width: width - 40,
    });
    content.appendChild(helper);
  }

  if (step.error_text) {
    const alert = await createLibraryAlert("error");
    if (alert.type === "INSTANCE") {
      await setFirstText(alert as InstanceNode, step.error_text);
    } else if (alert.type === "FRAME") {
      const errorText = await createText({
        text: step.error_text,
        style: TYPOGRAPHY.caption,
        color: COLORS.destructive,
        width: width - 64,
      });
      (alert as FrameNode).appendChild(errorText);
    }
    content.appendChild(alert);
  }

  frame.appendChild(content);
  content.layoutSizingHorizontal = "FILL";

  // Footer with CTA
  if (step.cta_label) {
    const footer = createAutoFrame({
      name: "Footer",
      direction: "VERTICAL",
      padding: 20,
    });
    const btn = await createLibraryButton(step.cta_label);
    footer.appendChild(btn);
    frame.appendChild(footer);
    footer.layoutSizingHorizontal = "FILL";
  }

  return frame;
}

export async function buildUXJourney(
  channel: UXJourneyChannel,
  dimensions: { width: number; height: number }
): Promise<FrameNode[]> {
  const frames: FrameNode[] = [];
  const gap = 40;

  for (let i = 0; i < channel.steps.length; i++) {
    const frame = await createStepFrame(
      channel.steps[i],
      channel.journey_name,
      channel.steps.length,
      dimensions.width,
      dimensions.height,
    );
    frame.x = i * (dimensions.width + gap);
    frame.y = 0;
    frames.push(frame);
  }

  return frames;
}
