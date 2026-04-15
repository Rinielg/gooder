// ── Design Tokens ────────────────────────────────────────────────────────
// Derived from globals.css HSL values, converted to Figma RGB (0-1 range)
// Source: src/app/globals.css :root block

function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return { r: f(0), g: f(8), b: f(4) };
}

export const COLORS = {
  background:             hslToRgb(0, 0, 100),        // --background
  foreground:             hslToRgb(240, 10, 3.9),      // --foreground
  card:                   hslToRgb(0, 0, 100),          // --card
  cardForeground:         hslToRgb(240, 10, 3.9),      // --card-foreground
  primary:                hslToRgb(238, 76, 59),        // --primary
  primaryForeground:      hslToRgb(0, 0, 100),          // --primary-foreground
  secondary:              hslToRgb(240, 4.8, 95.9),     // --secondary
  secondaryForeground:    hslToRgb(240, 5.9, 10),       // --secondary-foreground
  muted:                  hslToRgb(240, 4.8, 95.9),     // --muted
  mutedForeground:        hslToRgb(240, 3.8, 46.1),     // --muted-foreground
  accent:                 hslToRgb(240, 4.8, 95.9),     // --accent
  accentForeground:       hslToRgb(240, 5.9, 10),       // --accent-foreground
  destructive:            hslToRgb(0, 84.2, 60.2),      // --destructive
  destructiveForeground:  hslToRgb(0, 0, 98),           // --destructive-foreground
  border:                 hslToRgb(240, 5.9, 90),        // --border
  white:                  { r: 1, g: 1, b: 1 },
  // iOS-specific (for SMS/push mockups)
  iosGray:                hslToRgb(240, 10, 96),
};

// ── Typography ──────────────────────────────────────────────────────────
// Mapped from design-system.md typography table
// Tailwind text sizes: text-4xl=36, text-3xl=30, text-2xl=24, text-xl=20,
//   text-lg=18, text-base=16, text-sm=14, text-xs=12

// Fallback fonts (used only when library text styles fail to load)
export const FONT: FontName =       { family: "Inter", style: "Regular" };
export const FONT_MEDIUM: FontName = { family: "Inter", style: "Medium" };
export const FONT_SEMIBOLD: FontName = { family: "Inter", style: "Semi Bold" };
export const FONT_BOLD: FontName =   { family: "Inter", style: "Bold" };

// ── Library Text Style Keys ─────────────────────────────────────────────
// Source: Figma file KzW4GoFpnpPoz8nAvLJr9B text styles
const TEXT_STYLE_KEYS = {
  heading1:          "e14186f7cdc886baaf3d94af0a2cb702b182438f",
  heading2:          "e8fad3236116bfc9e21a09434775bb76d0ecd308",
  heading3:          "6da99e00912715fbc50a08dcf4d798a7255f73b1",
  heading4:          "da7eb6eda61070212657faa19cf8f942dbd51fa4",
  paragraphLarge:    "c54ce9c290ce43758087c8ab74656fa77ec3f93d",
  paragraphLargeMed: "474211241e9ae86d10680b35b99d42a4ff339860",
  paragraphLargeBold:"38e737849f3db67aa5905a16aabfe6e48f7158ca",
  paragraph:         "23f27e16dcdee4bb9941f27c688dc0334e956dc5",
  paragraphMedium:   "f21c39a5324882cc50290954d17c271cb9f7a3e6",
  paragraphBold:     "22c06f5ef707c42867c466ea232ee0def180457d",
  paragraphSmall:    "8589e9130d837a3d008e9b6ac190ec221b607449",
  paragraphSmallMed: "e0f6d4413713a47be3d392b77d02e5cfea7823b5",
  paragraphSmallBold:"db3c480a3239ff4b08035db3fec83f6d857d369a",
  caption:           "80ea039c86b0e6692b04ee7f74f924b4ffbd936d",
  captionMedium:     "a0d573b3d9323b4c8d55bff8769d5c0ed2372423",
  captionBold:       "da214aa3912e1de8286172e68a6df224a663c599",
  monospaced:        "853665c1e0d739529a18d5651004e1778d7f8e07",
};

