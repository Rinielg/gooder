import { AdCopyChannel } from "../types";
import {
  COLORS, TYPOGRAPHY,
  createText, createAutoFrame, createLibraryButton,
} from "./shared";

export async function buildAdCopy(
  channel: AdCopyChannel,
  dimensions: { width: number; height: number }
): Promise<FrameNode> {
  const root = createAutoFrame({
    name: `Ad Copy - ${channel.headline.slice(0, 30)}`,
    direction: "VERTICAL",
    width: dimensions.width,
    height: dimensions.height,
    padding: 32,
    gap: 20,
    fill: COLORS.card,
    cornerRadius: 12,
    stroke: COLORS.border,
  });

  const contentWidth = dimensions.width - 64;

  const headline = await createText({
    text: channel.headline,
    style: TYPOGRAPHY.heading2,
    color: COLORS.foreground,
    width: contentWidth,
  });
  root.appendChild(headline);

  const body = await createText({
    text: channel.body,
    style: TYPOGRAPHY.paragraph,
    color: COLORS.foreground,
    width: contentWidth,
    lineHeight: 26,
  });
  root.appendChild(body);

  const btn = await createLibraryButton(channel.cta_label);
  root.appendChild(btn);

  return root;
}
