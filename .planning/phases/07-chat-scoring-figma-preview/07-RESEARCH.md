# Phase 7: Chat Scoring & Figma Preview - Research

**Researched:** 2026-02-21
**Domain:** SVG radial progress, expand/collapse animation, framer-motion v12, shadcn/UI patterns
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Score Card Presentation
- Overall score displayed as a large radial/circular progress ring with the score value inside — the score is the hero
- Color system: green/yellow/red thresholds (green = passing ~7+, yellow = borderline ~5–6.9, red = failing <5)
- Score card sits indented below the AI message card, visually separate — score feels like metadata attached to the response
- While scoring is in progress: minimal spinner with a "Scoring..." label — no full skeleton shape until data arrives

#### Dimension Expand/Collapse
- Default state shows: dimension name + score + pass/fail badge — scannable across all 8 dimensions
- Failing dimensions surface first; passing dimensions hidden under a "Show all" toggle
- Expanded state shows: score notes (feedback text) + an "Improve" button for that specific dimension
- Multiple dimensions can be expanded simultaneously — independent, not accordion

#### Regenerate-with-Feedback UX
- Two entry points: per-dimension "Improve" button (in expanded state) and an overall "Improve" button on the score card
- Overall "Improve" button: opens a summary of all failing dimensions with their notes first — user reviews then confirms
- On trigger (both per-dimension and overall): feedback context is silently injected and a new message sends automatically — no manual input needed
- Button label: "Improve" with a wand/sparkle icon (both per-dimension and overall)
- After regeneration: the original score card collapses/dims to show it's superseded — keeps conversation history readable

#### Figma Extraction Panel
- Panel renders inline at the bottom of the message list as a card — part of the conversation stream
- Panel header: frame name displayed at the top so user knows which Figma frame was extracted
- Content organised in two sections: Components list first, then Text nodes list
- Dismissible via an X button — stays visible until explicitly closed by the user

### Claude's Discretion
- Exact pixel dimensions of the radial ring (should be prominent but not oversized relative to message cards)
- Specific green/yellow/red HSL values (should use CSS variables or match existing design tokens)
- Animation/transition on score card appearance (should align with established 100–200ms timing)
- Visual treatment of "superseded" score cards (e.g. opacity reduction, strikethrough badge, collapsed height)
- Indentation amount for score card below message (should feel connected but separate)
- Icon choice for the Improve button (Sparkles from lucide-react is already imported)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CHAT-07 | Adherence score cards redesigned with radial progress indicators and color coding | SVG ring pattern documented; color thresholds mapped to existing scoreColor/scoreBarColor functions; no new library needed |
| CHAT-08 | All 8 scoring dimensions visible with expand/collapse interaction | 8 dimensions exist in AdherenceScore.scores; CSS grid-rows-[0fr/1fr] pattern for animation; failing-first sort; "Show all" toggle |
| CHAT-09 | Regenerate-with-feedback button preserves specific dimension issues in prompt | handleRegenerate() already exists and untouched; per-dimension improve adds dimension key to prompt; AlertDialog (already installed) for overall confirm flow |
| CHAT-10 | Figma extraction preview UI preserved with component/text node lists | Figma panel JSX preserved at lines ~839-956; only visual redesign needed; existing state/handlers untouched |
</phase_requirements>

---

## Summary

Phase 7 is a **pure visual redesign** of two existing UI sections in `page.tsx`: the adherence score card block (lines ~617–793) and the Figma extraction preview panel (lines ~839–956). All logic, state, API calls, and business behaviour are locked and must not be modified. The research confirms no new libraries are needed — the project already has framer-motion v12.34.0, `@radix-ui/react-alert-dialog`, and all necessary shadcn components.

The most technically interesting challenge is the **SVG radial progress ring** for the overall score. No SVG/chart library is installed, and the locked decision rules this out. The standard pattern is a hand-rolled SVG component using two `<circle>` elements with `stroke-dasharray` / `stroke-dashoffset` math — this is well-understood, dependency-free, and approximately 20 lines of TypeScript. Framer-motion v12 (imported as `"framer-motion"` in this project — confirmed by package.json and node_modules) provides `motion.circle` for animating `strokeDashoffset` from circumference to the computed value on mount.

