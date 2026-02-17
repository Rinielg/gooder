# Phase 1: Design System & Figma Foundation - Research

**Researched:** 2026-02-17
**Domain:** Design tokens (CSS variables, typography, spacing, shadows), component file structure, Figma design system
**Confidence:** HIGH

## Summary

Phase 1 establishes the visual foundation for the entire redesign. The project is a Next.js 14.2.35 app using Tailwind CSS 3.4.19 with shadcn/UI partially adopted (components.json exists with `new-york` style, `cssVariables: true`). The existing `globals.css` already defines HSL CSS variables for the full shadcn semantic palette (primary, secondary, muted, accent, destructive, border, card, popover, sidebar, chart). The current `tailwind.config.ts` maps these variables correctly. A monolithic `shared.tsx` contains 6 component groups (Card, Textarea, Badge, Separator, ScrollArea, Avatar) imported by 12 files across the codebase.

The core work is: (1) replace CSS variable values with a new brand palette (atomic swap -- all at once), (2) install the Geist font via `next/font`, (3) enforce an 8px spacing grid in Tailwind config, (4) define a shadow elevation system, (5) split shared.tsx into individual files per shadcn convention, and (6) create or adopt a Figma design system file with these tokens.

**Primary recommendation:** Do the shared.tsx split first (it touches no visual output, only file structure). Then do the CSS variable swap atomically in one commit. Typography and spacing changes follow. Figma file creation can happen in parallel with any code work.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DSGN-01 | New color palette defined as CSS variables (HSL format) in globals.css, replacing current values | Current globals.css already uses HSL format for all 30+ variables across :root and .dark. Swap is a value-only change -- no structural changes needed. Must update both :root and .dark blocks atomically. See "Pattern: Atomic Color Palette Swap" below. |
| DSGN-02 | Typography system using Geist or Inter font with consistent scale (text-xs through text-2xl) | Geist font available via `npm install geist` (v1.7.0). Requires `transpilePackages: ["geist"]` in next.config.js for Next.js 14. Import GeistSans from `geist/font/sans` in layout.tsx, apply as CSS variable, extend fontFamily in tailwind.config.ts. Current layout uses `font-sans antialiased` with no explicit font defined. |
| DSGN-03 | 8px spacing grid enforced via Tailwind config | Current codebase has 53 occurrences of non-8px-aligned spacing (p-3, gap-3, space-y-1.5, px-2.5, py-0.5, px-1, py-1.5) across 11 files. Full override of `theme.spacing` would break these. Recommended approach: extend spacing with 8px-grid values AND audit/migrate existing usage. See "Pitfall: Spacing Grid Migration" below. |
| DSGN-04 | Shadow/border elevation system with layered depth | Current codebase uses only `shadow-sm` (in Card component). Tailwind 3.4 provides shadow-sm through shadow-2xl by default. Define a semantic elevation system mapping to these existing utilities. Add custom shadow tokens to tailwind.config.ts only if defaults are insufficient. |
| DSGN-05 | shared.tsx split into individual component files matching shadcn convention | shared.tsx contains 6 groups: Card (6 exports), Textarea (1), Badge (1), Separator (1), ScrollArea (1), Avatar (2). 12 files import from it. Split creates 6 new files; all imports must be updated. TypeScript compiler catches missed imports. |
| DSGN-06 | Figma design system created with shadcn/UI component library, brand colors, and typography | Multiple community Figma files available. Best option: "shadcn/ui components with variables & Tailwind classes" (updated January 2026) which includes dark/light mode, Radix colors, and token variables. Duplicate and customize with brand palette. |
</phase_requirements>

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| tailwindcss | 3.4.19 | Utility CSS framework, spacing/color/shadow system | Installed |
| class-variance-authority | 0.7.1 | Component variant system (used by Button, Label) | Installed |
| clsx + tailwind-merge | 2.1.1 / 3.4.0 | Class name composition via `cn()` helper | Installed |
| @radix-ui/react-separator | 1.1.8 | Separator primitive (used in shared.tsx) | Installed |
| @radix-ui/react-scroll-area | 1.2.10 | ScrollArea primitive (used in shared.tsx) | Installed |
| @radix-ui/react-avatar | 1.1.11 | Avatar primitive (used in shared.tsx) | Installed |