// Cache for imported text styles
const textStyleCache = new Map<string, TextStyle>();

async function importTextStyle(key: string): Promise<TextStyle | null> {
  try {
    let style = textStyleCache.get(key);
    if (!style) {
      style = await figma.importStyleByKeyAsync(key) as TextStyle;
      textStyleCache.set(key, style);
    }
    return style;
  } catch {
    return null;
  }
}

// Fallback typography (only used when library styles fail)
const FALLBACK_TYPOGRAPHY: Record<string, { fontSize: number; fontName: FontName }> = {
  heading1:          { fontSize: 36, fontName: FONT_BOLD },
  heading2:          { fontSize: 30, fontName: FONT_SEMIBOLD },
  heading3:          { fontSize: 24, fontName: FONT_SEMIBOLD },
  heading4:          { fontSize: 20, fontName: FONT_SEMIBOLD },
  paragraphLarge:    { fontSize: 18, fontName: FONT },
  paragraphLargeMed: { fontSize: 18, fontName: FONT_MEDIUM },
  paragraphLargeBold:{ fontSize: 18, fontName: FONT_BOLD },
  paragraph:         { fontSize: 16, fontName: FONT },
  paragraphMedium:   { fontSize: 16, fontName: FONT_MEDIUM },
  paragraphBold:     { fontSize: 16, fontName: FONT_BOLD },
  paragraphSmall:    { fontSize: 14, fontName: FONT },
  paragraphSmallMed: { fontSize: 14, fontName: FONT_MEDIUM },
  paragraphSmallBold:{ fontSize: 14, fontName: FONT_BOLD },
  caption:           { fontSize: 12, fontName: FONT },
  captionMedium:     { fontSize: 12, fontName: FONT_MEDIUM },
  captionBold:       { fontSize: 12, fontName: FONT_BOLD },
  monospaced:        { fontSize: 14, fontName: { family: "Inter", style: "Regular" } },
};

// The public TYPOGRAPHY object — used by builders via spread: ...TYPOGRAPHY.heading3
// Each entry is a style name string that createText resolves at runtime
export const TYPOGRAPHY = {
  heading1:          "heading1",
  heading2:          "heading2",
  heading3:          "heading3",
  heading4:          "heading4",
  paragraphLarge:    "paragraphLarge",
  paragraphLargeMed: "paragraphLargeMed",
  paragraph:         "paragraph",
  paragraphMedium:   "paragraphMedium",
  paragraphSmall:    "paragraphSmall",
  paragraphSmallMed: "paragraphSmallMed",
  paragraphSmallBold:"paragraphSmallBold",
  caption:           "caption",
  captionMedium:     "captionMedium",
} as const;

// ── Gooder-Shadcn-ui Library Component Keys ──────────────────────────────
// Source: Figma file KzW4GoFpnpPoz8nAvLJr9B
export const COMPONENT_KEYS = {
  // Button — Figma "Primary" = design system "default"
  button_default:    "82670a0b37ee6646194a815f201b7a5499ff1ea0",
  button_default_sm: "068689e237f0f3122629668b14dc040a589cd327",
  button_outline:    "beb337cb443ad797469728c5723ebd057ad95d64",
  // Badge
  badge_default:     "5d62fb1acf49864c83ba0f1bcb8faaa2a8fd9ddb",
  badge_outline:     "b5bcc3227b8625b6fbdb6c471f011b4d66bcd4aa",
  badge_secondary:   "efa6a7d8c45cf0e2214e7d44cc7f3d961a0714dd",
  // Card
  card_3slot:        "b3587a8023065df562d103343729ae74aeb5724e",
  card_2slot:        "e2840e732b714b4bbbcdbb3f936327db3de999e3",
  card_1slot:        "9445dc3f6f23c3b467006eb3fc20e8443d0119ca",
  // Other
  separator_h:       "043d20481bf3e474605a8054b31c6a82ab2401e4",
  label:             "767024fd4a719826852b7a0730bcb31131640f36",
  alert_neutral:     "bb65483656c11f2b92ad181cc3e62aa9af51d713",
  alert_error:       "baf135a10b49febe7949c7f96e3bfee9b8e39ef7",
};