The **dimension expand/collapse** uses a CSS `grid-rows-[0fr]/grid-rows-[1fr]` trick (modern, avoids arbitrary max-height values) combined with existing React `Set` state (`expandedIds`) that is already in the file. The **confirm flow** for overall "Improve" uses the already-installed `@radix-ui/react-alert-dialog` (wrapped as `alert-dialog.tsx` in `src/components/ui/`). The **superseded** visual treatment uses conditional CSS classes (opacity + grayscale filter) managed by a new `regeneratedFromIds` state Set.

**Primary recommendation:** Build a standalone `ScoreCard` sub-component within the chat directory. Keep all state lifted in `page.tsx` (no new state management). Use SVG ring + framer-motion for the radial indicator; CSS grid-rows transition for dimension collapse; AlertDialog for the confirm flow.

---

## Standard Stack

### Core (already installed — no new dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | 12.34.0 | Animate SVG strokeDashoffset on ring mount; AnimatePresence for score card entrance | Already installed; `motion.circle` works on SVG elements |
| @radix-ui/react-alert-dialog | ^1.1.15 | Confirm dialog for overall "Improve" flow | Already installed; shadcn wrapper exists at `src/components/ui/alert-dialog.tsx` |
| lucide-react | ^0.563.0 | Sparkles icon for Improve buttons; existing icons | Already imported in page.tsx |
| tailwindcss-animate | ^1.0.7 | CSS keyframe utilities for score card fade-in | Already in project; used by existing `.message-appear` pattern |

### Supporting (already installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx / tailwind-merge | ^2.1.1 / ^3.4.0 | Conditional class composition via `cn()` | Every component in this phase |
| shadcn Badge | existing | Pass/fail badge on dimensions | Already used in score section; `success`/`warning`/`destructive` variants exist |
| shadcn Button | existing | Improve buttons, Show all toggle | Already used throughout |

### What Is NOT Installed (and must not be added)

| Problem | What you might reach for | Use instead |
|---------|--------------------------|-------------|
| Radial progress | `react-circular-progressbar`, `recharts` | Hand-rolled SVG with `stroke-dasharray` math |
| Expand/collapse | `@radix-ui/react-collapsible` (not installed as shadcn component) | CSS `grid-rows-[0fr/1fr]` transition |
| Confirm dialog | A custom modal | `alert-dialog.tsx` already exists |

**Installation:** No new packages required. All tooling is already present.

---

## Architecture Patterns

### Recommended File Structure

The entire phase lives in one file — `page.tsx` — with the option to extract a helper component:

```
src/app/(dashboard)/chat/
├── page.tsx           # Main file — lift state here, render ScoreCard
└── score-card.tsx     # NEW: extracted component for the score card UI
```

Extracting `ScoreCard` is recommended because the scoring JSX block is ~175 lines and will grow to ~250. Keeping it in `page.tsx` is also acceptable if the planner prefers minimal file changes.

### Pattern 1: SVG Radial Progress Ring (Hand-rolled, no library)

**What:** Two SVG `<circle>` elements — a track ring and an animated indicator ring. Score value (0–10) maps to a percentage, which maps to `strokeDashoffset`.

**When to use:** Whenever overall score must be displayed as a circular visual indicator.

**Math:**
```typescript
const SIZE = 80;          // px (viewBox dimension — discretion area)
const STROKE = 8;         // px stroke width
const RADIUS = (SIZE - STROKE) / 2;  // 36
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;  // ~226.2
const progress = score / 10;  // score is 0–10, convert to 0–1
const offset = CIRCUMFERENCE * (1 - progress);  // dashoffset
```