### To Install

| Library | Version | Purpose | Why Needed |
|---------|---------|---------|------------|
| geist | 1.7.0 | Vercel's Geist Sans + Geist Mono fonts | DSGN-02 typography requirement |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Geist font | Inter (via next/font/google) | Inter is more established, wider language support. Geist aligns with Vercel ecosystem. Both work equally well technically. |
| Manual Figma file | Shadcn Studio ($) or shadcndesign.com ($) | Premium kits offer more blocks/templates. Free community files are sufficient for token setup and component reference. |
| theme.spacing override | theme.extend.spacing additions | Full override forces immediate migration of all 53 non-8px usages. Extending is safer but doesn't "enforce" the grid -- both old and new values remain available. |

**Installation:**
```bash
npm install geist
```

## Architecture Patterns

### Recommended File Structure After Phase 1

```
src/
├── app/
│   ├── globals.css               # Updated CSS variables (DSGN-01)
│   └── layout.tsx                # Geist font setup (DSGN-02)
├── components/
│   └── ui/
│       ├── button.tsx            # Existing (unchanged)
│       ├── input.tsx             # Existing (unchanged)
│       ├── label.tsx             # Existing (unchanged)
│       ├── card.tsx              # NEW: split from shared.tsx
│       ├── textarea.tsx          # NEW: split from shared.tsx
│       ├── badge.tsx             # NEW: split from shared.tsx
│       ├── separator.tsx         # NEW: split from shared.tsx
│       ├── scroll-area.tsx       # NEW: split from shared.tsx
│       └── avatar.tsx            # NEW: split from shared.tsx
└── tailwind.config.ts            # Updated spacing + shadows (DSGN-03, DSGN-04)
```

### Pattern 1: Atomic Color Palette Swap

**What:** Replace ALL CSS variable values in globals.css in a single commit. Both `:root` and `.dark` blocks must be updated together.
**When to use:** When changing the brand palette.
**Why atomic:** Changing `--primary` in `:root` but not `.dark` creates visual inconsistency. Changing some variables but not others creates mixed old/new appearance.

```css
/* globals.css - Replace ALL values at once */
@layer base {
  :root {
    --background: <new H> <new S> <new L>;
    --foreground: <new H> <new S> <new L>;
    --primary: <new H> <new S> <new L>;
    --primary-foreground: <new H> <new S> <new L>;
    /* ... ALL other variables ... */
  }
  .dark {
    --background: <new H> <new S> <new L>;
    /* ... ALL dark mode variables ... */
  }
}
```

**Verification:** After swap, load every page route and visually confirm no element uses old colors. The `hsl(var(--xxx))` pattern in tailwind.config.ts means all Tailwind utilities automatically pick up new values.

### Pattern 2: shadcn Component File Convention

**What:** One file per conceptual component group. Tightly coupled sub-components (Card + CardHeader + CardContent + CardFooter + CardTitle + CardDescription) live in the same file.
**When to use:** Always for ui/ layer components.

```typescript
// src/components/ui/card.tsx
// Source: shadcn/ui convention
import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
  )
);
Card.displayName = "Card";

// ... CardHeader, CardTitle, CardDescription, CardContent, CardFooter ...

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

### Pattern 3: Geist Font Setup for Next.js 14

**What:** Install Geist via npm, configure in layout.tsx with CSS variable, extend Tailwind fontFamily.
**Why this approach:** Next.js 14 requires `transpilePackages` for the geist package. Using `next/font/local` or the geist package's built-in loader with CSS variables integrates cleanly with Tailwind.

```typescript
// src/app/layout.tsx
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} light`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
```