// Cache imported components to avoid re-importing
const componentCache = new Map<string, ComponentNode>();

export async function importComponent(key: string): Promise<InstanceNode | null> {
  try {
    let component = componentCache.get(key);
    if (!component) {
      component = await figma.importComponentByKeyAsync(key);
      componentCache.set(key, component);
    }
    return component.createInstance();
  } catch (err) {
    console.warn(`Failed to import component ${key}:`, err);
    return null;
  }
}

// Helper to safely load font and set text on a node
async function safeSetText(node: TextNode, text: string): Promise<void> {
  try {
    const fontName = node.fontName as FontName;
    await figma.loadFontAsync(fontName);
    node.characters = text;
  } catch {
    // If the specific font fails, try Inter Regular as fallback
    try {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      node.fontName = { family: "Inter", style: "Regular" };
      node.characters = text;
    } catch {
      console.warn("Could not set text — font loading failed");
    }
  }
}

// Helper to set text on a named text child
export async function setInstanceText(instance: InstanceNode, childName: string, text: string): Promise<void> {
  const node = instance.findOne((n) => n.name === childName && n.type === "TEXT") as TextNode | null;
  if (node) {
    await safeSetText(node, text);
  }
}

// Helper to set text on the first text node found
export async function setFirstText(instance: InstanceNode, text: string): Promise<void> {
  const node = instance.findOne((n) => n.type === "TEXT") as TextNode | null;
  if (node) {
    await safeSetText(node, text);
  }
}

// ── Library component creators ──────────────────────────────────────────

export async function createLibraryButton(label: string, variant: "default" | "outline" = "default"): Promise<SceneNode> {
  const key = variant === "outline" ? COMPONENT_KEYS.button_outline : COMPONENT_KEYS.button_default;
  const instance = await importComponent(key);
  if (instance) {
    await setFirstText(instance, label);
    return instance;
  }
  // Fallback: create a raw button frame
  const btn = createAutoFrame({
    name: "Button",
    direction: "HORIZONTAL",
    padding: 12,
    fill: variant === "outline" ? COLORS.background : COLORS.primary,
    cornerRadius: 9999,
    stroke: variant === "outline" ? COLORS.border : undefined,
  });
  btn.paddingLeft = 24;
  btn.paddingRight = 24;
  btn.primaryAxisAlignItems = "CENTER";
  btn.counterAxisAlignItems = "CENTER";
  const text = await createText({
    text: label,
    style: TYPOGRAPHY.paragraphSmallMed,
    color: variant === "outline" ? COLORS.foreground : COLORS.primaryForeground,
  });
  btn.appendChild(text);
  return btn;
}

export async function createLibraryBadge(label: string, variant: "default" | "outline" | "secondary" = "outline"): Promise<SceneNode> {
  const keyMap = {
    default: COMPONENT_KEYS.badge_default,
    outline: COMPONENT_KEYS.badge_outline,
    secondary: COMPONENT_KEYS.badge_secondary,
  };
  const instance = await importComponent(keyMap[variant]);
  if (instance) {
    await setFirstText(instance, label);
    return instance;
  }
  // Fallback: create a raw badge
  const badge = createAutoFrame({
    name: "Badge",
    direction: "HORIZONTAL",
    padding: 4,
    fill: variant === "default" ? COLORS.primary : COLORS.secondary,
    cornerRadius: 9999,
  });
  badge.paddingLeft = 8;
  badge.paddingRight = 8;
  const text = await createText({
    text: label,
    style: TYPOGRAPHY.captionMedium,
    color: variant === "default" ? COLORS.primaryForeground : COLORS.secondaryForeground,
  });
  badge.appendChild(text);
  return badge;
}

export async function createLibrarySeparator(): Promise<SceneNode> {
  const instance = await importComponent(COMPONENT_KEYS.separator_h);
  if (instance) return instance;
  // Fallback
  const sep = figma.createRectangle();
  sep.name = "Separator";
  sep.resize(100, 1);
  sep.fills = [{ type: "SOLID", color: COLORS.border }];
  return sep;
}

