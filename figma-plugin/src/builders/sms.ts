import { SMSChannel } from "../types";
import {
  COLORS, TYPOGRAPHY,
  createText, createAutoFrame,
} from "./shared";

export async function buildSMS(
  channel: SMSChannel,
  dimensions: { width: number; height: number }
): Promise<FrameNode> {
  const root = createAutoFrame({
    name: "SMS",
    direction: "VERTICAL",
    width: dimensions.width,
    height: dimensions.height,
    padding: 16,
    gap: 8,
    fill: COLORS.iosGray,
  });
  root.primaryAxisAlignItems = "MAX";

  const bubbleWidth = Math.min(Math.round(dimensions.width * 0.75), 300);
  const bubble = createAutoFrame({
    name: "Message Bubble",
    direction: "VERTICAL",
    padding: 12,
    fill: COLORS.primary,
    cornerRadius: 18,
  });
  bubble.topRightRadius = 18;
  bubble.topLeftRadius = 18;
  bubble.bottomLeftRadius = 18;
  bubble.bottomRightRadius = 4;

  const msg = await createText({
    text: channel.message,
    style: TYPOGRAPHY.paragraphSmall,
    color: COLORS.primaryForeground,
    width: bubbleWidth - 24,
    lineHeight: 20,
  });
  bubble.appendChild(msg);

  const bubbleRow = createAutoFrame({
    name: "Bubble Row",
    direction: "HORIZONTAL",
  });
  bubbleRow.primaryAxisAlignItems = "MAX";
  bubbleRow.appendChild(bubble);
  root.appendChild(bubbleRow);
  bubbleRow.layoutSizingHorizontal = "FILL";

  const count = channel.character_count ?? channel.message.length;
  const limit = 160;
  const countColor = count > limit ? COLORS.destructive : count > limit * 0.9 ? { r: 0.85, g: 0.65, b: 0.15 } as RGB : COLORS.mutedForeground;

  const charCount = await createText({
    text: `${count}/${limit} characters`,
    style: TYPOGRAPHY.caption,
    color: countColor,
  });
  const countRow = createAutoFrame({
    name: "Count Row",
    direction: "HORIZONTAL",
  });
  countRow.primaryAxisAlignItems = "MAX";
  countRow.appendChild(charCount);
  root.appendChild(countRow);
  countRow.layoutSizingHorizontal = "FILL";

  return root;
}