**Example — static SVG ring:**
```typescript
// Source: Standard SVG stroke-dasharray pattern (MDN, LogRocket)
function ScoreRing({ score }: { score: number }) {
  const SIZE = 80;
  const STROKE = 8;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const offset = CIRCUMFERENCE * (1 - score / 10);
  const color = score >= 7 ? "hsl(142 71% 45%)" : score >= 5 ? "hsl(38 92% 50%)" : "hsl(0 84% 60%)";

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Score: ${score.toFixed(1)} out of 10`}>
      {/* Track ring */}
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="hsl(240 5.9% 90%)"   // --border token
        strokeWidth={STROKE}
      />
      {/* Progress ring — rotated so it starts at 12 o'clock */}
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease" }}
      />
      {/* Score label centered */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="18"
        fontWeight="600"
        fill={color}
      >
        {score.toFixed(1)}
      </text>
    </svg>
  );
}
```

**With framer-motion for mount animation:**
```typescript
// Source: framer-motion v12 — motion.circle, import from "framer-motion"
import { motion } from "framer-motion";

// Replace the progress <circle> with:
<motion.circle
  cx={SIZE / 2}
  cy={SIZE / 2}
  r={RADIUS}
  fill="none"
  stroke={color}
  strokeWidth={STROKE}
  strokeLinecap="round"
  strokeDasharray={CIRCUMFERENCE}
  initial={{ strokeDashoffset: CIRCUMFERENCE }}
  animate={{ strokeDashoffset: offset }}
  transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
  transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
/>
```

**Key gotcha:** The `rotate` transform must be applied as an SVG attribute, not as a framer-motion `animate` target — framer-motion's `rotate` applies to the element's center, not the SVG coordinate center. Use `transform={rotate(-90 cx cy)}` as a static prop.

### Pattern 2: Dimension Expand/Collapse (CSS grid-rows trick)

**What:** Animate content height from 0 to natural height using `grid-template-rows` transition. Avoids arbitrary `max-height` values and renders to exact content height.

**When to use:** For the 8 dimension rows — each independently expandable.

**Example:**
```typescript
// Source: Modern CSS grid-rows-[0fr/1fr] expand pattern (2025)
// expandedDims: Set<string> — per-dimension local state (not global expandedIds)
<div
  className={cn(
    "grid transition-[grid-template-rows] duration-200 ease-out",
    expandedDims.has(key) ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
  )}
>
  <div className="overflow-hidden">
    {/* Notes + Improve button */}
    <div className="pt-2 pb-1 space-y-2">
      {dim.notes && <p className="text-[10px] text-muted-foreground leading-relaxed">{dim.notes}</p>}
      <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => onImprove(key, dim)}>
        <Sparkles className="w-2.5 h-2.5 mr-1" />
        Improve
      </Button>
    </div>
  </div>
</div>
```

**Note:** The existing `expandedIds` Set in `page.tsx` controls whether the entire score card is expanded. The dimension-level expand (`expandedDims`) is a separate concern managed locally within the score card component. Do NOT conflate these two levels.

### Pattern 3: Failing-Dimensions-First Sort

**What:** Sort the 8 `Object.entries(score.scores)` so failing dimensions (score < 7 using context threshold) appear first. Passing dimensions render only when "Show all" is active.

**Example:**
```typescript
// Source: codebase analysis — score thresholds from existing scoreColor() in page.tsx
// Note: existing code uses 8 as green threshold; context says "~7+"; use 7 as the failing/passing boundary
const entries = Object.entries(score.scores) as [string, DimensionScore][];
const failing = entries.filter(([, dim]) => dim.score < 7);
const passing = entries.filter(([, dim]) => dim.score >= 7);
const sorted = [...failing, ...passing];

// Render sorted; hide passing rows unless showAll is true
{sorted.map(([key, dim]) => {
  const isFailing = dim.score < 7;
  if (!isFailing && !showAll) return null;
  // ... row JSX
})}

