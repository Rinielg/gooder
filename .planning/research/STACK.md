# Technology Stack Research: UI Redesign with shadcn/UI

**Research Date:** 2026-02-17
**Project:** Gooder AI - Brand Voice Platform
**Current Stack:** Next.js 14.2.35, React 18, Tailwind CSS 3.4.1, Radix UI, CVA, Lucide React, Framer Motion

---

## Executive Summary

shadcn/UI is an ideal choice for this redesign as it's already partially adopted (components.json exists) and builds on your existing stack (Radix UI, Tailwind CSS, CVA). This is an *enhancement* rather than a migration - most of your current stack stays intact.

**Key Finding:** shadcn/UI is NOT a component library - it's a collection of copy-paste components that you own and can customize. This aligns perfectly with a brand voice platform needing custom styling.

---

## 1. shadcn/UI CLI and Setup

### Installation & Initialization (CONFIDENCE: HIGH)

```bash
# Initialize shadcn/UI (if not already done)
npx shadcn@latest init

# Add individual components as needed
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

### Configuration via components.json (CONFIDENCE: HIGH)

Your existing `components.json` should contain:
- `$schema`: Component schema reference
- `style`: "default" or "new-york" (two official styles)
- `rsc`: true (for React Server Components in Next.js 14)
- `tsx`: true
- `tailwind.config`: Path to Tailwind config
- `tailwind.css`: Path to global CSS
- `tailwind.baseColor`: "slate", "gray", "zinc", "neutral", "stone"
- `aliases.components`: Where components install (typically `@/components/ui`)
- `aliases.utils`: Where utils install (typically `@/lib/utils`)

**Action Item:** Review your existing components.json to ensure paths are correct before adding new components.

---

## 2. Key shadcn/UI Components for Redesign

### Essential Components (CONFIDENCE: HIGH)

**Navigation & Layout:**
- `sidebar` - Modern app sidebar with collapsible sections (NEW in 2024)
- `navigation-menu` - Accessible navigation with dropdowns
- `sheet` - Slide-over panels (mobile nav, settings)
- `breadcrumb` - Page hierarchy navigation

**Command & Search:**
- `command` - cmdk-based command palette (Cmd+K style search)
- `combobox` - Searchable select dropdowns
- `popover` - Used as base for many interactive components

**Forms & Input:**
- `form` - React Hook Form integration with Zod validation
- `input`, `textarea`, `select` - Form primitives
- `checkbox`, `radio-group`, `switch` - Selection controls
- `label` - Accessible form labels
- `date-picker` - Calendar-based date selection

**Feedback & Overlays:**
- `dialog` - Modal dialogs (already using Radix Dialog likely)
- `alert-dialog` - Confirmation dialogs
- `toast` - Notifications (you have Sonner, may not need)
- `tooltip` - Hover information
- `alert` - Static page alerts/banners

**Data Display:**
- `table` - Data tables with sorting
- `card` - Content containers
- `badge` - Status indicators
- `avatar` - User profile images
- `separator` - Visual dividers
- `skeleton` - Loading placeholders

**Advanced UI:**
- `tabs` - Tabbed interfaces
- `accordion` - Collapsible sections
- `dropdown-menu` - Context menus and actions
- `context-menu` - Right-click menus
- `scroll-area` - Custom scrollbars

### Component Priority for Brand Voice Platform (CONFIDENCE: MEDIUM)

**Phase 1 (Core UI):**
- sidebar, navigation-menu, command
- button, card, badge, avatar
- form, input, textarea, select

**Phase 2 (Enhanced Features):**
- dialog, sheet, popover
- tabs, accordion, separator
- table, scroll-area

**Phase 3 (Polish):**
- tooltip, alert, skeleton
- dropdown-menu, context-menu
- date-picker (if needed for voice analytics)

---

## 3. Figma Resources for shadcn/UI

### Official Figma Kits (CONFIDENCE: HIGH)

**shadcn/UI Figma Community File:**
- URL: Search "shadcn ui" in Figma Community
- Contains: All components in both Default and New York styles
- Updated: Regularly maintained by community
- License: Free to use and customize

**Key Features:**
- Component variants matching shadcn/UI states (default, hover, active, disabled)
- Auto-layout for responsive behavior
- Color styles using CSS variable naming convention
- Typography styles for font scaling

### Figma Plugins for Design Tokens (CONFIDENCE: HIGH)

**Design Tokens Export:**
1. **Figma Tokens (formerly Figma Design Tokens)**
   - Exports color, spacing, typography tokens
   - Can generate CSS variables compatible with shadcn/UI
   - Supports Tailwind CSS format

2. **Variables2CSS**
   - Converts Figma variables to CSS custom properties
   - Direct export to :root variables

3. **Style Dictionary**
   - More advanced token transformation
   - Requires setup but very powerful

**Figma to Code:**
1. **Anima** - Exports to React/Tailwind (MEDIUM confidence on shadcn compatibility)
2. **Builder.io** - Visual editor with code export
3. **Manual approach recommended:** Use Figma as design reference, hand-code with shadcn components for best results

### Design System Setup in Figma (CONFIDENCE: HIGH)

**Recommended Workflow:**
1. Import shadcn/UI Figma kit as library
2. Create brand-specific color variables in Figma
3. Override component styles with brand colors
4. Export color tokens to CSS variables
5. Implement in Tailwind config and globals.css

---

## 4. Typography: Font Recommendations

### Official Recommendations (CONFIDENCE: HIGH)

**Geist Font (Vercel's font):**
- Designed for: UI and code
- Weights: Variable font (100-900)
- Features: Excellent readability, modern geometric sans
- Next.js Integration: `next/font/google` or Vercel's Geist package
- **Best for:** Products deployed on Vercel, modern SaaS aesthetic

**Inter Font:**
- Designed for: UI and text
- Weights: Variable font (100-900)
- Features: Industry standard, exceptional legibility
- Next.js Integration: Built into `next/font/google`
- **Best for:** Professional, established, accessible products

**Recommendation for Gooder:**
- **Primary:** Geist Sans (aligns with Next.js/Vercel stack)
- **Fallback:** Inter (if Geist feels too modern)
- **Code/Mono:** Geist Mono (for any code snippets or technical content)

---

## 5. Color Palette Tools for shadcn/UI

### Understanding shadcn/UI Colors (CONFIDENCE: HIGH)

shadcn/UI uses CSS variables for theming with a specific structure:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 47.4% 11.2%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 47.4% 11.2%;
  --radius: 0.5rem;
}
```

