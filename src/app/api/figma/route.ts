import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

// ── Types ─────────────────────────────────────────────────────────────────
interface FigmaComponent {
  id: string;
  name: string;
  type: string;
  width?: number;
  height?: number;
}

interface FigmaText {
  id: string;
  name: string;
  characters: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
}

interface FigmaLayout {
  name: string;
  type: string;
  width: number;
  height: number;
  layoutMode?: string;
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  children: number;
}

interface FigmaExtractionResult {
  frameName: string;
  components: FigmaComponent[];
  texts: FigmaText[];
  layout: FigmaLayout;
}

// ── URL Parser ────────────────────────────────────────────────────────────
function parseFigmaUrl(url: string): { fileKey: string; nodeId: string } | null {
  try {
    const parsed = new URL(url);

    // Match figma.com/design/{key}/... or figma.com/file/{key}/...
    const pathMatch = parsed.pathname.match(/\/(design|file)\/([a-zA-Z0-9]+)/);
    if (!pathMatch) return null;

    const fileKey = pathMatch[2];

    // Node ID can be in ?node-id= or &node-id=
    const nodeId = parsed.searchParams.get("node-id");
    if (!nodeId) return null;

    // Figma URL uses "123-456" but API expects "123:456"
    const apiNodeId = nodeId.replace(/-/g, ":");

    return { fileKey, nodeId: apiNodeId };
  } catch {
    return null;
  }
}

// ── Node Tree Traversal ───────────────────────────────────────────────────
function extractComponents(node: any, results: FigmaComponent[]) {
  if (!node) return;

  // Collect frames, components, instances
  if (
    node.type === "COMPONENT" ||
    node.type === "INSTANCE" ||
    node.type === "COMPONENT_SET"
  ) {
    results.push({
      id: node.id,
      name: node.name,
      type: node.type,
      width: node.absoluteBoundingBox?.width,
      height: node.absoluteBoundingBox?.height,
    });
  }

  if (node.children) {
    for (const child of node.children) {
      extractComponents(child, results);
    }
  }
}

function extractTexts(node: any, results: FigmaText[]) {
  if (!node) return;

  if (node.type === "TEXT" && node.characters) {
    results.push({
      id: node.id,
      name: node.name,
      characters: node.characters,
      fontSize: node.style?.fontSize,
      fontFamily: node.style?.fontFamily,
      fontWeight: node.style?.fontWeight,
    });
  }

  if (node.children) {
    for (const child of node.children) {
      extractTexts(child, results);
    }
  }
}

function extractLayout(node: any): FigmaLayout {
  const countChildren = (n: any): number => {
    return n.children?.length || 0;
  };

  return {
    name: node.name || "Unknown",
    type: node.type || "FRAME",
    width: node.absoluteBoundingBox?.width || 0,
    height: node.absoluteBoundingBox?.height || 0,
    layoutMode: node.layoutMode,
    primaryAxisSizingMode: node.primaryAxisSizingMode,
    counterAxisSizingMode: node.counterAxisSizingMode,
    paddingLeft: node.paddingLeft,
    paddingRight: node.paddingRight,
    paddingTop: node.paddingTop,
    paddingBottom: node.paddingBottom,
    itemSpacing: node.itemSpacing,
    children: countChildren(node),
  };
}

// ── Route Handler ─────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { figmaUrl } = (await request.json()) as { figmaUrl?: string };

    if (!figmaUrl) {
      return Response.json({ error: "figmaUrl is required" }, { status: 400 });
    }

    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse URL
    const parsed = parseFigmaUrl(figmaUrl);
    if (!parsed) {
      return Response.json(
        { error: "Invalid Figma URL. Expected format: figma.com/design/{fileKey}/...?node-id={nodeId}" },
        { status: 400 }
      );
    }

    const { fileKey, nodeId } = parsed;

    // Check for Figma access token
    const figmaToken = process.env.FIGMA_ACCESS_TOKEN;
    if (!figmaToken) {
      return Response.json(
        { error: "Figma integration not configured. Add FIGMA_ACCESS_TOKEN to environment variables." },
        { status: 503 }
      );
    }

    // Call Figma REST API
    const figmaRes = await fetch(
      `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`,
      {
        headers: {
          "X-Figma-Token": figmaToken,
        },
      }
    );

    if (!figmaRes.ok) {
      const errText = await figmaRes.text().catch(() => "");
      console.error("Figma API error:", figmaRes.status, errText);

      if (figmaRes.status === 403 || figmaRes.status === 401) {
        return Response.json(
          { error: "Figma access denied. Check your FIGMA_ACCESS_TOKEN and file permissions." },
          { status: 403 }
        );
      }
      if (figmaRes.status === 404) {
        return Response.json(
          { error: "Figma file or node not found. Verify the URL and ensure the file is accessible." },
          { status: 404 }
        );
      }
      return Response.json(
        { error: `Figma API returned ${figmaRes.status}` },
        { status: 502 }
      );
    }

    const figmaData = await figmaRes.json();

    // The response has nodes keyed by the node ID
    const nodeData = figmaData.nodes?.[nodeId];
    if (!nodeData?.document) {
      return Response.json(
        { error: "Node not found in Figma response" },
        { status: 404 }
      );
    }

    const doc = nodeData.document;

    // Extract structured data
    const components: FigmaComponent[] = [];
    const texts: FigmaText[] = [];
    extractComponents(doc, components);
    extractTexts(doc, texts);
    const layout = extractLayout(doc);

    const result: FigmaExtractionResult = {
      frameName: doc.name || "Untitled Frame",
      components,
      texts,
      layout,
    };

    return Response.json(result);
  } catch (error) {
    console.error("Figma extraction error:", error);
    return Response.json(
      { error: "Failed to extract Figma data" },
      { status: 500 }
    );
  }
}