// Show all toggle — only if there are passing dimensions
{passing.length > 0 && (
  <button onClick={() => setShowAll(v => !v)} className="text-xs text-muted-foreground hover:text-foreground">
    {showAll ? "Hide passing" : `Show ${passing.length} passing`}
  </button>
)}
```

### Pattern 4: Confirm Dialog for Overall "Improve" (AlertDialog)

**What:** The overall "Improve" button opens an AlertDialog showing a summary of failing dimensions + their notes. User confirms, then `handleRegenerate(score)` fires.

**When to use:** Only for the overall Improve path. Per-dimension Improve fires directly (no confirm needed per context).

**Example:**
```typescript
// Source: @radix-ui/react-alert-dialog — already in src/components/ui/alert-dialog.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="outline" size="sm" className="h-7 text-xs">
      <Sparkles className="w-3 h-3 mr-1.5" />
      Improve
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Improve with feedback</AlertDialogTitle>
      <AlertDialogDescription asChild>
        <div className="space-y-2 text-sm">
          {failingDims.map(([key, dim]) => (
            <div key={key}>
              <span className="font-medium">{DIMENSION_LABELS[key]}</span>
              {dim.notes && <p className="text-muted-foreground text-xs mt-0.5">{dim.notes}</p>}
            </div>
          ))}
        </div>
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={() => handleRegenerate(score)}>
        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
        Send with feedback
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Pattern 5: Superseded Score Card Visual Treatment

**What:** After the user triggers any Improve action, the score card for that message should visually indicate it is superseded (no longer the current state).