```typescript
// tailwind.config.ts - extend fontFamily
theme: {
  extend: {
    fontFamily: {
      sans: ["var(--font-geist-sans)", ...defaultTheme.fontFamily.sans],
      mono: ["var(--font-geist-mono)", ...defaultTheme.fontFamily.mono],
    },
  },
}
```

```javascript
// next.config.js - required for Next.js 14
const nextConfig = {
  transpilePackages: ["geist"],
  // ... existing config
};
```

### Pattern 4: 8px Spacing Grid via Extension

**What:** Add 8px-grid spacing values to Tailwind config via `theme.extend.spacing` while keeping defaults available during migration.
**Why extend, not override:** Overriding `theme.spacing` immediately breaks 53 existing usages across 11 files. The requirement says "enforced" but a phased approach is safer: add grid values now, migrate existing usages, then optionally restrict later.

```typescript
// tailwind.config.ts
theme: {
  extend: {
    spacing: {
      // 8px grid tokens (semantic names for clarity)
      '0.5': '4px',    // half-unit for fine adjustments
      '1': '8px',      // base unit
      '1.5': '12px',   // 1.5x
      '2': '16px',     // 2x
      '2.5': '20px',   // 2.5x
      '3': '24px',     // 3x
      '4': '32px',     // 4x
      '5': '40px',     // 5x
      '6': '48px',     // 6x
      '8': '64px',     // 8x
      '10': '80px',    // 10x
      '12': '96px',    // 12x
    },
  },
}
```

**CRITICAL NOTE:** Tailwind 3's default spacing scale already uses 4px increments (1=4px, 2=8px, 3=12px, 4=16px, etc.). The default `p-4` is already 16px (2x 8px grid). The requirement to "enforce 8px grid" means ensuring only multiples of 8px are used for primary layout spacing (gaps, padding, margins). Fine-grained values like `px-2.5` (10px) or `py-0.5` (2px) in component internals may be acceptable exceptions (shadcn components themselves use these).

### Pattern 5: Shadow Elevation System

**What:** Define semantic elevation levels mapping to Tailwind shadow utilities plus custom CSS variables for dark mode awareness.

```typescript
// tailwind.config.ts
theme: {
  extend: {
    boxShadow: {
      'elevation-1': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',   // cards, list items
      'elevation-2': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',  // dropdowns, popovers
      'elevation-3': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', // modals, overlays
      'elevation-4': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // floating elements
    },
  },
}
```

Semantic mapping:
- `shadow-sm` / `shadow-elevation-1` = Cards, containers (resting state)
- `shadow-md` / `shadow-elevation-2` = Dropdowns, popovers, hover states
- `shadow-lg` / `shadow-elevation-3` = Modals, dialogs, overlays
- `shadow-xl` / `shadow-elevation-4` = Floating action elements

### Anti-Patterns to Avoid

- **Partial color swap:** Never change some CSS variables without changing all of them. Leads to mixed old/new appearance.
- **Hardcoded colors alongside CSS variables:** Never use `text-blue-500` when `text-primary` exists. All colors must flow through CSS variables.
- **Overriding Tailwind spacing destructively:** Replacing `theme.spacing` entirely breaks every existing utility class that uses non-custom values.
- **Mixed import paths:** After splitting shared.tsx, never import components from both `@/components/ui/shared` and `@/components/ui/card`. The old path must be completely eliminated.
- **Skipping transpilePackages for Geist:** Next.js 14 will fail to build without `transpilePackages: ["geist"]` in next.config.js.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font loading/optimization | Custom @font-face declarations | `geist` npm package + `next/font` | next/font handles subsetting, preloading, CLS prevention automatically |
| Component variant system | Custom if/else className logic | CVA (class-variance-authority) | Already in use, type-safe, composable |
| Class name merging | String concatenation | `cn()` from lib/utils (clsx + tailwind-merge) | Already in use, handles conflicts correctly |
| Figma component library | Design components from scratch | Community shadcn/ui Figma file | Hundreds of pre-built components matching code implementation |
| Dark mode toggle | Custom CSS class management | Tailwind `darkMode: ["class"]` + `.dark` CSS variables | Already configured in tailwind.config.ts and globals.css |