**Format:** HSL values without `hsl()` wrapper - Tailwind adds it

### Color Generation Tools (CONFIDENCE: HIGH)

1. **shadcn/UI Theme Generator (Official)** - ui.shadcn.com/themes
2. **Radix UI Colors** - `@radix-ui/colors` for accessible color scales
3. **Tailwind CSS Color Palette Generators** - Hypercolor, Coolors, Color Hunt
4. **Custom HSL Conversion** - Remove `hsl()` wrapper, keep values

### Color Strategy for Brand Voice Platform (CONFIDENCE: MEDIUM)

1. **Primary:** Brand primary color (CTA buttons, links, active states)
2. **Secondary:** Neutral gray scale (backgrounds, cards)
3. **Accent:** Highlight color (notifications, badges)
4. **Semantic:** Success (green), Warning (amber), Destructive (red), Info (blue)

---

## 6. Current Stack: Keep vs Change

### KEEP (100% Compatible) - CONFIDENCE: HIGH

- Next.js 14.2.35, React 18, TypeScript
- Tailwind CSS 3.4.1, CVA 0.7.1, Radix UI primitives
- Lucide React, Framer Motion 12.34
- Sonner toasts, Supabase, Vercel AI SDK

### CHANGE/UPDATE - CONFIDENCE: HIGH

**Add:** clsx/tailwind-merge, react-hook-form, zod, cmdk, additional @radix-ui/* packages
**Consider:** vaul (drawer), recharts (data viz)
**Remove:** Custom Radix components replaced by shadcn/UI versions

---

## 7. What NOT to Use (Avoid Over-Engineering)

### Libraries to AVOID (CONFIDENCE: HIGH)
- Material UI, Chakra UI, Ant Design, Mantine, NextUI
- CSS-in-JS (styled-components, Emotion), CSS Modules, Bootstrap
- Redux for UI state, Formik, GSAP

### Anti-Patterns (CONFIDENCE: HIGH)
1. Don't modify components in node_modules
2. Don't install shadcn/UI as npm package (use CLI)
3. Don't mix with other component libraries
4. Don't skip TypeScript
5. Don't over-customize too early

---

## Final Recommendation

**Stack Decision: Proceed with shadcn/UI** ✓

**Rationale:**
1. Already partially adopted (components.json exists)
2. Builds on existing stack (Radix UI, Tailwind, CVA)
3. Zero new dependencies for core system
4. Copy-paste ownership model = maximum customization
5. Excellent TypeScript and Next.js 14 support

**Typography Choice:** Geist Sans (Vercel alignment) or Inter (safer, more established)
**Color Approach:** Start with shadcn theme generator, customize with brand colors, test accessibility
**Migration Strategy:** Incremental - Replace components one feature at a time

---

*Research complete, ready for implementation planning*