**Approach (Claude's discretion):** A `regeneratedFromIds: Set<string>` state in `page.tsx` tracks which message IDs have had their score card superseded. Score cards in this set render with reduced opacity and a "Superseded" label replacing the Improve button.

**Example:**
```typescript
// Add to page.tsx state:
const [regeneratedFromIds, setRegeneratedFromIds] = useState<Set<string>>(new Set());

// Modified handleRegenerate-equivalent called from ScoreCard:
function handleImprove(messageId: string, score: AdherenceScore, dimensionKey?: string) {
  setRegeneratedFromIds(prev => new Set(prev).add(messageId));
  // Build prompt — per-dimension or overall
  const prompt = dimensionKey
    ? `The ${DIMENSION_LABELS[dimensionKey]} dimension scored low (${score.scores[dimensionKey].score.toFixed(1)}/10). ${score.scores[dimensionKey].notes}. Please regenerate addressing this specific issue.`
    : /* existing handleRegenerate logic */ buildOverallPrompt(score);
  sendMessage({ text: prompt });
}

// In score card render:
<div className={cn("...", isSuperseded && "opacity-40 pointer-events-none")}>
  {/* score card content */}
  {isSuperseded && (
    <p className="text-[10px] text-muted-foreground italic text-center py-1">Superseded — new response generated</p>
  )}
</div>
```

**Note:** `pointer-events-none` prevents interaction with superseded cards. `opacity-40` reads as "archived" rather than "broken". No strikethrough on the score value — that would feel aggressive.

### Pattern 6: AnimatePresence for Score Card Entrance

**What:** Score cards appear after async scoring completes. Wrap the score card in `AnimatePresence` so it fades in gracefully.

**Example:**
```typescript
import { AnimatePresence, motion } from "framer-motion";

<AnimatePresence>
  {score && (
    <motion.div
      key={`score-${message.id}`}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* ScoreCard component */}
    </motion.div>
  )}
</AnimatePresence>
```

**Import:** Use `import { motion, AnimatePresence } from "framer-motion"` — this project has `framer-motion` (not `motion`) in package.json and the `framer-motion` package is confirmed at v12.34.0 with `motion` and `AnimatePresence` in exports.

### Anti-Patterns to Avoid

- **Conflating the two expand levels:** `expandedIds` in `page.tsx` = score card expand/collapse (the whole card). Dimension-level expand = separate state. Do not reuse `expandedIds` for dimension toggling.
- **CSS `transition-*` classes on `motion.*` elements:** framer-motion overrides CSS transitions. Remove `transition-all` from any element you also apply `animate={}` to.
- **Using `max-height` for collapse animation:** The grid-rows trick is cleaner and animates to exact content height. `max-height: 999px` causes jerky animations.
- **Wrapping AnimatePresence inside the conditional:** `AnimatePresence` must be outside the condition, the conditional child inside.
- **Rotating motion.circle with framer-motion rotate:** SVG circles rotate around element center, not SVG coordinate center. Always use static `transform="rotate(-90 cx cy)"` attribute for the -90 degree start position.
- **Modifying scoring logic or handleRegenerate():** Phase boundary is strict — only the visual presentation layer changes. The existing `handleRegenerate` function at line 313 is untouched. Phase 7 adds a new `handleImprove` wrapper that calls into it.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Confirm dialog | Custom modal with useState | `alert-dialog.tsx` (already installed) | Radix handles focus trap, keyboard, ARIA |
| Smooth fade-in for score cards | CSS keyframe in globals.css | framer-motion AnimatePresence | Already installed; same pattern as existing animations |
| Ring animation on mount | `setTimeout` + CSS class toggle | `motion.circle` with `animate={{ strokeDashoffset }}` | Declarative, interruptible, respects reduced motion |
| Badge variants for score | Custom div with conditional classes | existing `Badge` with `success`/`warning`/`destructive` | Already has these variants in `badge.tsx` |

**Key insight:** Every tool needed for this phase is already installed. The only genuinely hand-rolled piece is the SVG math (~15 lines) for the ring — that's appropriate because no chart library exists and adding one for a single progress ring would be overkill.

---

## Common Pitfalls

### Pitfall 1: Score Threshold Inconsistency

**What goes wrong:** The existing `scoreColor()` function uses 8 as the green threshold (`>= 8`), but the CONTEXT.md says green = "~7+". If Phase 7 uses different thresholds for the ring color vs. the existing bar colors, the UI will contradict itself.

**Why it happens:** The context decision is aspirational; the existing code is operational. They differ by 1 point.

**How to avoid:** Audit the existing thresholds in `scoreColor()` (line 69) and `scoreBadgeVariant()` (line 75). Use the **same** thresholds everywhere in Phase 7. The context says "~7+" which suggests 7 is acceptable — since the existing code uses 8 as green, consider adopting 7 as the Phase 7 ring threshold and documenting the intentional difference. The planner should decide which wins.

**Warning signs:** Ring is green but badge is `warning`, or vice versa.

### Pitfall 2: Breaking the existing toggleExpand interaction

**What goes wrong:** The existing code uses `toggleExpand(message.id)` and `expandedIds.has(message.id)` to show/hide the entire score card expanded view. Phase 7 must preserve this — the score card still has a header row that toggles expansion of the detail area.

**Why it happens:** The redesign changes the structure (radial ring replaces compact badge row) but the collapse mechanism must remain wired to the same state.

**How to avoid:** The outer card toggle (`expandedIds`) survives unchanged. The new dimension-level expand state is a separate `expandedDims` Set within the card.

### Pitfall 3: Figma Panel Position Change

**What goes wrong:** The Figma panel currently renders outside the message list (lines ~838–956), in a separate border-t section above the input. The context says "renders inline at the bottom of the message list as a card — part of the conversation stream." This is a structural change, not just visual.

**Why it happens:** The context decision repositions the element. Moving it inside the scroll container changes z-index, layout, and scroll behavior.

**How to avoid:** Move the Figma panel JSX block inside the `displayMessages.map()` container (after the last message), controlled by the existing `figmaExtraction`/`figmaLoading`/`figmaError` state. Ensure the scroll-to-bottom behavior still includes the Figma panel. The input form must not overlap the panel when visible.

### Pitfall 4: framer-motion import path

**What goes wrong:** Motion v12 docs recommend `import { motion } from "motion/react"` but this project installs `framer-motion` (not `motion`). Using `motion/react` will fail.

**Why it happens:** The `framer-motion` package is an alias/legacy package for the `motion` package but they are separate npm packages. This project's `package.json` lists `framer-motion`, not `motion`.

**How to avoid:** Always import from `"framer-motion"`: `import { motion, AnimatePresence } from "framer-motion"`. Verified: the installed package at v12.34.0 exports `motion`, `AnimatePresence`, `MotionConfig`, `LazyMotion`.

### Pitfall 5: SVG text element font rendering

**What goes wrong:** The `<text>` element inside the SVG ring may not pick up the project's Geist font (applied via CSS variable `--font-geist-sans`). SVG text uses SVG font properties, not CSS font-family by default in all browsers.

**Why it happens:** SVG text inherits some CSS properties but not all. Font family may fall back to browser default.

**How to avoid:** Apply `fontFamily="var(--font-geist-sans), sans-serif"` as an SVG prop on the `<text>` element, or use `className` with a Tailwind `font-sans` utility (this works in React since SVG text supports className). Test in the browser — if it falls back, the score value is still readable in any monospace/sans font.

### Pitfall 6: AlertDialog description with complex children

**What goes wrong:** `AlertDialogDescription` renders a `<p>` by default. Putting a `<div>` (with multiple failing dimension blocks) inside it causes a React hydration warning (`<div>` cannot be a descendant of `<p>`).

**Why it happens:** Radix AlertDialog renders Description as a `<p>` element.

**How to avoid:** Use `asChild` prop on `AlertDialogDescription` to render it as a `<div>`: `<AlertDialogDescription asChild><div>...</div></AlertDialogDescription>`. This is the Radix pattern for custom element types.

---

## Code Examples

### SVG Ring Component (Full, Production-Ready)

```typescript
// Source: Standard SVG stroke-dasharray pattern, verified against MDN
// https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/stroke-dasharray

import { motion } from "framer-motion";

const RING_SIZE = 80;   // 80px — prominent but not oversized (discretion)
const RING_STROKE = 8;
const RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getScoreColor(score: number): string {
  // Match existing scoreBarColor thresholds from page.tsx line 81
  if (score >= 8) return "hsl(142 71% 45%)";   // green — approximately green-500
  if (score >= 6) return "hsl(38 92% 50%)";    // yellow — approximately yellow-500
  return "hsl(0 84% 60%)";                      // red — matches --destructive token
}

interface ScoreRingProps {
  score: number;  // 0–10
}

export function ScoreRing({ score }: ScoreRingProps) {
  const offset = CIRCUMFERENCE * (1 - score / 10);
  const color = getScoreColor(score);
  const cx = RING_SIZE / 2;

  return (
    <svg
      width={RING_SIZE}
      height={RING_SIZE}
      viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
      role="img"
      aria-label={`Adherence score: ${score.toFixed(1)} out of 10`}
    >
      {/* Track */}
      <circle
        cx={cx}
        cy={cx}
        r={RADIUS}
        fill="none"
        stroke="hsl(240 5.9% 90%)"
        strokeWidth={RING_STROKE}
      />
      {/* Progress — animated on mount */}
      <motion.circle
        cx={cx}
        cy={cx}
        r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={RING_STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        initial={{ strokeDashoffset: CIRCUMFERENCE }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        transform={`rotate(-90 ${cx} ${cx})`}   // MUST be static attr, not framer animate
      />
      {/* Score label */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="17"
        fontWeight="700"
        fill={color}
        className="font-sans"
      >
        {score.toFixed(1)}
      </text>
    </svg>
  );
}
```

### Dimension Row (Collapsible)

```typescript
// Source: CSS grid-rows-[0fr/1fr] expand/collapse pattern
// Each row is independently expandable; expandedDims is a Set<string> local to ScoreCard

interface DimensionRowProps {
  dimKey: string;
  dim: DimensionScore;
  isExpanded: boolean;
  onToggle: () => void;
  onImprove: () => void;
}

export function DimensionRow({ dimKey, dim, isExpanded, onToggle, onImprove }: DimensionRowProps) {
  const isFailing = dim.score < 7;  // or use existing scoreColor threshold
  return (
    <div className="rounded-md border border-border bg-card">
      {/* Header — always visible, clickable */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-accent/50 transition-colors"
      >
        <span className="font-medium text-foreground">{DIMENSION_LABELS[dimKey]}</span>
        <div className="flex items-center gap-2">
          <Badge variant={isFailing ? "destructive" : "success"} className="text-[10px] px-1.5 py-0">
            {dim.score.toFixed(1)}
          </Badge>
          <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", isExpanded && "rotate-180")} />
        </div>
      </button>

      {/* Expandable content — CSS grid-rows trick */}
      <div className={cn(
        "grid transition-[grid-template-rows] duration-200 ease-out",
        isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}>
        <div className="overflow-hidden">
          <div className="px-3 pb-2 pt-1 space-y-2 border-t border-border">
            {dim.notes && (
              <p className="text-[10px] text-muted-foreground leading-relaxed">{dim.notes}</p>
            )}
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={onImprove}>
              <Sparkles className="w-2.5 h-2.5 mr-1" />
              Improve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Score Card Entrance Animation

```typescript
// Source: framer-motion v12 AnimatePresence — verified exports from node_modules
import { AnimatePresence, motion } from "framer-motion";

// In page.tsx render, wrapping the score section:
<AnimatePresence>
  {score && !isScoring && (
    <motion.div
      key={`scorecard-${message.id}`}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* ScoreCard or inline score JSX */}
    </motion.div>
  )}
