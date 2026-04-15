import { PushChannel } from "../types";
import {
  COLORS, TYPOGRAPHY,
  createText, createAutoFrame,
} from "./shared";

export async function buildPush(
  channel: PushChannel,
  dimensions: { width: number; height: number }
): Promise<FrameNode> {
  const root = createAutoFrame({
    name: `Push - ${channel.title}`,
    direction: "VERTICAL",
    width: dimensions.width,
    height: dimensions.height,
    padding: 16,
    gap: 12,
    fill: COLORS.iosGray,
  });

  const spacer = figma.createRectangle();
  spacer.name = "Spacer";
  spacer.resize(1, 60);
  spacer.fills = [];
  root.appendChild(spacer);

  const card = createAutoFrame({
    name: "Notification Card",
    direction: "VERTICAL",
    padding: 14,
    gap: 6,
    fill: COLORS.card,
    cornerRadius: 16,
  });
  card.strokes = [{ type: "SOLID", color: COLORS.border }];
  card.strokeWeight = 1;

  const appRow = createAutoFrame({
    name: "App Row",
    direction: "HORIZONTAL",
    gap: 6,
  });
  appRow.counterAxisAlignItems = "CENTER";

  const icon = figma.createRectangle();
  icon.name = "App Icon";
  icon.resize(20, 20);
  icon.cornerRadius = 5;
  icon.fills = [{ type: "SOLID", color: COLORS.primary }];
  appRow.appendChild(icon);

  const appName = await createText({
    text: "Gooder",
    style: TYPOGRAPHY.caption,
    color: COLORS.mutedForeground,
  });
  appRow.appendChild(appName);

  const time = await createText({
    text: "now",
    style: TYPOGRAPHY.caption,
    color: COLORS.mutedForeground,
  });
  appRow.appendChild(time);

  card.appendChild(appRow);
  appRow.layoutSizingHorizontal = "FILL";

  const title = await createText({
    text: channel.title,
    style: TYPOGRAPHY.paragraphSmallMed,
    color: COLORS.foreground,
    width: dimensions.width - 60,
  });
  card.appendChild(title);

  const body = await createText({
    text: channel.body,
    style: TYPOGRAPHY.paragraphSmall,
    color: COLORS.mutedForeground,
    width: dimensions.width - 60,
    lineHeight: 20,
  });
  card.appendChild(body);

  if (channel.deep_link_label) {
    const link = await createText({
      text: `${channel.deep_link_label} \u2192`,
      style: TYPOGRAPHY.paragraphSmallMed,
      color: COLORS.primary,
    });
    card.appendChild(link);
  }

  root.appendChild(card);
  card.layoutSizingHorizontal = "FILL";
  return root;
}
