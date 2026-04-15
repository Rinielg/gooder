import { ExportPayload } from "./types";
import { buildUXJourney } from "./builders/ux-journey";
import { buildEmail } from "./builders/email";
import { buildSMS } from "./builders/sms";
import { buildPush } from "./builders/push";
import { buildAdCopy } from "./builders/ad-copy";

figma.showUI(__html__, { width: 360, height: 320 });

async function loadFonts() {
  const fonts: FontName[] = [
    // Inter — used by raw text nodes
    { family: "Inter", style: "Regular" },
    { family: "Inter", style: "Medium" },
    { family: "Inter", style: "Semi Bold" },
    { family: "Inter", style: "Bold" },
    // Geist — used by Gooder-Shadcn-ui library components
    { family: "Geist", style: "Regular" },
    { family: "Geist", style: "Medium" },
    { family: "Geist", style: "SemiBold" },
    { family: "Geist", style: "Bold" },
    { family: "Geist", style: "Light" },
  ];

  for (const font of fonts) {
    try {
      await figma.loadFontAsync(font);
    } catch {
      console.warn(`Could not load font: ${font.family} ${font.style}`);
    }
  }
}

figma.ui.onmessage = async (msg: { type: string; payload?: ExportPayload }) => {
  if (msg.type === "create-frames" && msg.payload) {
    const { channel, dimensions, channelType } = msg.payload;

    try {
      await loadFonts();

      let framesToView: SceneNode[];

      if (channelType === "ux_journey") {
        // UX journeys return separate frames per step, positioned side by side
        const stepFrames = await buildUXJourney(channel as any, dimensions);
        for (const frame of stepFrames) {
          figma.currentPage.appendChild(frame);
        }
        framesToView = stepFrames;
      } else {
        let rootFrame: FrameNode;

        switch (channelType) {
          case "email":
            rootFrame = await buildEmail(channel as any, dimensions);
            break;
          case "sms":
            rootFrame = await buildSMS(channel as any, dimensions);
            break;
          case "push_notification":
            rootFrame = await buildPush(channel as any, dimensions);
            break;
          case "ad_copy":
            rootFrame = await buildAdCopy(channel as any, dimensions);
            break;
          default:
            figma.ui.postMessage({ type: "error", message: `Unknown channel type: ${channelType}` });
            return;
        }

        figma.currentPage.appendChild(rootFrame);
        framesToView = [rootFrame];
      }

      figma.viewport.scrollAndZoomIntoView(framesToView);

      figma.ui.postMessage({ type: "done" });
      figma.notify("Frames created successfully!");
    } catch (err: any) {
      console.error("Frame creation error:", err);
      const detail = err?.message || err?.toString() || "Unknown error";
      figma.ui.postMessage({ type: "error", message: `Failed to create frames: ${detail}` });
    }
  }

  if (msg.type === "close") {
    figma.closePlugin();
  }
};