</AnimatePresence>
```

### Figma Panel — Redesigned Structure

```typescript
// The panel moves INSIDE the message list (after the messages.map block)
// Existing state: figmaExtraction, figmaLoading, figmaError, confirmFigma(), dismissFigma()
// Only the visual structure changes — all logic is untouched

{(figmaLoading || figmaExtraction || figmaError) && (
  <motion.div
    key="figma-panel"
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
    className="bg-white border border-border rounded-xl shadow-elevation-1 overflow-hidden"
  >
    {/* Header with frame name */}
    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
      <div className="flex items-center gap-2">
        <Layout className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{figmaExtraction?.frameName}</span>
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={dismissFigma}>
        <X className="w-3.5 h-3.5" />
      </Button>
    </div>
    {/* Components + Text nodes in two sections — existing data structure preserved */}
  </motion.div>
)}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` import from `"framer-motion"` | Official docs now recommend `"motion/react"` (different package) | v12 rebrand | This project uses `framer-motion` package — import from `"framer-motion"`, not `"motion/react"` |
| `max-height` for expand/collapse | `grid-template-rows: 0fr → 1fr` | 2024/2025 CSS | Animates to exact content height without arbitrary cap values |
| `exitBeforeEnter` prop on AnimatePresence | `mode="wait"` | framer-motion v7.2 | Old prop throws error in v12 |
| `<circle>` tag in framer-motion | `<motion.circle>` (supported since v4) | framer-motion v4 | motion.circle is fully supported and works for SVG animations |

**Deprecated/outdated in this codebase:**
- The existing score bar (`h-1.5 bg-muted rounded-full` with a colored inner div) is replaced by the SVG ring for overall score. The bar approach may still be used for individual dimension rows as a secondary indicator — this is discretion territory.
- The existing compact header row (ShieldCheck/ShieldX icon + Badge + Pass/Fail text + ChevronDown) is replaced by the radial ring layout.

---

## Discretion Recommendations

These are in Claude's discretion per CONTEXT.md. Concrete recommendations:

### Ring Dimensions
- 80×80px SVG viewBox, 8px stroke width, 36px radius. This renders at ~1.5× the line height of the score card text, making it visually prominent without dominating.
- Position: left side of score card header, with score summary text to the right.

### Color HSL Values
Use the same values already in `scoreBarColor()` and `scoreColor()` to guarantee consistency:
- Green: `hsl(142 71% 45%)` — matches Tailwind `green-500` approximately, visible on white
- Yellow: `hsl(38 92% 50%)` — matches Tailwind `yellow-500` approximately
- Red: `hsl(0 84% 60%)` — matches `--destructive: 0 84.2% 60.2%` CSS variable

Track ring color: `hsl(240 5.9% 90%)` — matches `--border` token.

### Score Card Animation
- Entrance: `opacity: 0→1, y: 4→0` over 200ms `easeOut` — matches existing `message-appear` timing.
- Ring fill: 600ms `easeOut` with 150ms delay after card appears — gives card a moment to settle first.

### Superseded Treatment
- `opacity-40` on the entire card container
- `pointer-events-none` to prevent interaction
- Replace Improve buttons with a single line: `text-[10px] text-muted-foreground italic "Superseded"` centered at bottom
- Do NOT collapse the card height — keep it readable in scroll history

### Indentation
- Score card: `ml-12` (48px) to align roughly with the start of the AI message card content (message card has `px-4` + icon width).
- This visually connects the score to the message without overlapping it.

---

## Open Questions

1. **Score threshold: 7 or 8 for green?**
   - What we know: CONTEXT.md says "green ~7+"; existing `scoreColor()` and `scoreBadgeVariant()` use 8 as the green threshold.
   - What's unclear: Which threshold wins for the ring? Using 7 for the ring but 8 for existing bars creates visual inconsistency on the same card.
   - Recommendation: Planner should standardize on 7 for all Phase 7 elements (ring, badge, bar) and note that this is a small inconsistency with the existing bar code — either update all thresholds in Phase 7 or note it as a known discrepancy. Do not leave them mixed.

2. **Figma panel: move inside message list or keep below?**
   - What we know: CONTEXT.md says "inline at the bottom of the message list as a card — part of the conversation stream." The current code renders it outside the scroll container, above the input.
   - What's unclear: Moving it inside the message list requires adding it after the `displayMessages.map()` block, inside the scrollable `div`. This is a structural change but all logic (figmaExtraction state, handlers) stays the same.
   - Recommendation: Yes, move it inside the scroll container. Add it as the last element before `<div ref={messagesEndRef} />`. Scroll-to-bottom already includes `messagesEndRef`, so the panel will auto-scroll into view.

3. **Per-dimension "Improve" prompt content**
   - What we know: Context says "feedback context is silently injected" for per-dimension improve.
   - What's unclear: Exact prompt format for per-dimension vs. overall. The existing `handleRegenerate` always sends an overall prompt.
   - Recommendation: Per-dimension prompt = `"The [Dimension Name] dimension scored [X]/10. [notes]. Please regenerate improving specifically this aspect."` Overall prompt = existing `handleRegenerate` logic. Both call `sendMessage()` directly.

---

## Sources

### Primary (HIGH confidence)
- Codebase direct analysis — `src/app/(dashboard)/chat/page.tsx` (full file read)
- Codebase direct analysis — `package.json`, `tailwind.config.ts`, `globals.css`, `src/types/index.ts`
- Codebase direct analysis — `src/components/ui/badge.tsx`, `src/components/ui/alert-dialog.tsx` (verified installed)
- `node_modules/framer-motion` — verified v12.34.0, verified exports: `motion`, `AnimatePresence`, `MotionConfig`, `LazyMotion`

### Secondary (MEDIUM confidence)
- [MDN stroke-dasharray](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/stroke-dasharray) — SVG ring math pattern
- [LogRocket: SVG circular progress with React](https://blog.logrocket.com/build-svg-circular-progress-component-react-hooks/) — React + SVG ring implementation pattern
- [framer-motion npm/WebSearch: v12 import paths](https://www.npmjs.com/package/framer-motion) — confirmed `framer-motion` vs `motion/react` distinction
- [shadcn/ui Alert Dialog](https://ui.shadcn.com/docs/components/radix/alert-dialog) — AlertDialog asChild pattern for Description

### Tertiary (LOW confidence)
- WebSearch: CSS grid-rows-[0fr/1fr] expand pattern — sourced from community articles (Cruip, Medium), not official docs. Pattern is widely reported and technically sound (CSS spec), but not verified against an official reference.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries; all packages verified in node_modules
- SVG ring math: HIGH — standard geometric formula verified against multiple sources
- Architecture patterns: HIGH — derived from direct codebase analysis
- framer-motion API: HIGH — exports verified programmatically from installed package
- CSS grid-rows collapse: MEDIUM — widely used pattern, technically correct, but sourced from community articles not MDN
- Pitfalls: HIGH — derived from codebase analysis and verified API behavior

**Research date:** 2026-02-21
**Valid until:** 2026-03-21 (30 days — stable stack, no fast-moving dependencies)