**Key insight:** The existing project already has the correct infrastructure (CSS variables, Tailwind config, cn() helper, CVA). Phase 1 is about changing VALUES (new palette, new font, new spacing constraints), not changing ARCHITECTURE.

## Common Pitfalls

### Pitfall 1: CSS Variable Collision During Palette Swap

**What goes wrong:** Changing `--primary` in `:root` but forgetting to update `.dark` block, or updating color but not its foreground pair. Some pages look correct, others have invisible text (same background and foreground color).
**Why it happens:** The globals.css has 30+ variables across two blocks (:root and .dark). Easy to miss one.
**How to avoid:** Create the complete new palette for both light and dark themes BEFORE writing any code. Use a checklist of all variable names. Swap all at once in a single commit. Test every route immediately after.
**Warning signs:** Text becomes invisible on certain backgrounds; focus rings disappear; buttons look "flat" (foreground matches background).

### Pitfall 2: Spacing Grid Migration Breaking Component Internals

**What goes wrong:** Enforcing strict 8px grid breaks shadcn component internals that intentionally use non-8px values (e.g., Badge uses `px-2.5 py-0.5`, CardHeader uses `space-y-1.5 p-6`).
**Why it happens:** shadcn components are designed with specific spacing for visual balance. `py-0.5` (2px) padding on a Badge is intentional -- changing to `py-1` (8px in a strict grid) makes it look bloated.
**How to avoid:** Apply 8px grid to LAYOUT spacing (page padding, section gaps, card margins) but allow component-internal spacing to use Tailwind defaults. Document which spacing values are "grid-aligned" vs "component-internal." Do NOT override `theme.spacing` destructively.
**Warning signs:** Badges, labels, and small UI elements look disproportionately large; Card internals feel too loose.

### Pitfall 3: Import Path Updates Missing Files

**What goes wrong:** After splitting shared.tsx, some files still import from the old path. App compiles with warnings in dev but fails in production build.
**Why it happens:** Grep/find-replace misses dynamic imports, barrel exports, or type-only imports.
**How to avoid:** After splitting, delete shared.tsx immediately. Run `npx tsc --noEmit` to find every broken import. The TypeScript compiler is the authoritative checker.
**Warning signs:** Build warnings about missing modules; runtime errors on pages that weren't manually tested.

### Pitfall 4: Geist Font Not Rendering (Next.js 14 Specific)

**What goes wrong:** Font loads in development but falls back to system sans-serif in production. Or build fails entirely.
**Why it happens:** Next.js 14 requires `transpilePackages: ["geist"]` in next.config.js. Without it, the geist package's internal next/font usage isn't processed. Also, the CSS variable `--font-geist-sans` must be applied via className on `<html>`, not `<body>`.
**How to avoid:** Add `transpilePackages` to next.config.js. Apply font variables on `<html>` element. Verify in production build (`npm run build && npm start`), not just dev mode.
**Warning signs:** Font looks different in dev vs production; console shows "Failed to find font" warnings.

### Pitfall 5: Figma-Code Token Drift

**What goes wrong:** Figma design system uses different color values or names than what's in globals.css. Designs look different from implementation.
**Why it happens:** Figma variables are set up independently from code. Without an automated sync, they drift over time.
**How to avoid:** Define the canonical palette in ONE place (globals.css) and manually mirror it in Figma. For a small project, manual sync is sufficient -- do not invest in Style Dictionary or Tokens Studio automation yet. Document the variable-to-Figma-variable mapping.
**Warning signs:** Designer says "that's not the right blue"; implemented pages don't match Figma mockups.

## Code Examples

### Example 1: Split Card Component from shared.tsx

```typescript
// src/components/ui/card.tsx
// Source: Exact copy from shared.tsx Card section
import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

### Example 2: Import Path Updates After Split

```typescript
// BEFORE (12 files need updating):
import { Card, CardContent, Badge } from "@/components/ui/shared";

