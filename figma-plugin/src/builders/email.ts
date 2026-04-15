import { EmailChannel, EmailSection } from "../types";
import {
  COLORS, TYPOGRAPHY,
  createText, createAutoFrame, createLibraryButton, createLibrarySeparator,
} from "./shared";

async function buildSection(section: EmailSection, contentWidth: number): Promise<FrameNode> {
  const container = createAutoFrame({
    name: `Section - ${section.type}`,
    direction: "VERTICAL",
    padding: 24,
    gap: 10,
  });

  switch (section.type) {
    case "hero": {
      if (section.headline) {
        const hl = await createText({
          text: section.headline,
          style: TYPOGRAPHY.heading3,
          color: COLORS.foreground,
          width: contentWidth,
        });
        hl.textAlignHorizontal = "CENTER";
        container.appendChild(hl);
      }
      if (section.subheadline) {
        const sub = await createText({
          text: section.subheadline,
          style: TYPOGRAPHY.paragraphSmall,
          color: COLORS.mutedForeground,
          width: contentWidth,
        });
        sub.textAlignHorizontal = "CENTER";
        container.appendChild(sub);
      }
      container.counterAxisAlignItems = "CENTER";
      break;
    }
    case "body": {
      if (section.content) {
        const body = await createText({
          text: section.content,
          style: TYPOGRAPHY.paragraph,
          color: COLORS.foreground,
          width: contentWidth,
          lineHeight: 24,
        });
        container.appendChild(body);
      }
      break;
    }
    case "cta": {
      container.counterAxisAlignItems = "CENTER";
      if (section.label) {
        const btn = await createLibraryButton(section.label);
        container.appendChild(btn);
      }
      if (section.supporting_text) {
        const support = await createText({
          text: section.supporting_text,
          style: TYPOGRAPHY.caption,
          color: COLORS.mutedForeground,
          width: contentWidth,
        });
        support.textAlignHorizontal = "CENTER";
        container.appendChild(support);
      }
      break;
    }
    case "footer": {
      const sep = await createLibrarySeparator();
      container.appendChild(sep);
      if (section.content) {
        const footer = await createText({
          text: section.content,
          style: TYPOGRAPHY.caption,
          color: COLORS.mutedForeground,
          width: contentWidth,
        });
        footer.textAlignHorizontal = "CENTER";
        container.appendChild(footer);
      }
      container.counterAxisAlignItems = "CENTER";
      break;
    }
  }

  return container;
}

export async function buildEmail(
  channel: EmailChannel,
  dimensions: { width: number; height: number }
): Promise<FrameNode> {
  const root = createAutoFrame({
    name: `Email - ${channel.subject}`,
    direction: "VERTICAL",
    width: dimensions.width,
    fill: COLORS.card,
    cornerRadius: 8,
    stroke: COLORS.border,
  });

  const contentWidth = dimensions.width - 48;

  const header = createAutoFrame({
    name: "Email Header",
    direction: "VERTICAL",
    padding: 24,
    gap: 6,
  });

  const subject = await createText({
    text: channel.subject,
    style: TYPOGRAPHY.heading4,
    color: COLORS.foreground,
    width: contentWidth,
  });
  header.appendChild(subject);

  const preheader = await createText({
    text: channel.preheader,
    style: TYPOGRAPHY.paragraphSmall,
    color: COLORS.mutedForeground,
    width: contentWidth,
  });
  header.appendChild(preheader);

  root.appendChild(header);
  header.layoutSizingHorizontal = "FILL";

  const sep = await createLibrarySeparator();
  root.appendChild(sep);

  for (const section of channel.sections) {
    const sectionFrame = await buildSection(section, contentWidth);
    root.appendChild(sectionFrame);
    sectionFrame.layoutSizingHorizontal = "FILL";
  }

  return root;
}