export async function createLibraryCard(slots: 1 | 2 | 3 = 2): Promise<SceneNode> {
  const keyMap = {
    1: COMPONENT_KEYS.card_1slot,
    2: COMPONENT_KEYS.card_2slot,
    3: COMPONENT_KEYS.card_3slot,
  };
  const instance = await importComponent(keyMap[slots]);
  if (instance) return instance;
  // Fallback
  return createAutoFrame({
    name: "Card",
    direction: "VERTICAL",
    padding: 16,
    fill: COLORS.card,
    cornerRadius: 12,
    stroke: COLORS.border,
  });
}

export async function createLibraryAlert(type: "neutral" | "error" = "neutral"): Promise<SceneNode> {
  const key = type === "error" ? COMPONENT_KEYS.alert_error : COMPONENT_KEYS.alert_neutral;
  const instance = await importComponent(key);
  if (instance) return instance;
  // Fallback: red text for error, neutral text otherwise
  const alert = createAutoFrame({
    name: "Alert",
    direction: "VERTICAL",
    padding: 12,
    fill: type === "error" ? { r: 1, g: 0.95, b: 0.95 } : COLORS.muted,
    cornerRadius: 8,
  });
  return alert;
}

// ── Raw node helpers (for layout containers) ────────────────────────────

export async function createText(options: {
  text: string;
  style?: string;
  fontSize?: number;
  fontName?: FontName;
  color: RGB;
  width?: number;
  lineHeight?: number;
}): Promise<TextNode> {
  const node = figma.createText();

  // Try to apply library text style first
  let styleApplied = false;
  if (options.style && TEXT_STYLE_KEYS[options.style as keyof typeof TEXT_STYLE_KEYS]) {
    const styleKey = TEXT_STYLE_KEYS[options.style as keyof typeof TEXT_STYLE_KEYS];
    const textStyle = await importTextStyle(styleKey);
    if (textStyle) {
      node.textStyleId = textStyle.id;
      styleApplied = true;
    }
  }

  // Fallback to manual font if style import failed
  if (!styleApplied) {
    const styleName = options.style;
    const fallback = styleName ? FALLBACK_TYPOGRAPHY[styleName] : null;
    const fontName = options.fontName ?? fallback?.fontName ?? FONT;
    const fontSize = options.fontSize ?? fallback?.fontSize ?? 14;
    try {
      await figma.loadFontAsync(fontName);
      node.fontName = fontName;
    } catch {
      await figma.loadFontAsync(FONT);
      node.fontName = FONT;
    }
    node.fontSize = fontSize;
  }

  node.characters = options.text;
  node.fills = [{ type: "SOLID", color: options.color }];

  if (options.width) {
    node.resize(options.width, node.height);
    node.textAutoResize = "HEIGHT";
  }
  if (options.lineHeight && !styleApplied) {
    node.lineHeight = { value: options.lineHeight, unit: "PIXELS" };
  }
  return node;
}

export function createAutoFrame(options: {
  name: string;
  direction: "VERTICAL" | "HORIZONTAL";
  padding?: number;
  gap?: number;
  width?: number;
  height?: number;
  fill?: RGB;
  cornerRadius?: number;
  stroke?: RGB;
}): FrameNode {
  const frame = figma.createFrame();
  frame.name = options.name;
  frame.layoutMode = options.direction;
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "AUTO";

  const pad = options.padding ?? 0;
  frame.paddingTop = pad;
  frame.paddingBottom = pad;
  frame.paddingLeft = pad;
  frame.paddingRight = pad;
  frame.itemSpacing = options.gap ?? 0;

  if (options.width) {
    frame.resize(options.width, options.height ?? 100);
    frame.counterAxisSizingMode = "FIXED";
    if (options.height) {
      frame.primaryAxisSizingMode = "FIXED";
    }
  }

  if (options.fill) {
    frame.fills = [{ type: "SOLID", color: options.fill }];
  } else {
    frame.fills = [];
  }

  if (options.cornerRadius) {
    frame.cornerRadius = options.cornerRadius;
  }

  if (options.stroke) {
    frame.strokes = [{ type: "SOLID", color: options.stroke }];
    frame.strokeWeight = 1;
  }

  return frame;
}