// AFTER:
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
```

### Example 3: Geist Font Setup (Complete)

```typescript
// src/app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brand Voice Platform",
  description: "AI-powered brand voice management and content generation",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} light`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
```

```javascript
// next.config.js (add transpilePackages)
const nextConfig = {
  transpilePackages: ["geist"],
  experimental: {
    serverComponentsExternalPackages: ["unpdf"],
  },
  // ... rest unchanged
};
```

```typescript
// tailwind.config.ts (add fontFamily)
import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  // ... existing config
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...defaultTheme.fontFamily.mono],
      },
      // ... existing extends
    },
  },
};
```

### Example 4: Complete Import Map for shared.tsx Split

Files that import from `@/components/ui/shared` and what they need:

| File | Imports | New Source File |
|------|---------|-----------------|
| `src/app/(auth)/login/page.tsx` | Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle | `card.tsx` |
| `src/app/(auth)/register/page.tsx` | Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle | `card.tsx` |
| `src/app/(dashboard)/objectives/page.tsx` | Card, CardContent, Badge, Textarea | `card.tsx` + `badge.tsx` + `textarea.tsx` |
| `src/app/(dashboard)/standards/page.tsx` | Card, CardContent, Badge | `card.tsx` + `badge.tsx` |
| `src/app/(dashboard)/definitions/page.tsx` | Card, CardContent | `card.tsx` |
| `src/components/layout/app-sidebar.tsx` | ScrollArea | `scroll-area.tsx` |
| `src/app/(dashboard)/settings/page.tsx` | Card, CardContent, CardHeader, CardTitle, CardDescription, Separator, Badge | `card.tsx` + `separator.tsx` + `badge.tsx` |
| `src/app/(dashboard)/profiles/page.tsx` | Card, CardContent, CardHeader, CardTitle, Badge | `card.tsx` + `badge.tsx` |
| `src/app/(dashboard)/chat/page.tsx` | Badge | `badge.tsx` |
| `src/app/(dashboard)/profiles/[id]/page.tsx` | Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Separator | `card.tsx` + `badge.tsx` + `separator.tsx` |
| `src/app/(dashboard)/outputs/page.tsx` | Card, CardContent, Badge | `card.tsx` + `badge.tsx` |
| `src/app/(dashboard)/profiles/[id]/train/page.tsx` | Badge, Card, CardContent, CardHeader, CardTitle | `card.tsx` + `badge.tsx` |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| HSL format in CSS variables (`H S% L%`) | OKLCH format (`oklch(L S H)`) in shadcn/ui latest | Late 2025 | Project uses HSL. Stay on HSL for Tailwind 3.x compatibility. OKLCH is for Tailwind v4. |
| `theme.spacing` override for grid enforcement | `theme.extend.spacing` with lint rules | Ongoing best practice | Full override is too destructive. Extend + eslint-plugin-tailwindcss can restrict classes. |
| Manual Figma-to-code token sync | Style Dictionary / Tokens Studio automation | 2024-2025 | Automation is overkill for this project size. Manual sync is sufficient. |
| `next/font/google` for Geist | `geist` npm package with `next/font/local` internally | 2024 | The `geist` package provides better control and includes Geist Mono. |

**Deprecated/outdated:**
- shadcn/ui `"default"` style is deprecated; use `"new-york"` (already configured correctly in components.json)
- `@apply` in Tailwind CSS is discouraged in v4+ but still fine in v3.4

## Open Questions

1. **Exact brand color palette values**
   - What we know: Current primary is `337 74% 49%` (a pink/magenta). The requirement says "new color palette."
   - What's unclear: The specific HSL values for the new palette have not been defined.
   - Recommendation: The planner should include a task for defining the palette (either via shadcn theme generator at ui.shadcn.com/themes, or designer input). Placeholder values can be used initially and swapped later.

2. **Dark mode scope**
   - What we know: globals.css defines a `.dark` block. The app hardcodes `className="light"` on `<html>`. Prior research says "Light mode only - remove .dark block."
   - What's unclear: Should the .dark block be removed entirely, or kept for future v2 (VPOL-02 is deferred dark mode)?
   - Recommendation: Keep the .dark block but update its values to match the new palette. Removing it saves ~30 lines but loses future optionality for zero benefit.

3. **8px grid strictness level**
   - What we know: Requirement says "enforced." 53 existing usages use non-8px values. shadcn components internally use non-8px values (py-0.5, px-2.5, space-y-1.5).
   - What's unclear: Does "enforced" mean (a) all layout spacing is 8px-aligned, or (b) ALL spacing including component internals?
   - Recommendation: Enforce at the layout level (page padding, section gaps, container margins). Allow component-internal spacing to use any Tailwind default. This matches industry practice -- Material Design's 8px grid also permits 4px for compact elements.

4. **Figma file authoring: who does the design work?**
   - What we know: DSGN-06 requires "Figma design system created." The project has a Figma API integration for extracting designs.
   - What's unclear: Is a developer or designer creating the Figma file? Is it just token setup, or full page designs?
   - Recommendation: For Phase 1, the Figma file only needs tokens (color palette, typography scale) plus the community shadcn/UI component library. Full page designs belong in later phases. A developer can set this up by duplicating a community file and updating color/font variables.

## Sources

### Primary (HIGH confidence)
- Project codebase analysis: `globals.css`, `tailwind.config.ts`, `shared.tsx`, `components.json`, `package.json`, `layout.tsx`, `next.config.js` -- direct file reading
- [shadcn/ui Theming Documentation](https://ui.shadcn.com/docs/theming) -- CSS variable naming, HSL format, dark mode implementation
- [shadcn/ui components.json Documentation](https://ui.shadcn.com/docs/components-json) -- Configuration schema, style options
- [shadcn/ui Figma page](https://ui.shadcn.com/docs/figma) -- Official Figma resource recommendations
- [Tailwind CSS v3 Customizing Spacing](https://v3.tailwindcss.com/docs/customizing-spacing) -- theme.spacing override vs extend behavior
- [Tailwind CSS Box Shadow](https://tailwindcss.com/docs/box-shadow) -- Default shadow utilities and customization

### Secondary (MEDIUM confidence)
- [geist npm package](https://www.npmjs.com/package/geist) -- v1.7.0, installation and Next.js integration instructions
- [Peerlist: How to use Vercel's Geist Font in Next.js](https://peerlist.io/blog/engineering/how-to-use-vercel-geist-font-in-nextjs) -- transpilePackages requirement for Next.js 14
- [shadcn/ui components with variables & Tailwind classes (Figma Community)](https://www.figma.com/community/file/1342715840824755935/shadcn-ui-components-with-variables-tailwind-classes-updated-january-2026) -- Updated January 2026, includes dark/light mode with token variables
- [Obra shadcn/ui Figma kit](https://www.figma.com/community/file/1514746685758799870/obra-shadcn-ui) -- Free MIT-licensed community option
- [shadcn/ui Design System 2025 (FREE)](https://www.figma.com/community/file/1554177993232416414/shadcn-ui-design-system-2025-free) -- Alternative free community file

### Tertiary (LOW confidence)
- [Style Dictionary + Tokens Studio](https://docs.tokens.studio/transform-tokens/style-dictionary) -- Figma-to-code automation pipeline. Not validated for this project's specific setup. Recommendation: skip for now, use manual sync.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries are already installed except Geist font. Verified versions against package.json and node_modules.
- Architecture: HIGH - Component split is straightforward; file structure matches established shadcn convention. All import paths verified via grep.
- Pitfalls: HIGH - CSS variable collision risk is well-documented. Spacing grid migration impact quantified (53 non-8px usages across 11 files). Font setup pitfall verified against Next.js 14 requirements.
- Figma: MEDIUM - Community files exist and are current, but the specific workflow of duplicating and customizing hasn't been tested end-to-end.

**Research date:** 2026-02-17
**Valid until:** 2026-03-17 (stable domain, 30-day validity)
