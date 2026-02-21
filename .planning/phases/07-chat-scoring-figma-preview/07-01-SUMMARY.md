---
phase: 07-chat-scoring-figma-preview
plan: "01"
subsystem: ui
tags: [react, framer-motion, svg, radial-progress, shadcn, alert-dialog, tailwind]

# Dependency graph
requires:
  - phase: 06-chat-redesign
    provides: "Chat page foundation, existing AdherenceScore state/handlers, expandedIds toggle pattern"
provides:
  - "ScoreRing SVG component: animated radial progress ring for adherence score display"
  - "ScoreCard component: full dimension breakdown with expand/collapse, Improve flow, superseded treatment"
affects:
  - "07-02 (page.tsx integration: import ScoreCard and wire props)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SVG radial progress ring via stroke-dasharray/strokeDashoffset math (no library)"
    - "motion.circle for mount animation — static transform attr for 12-o'clock start"
    - "CSS grid-rows-[0fr/1fr] for independent per-dimension collapse animation"
    - "AlertDialogDescription asChild to render div children (avoids div-in-p hydration error)"
    - "Failing-first sort: Object.entries split into failing/passing, sorted before render"

key-files:
  created:
    - src/app/(dashboard)/chat/score-card.tsx
  modified: []

key-decisions:
  - "Score threshold 7 (not 8) used consistently in score-card.tsx per CONTEXT.md; Phase 6 functions in page.tsx untouched at 8"
  - "ScoreRing transform is static SVG attribute, not framer-motion animate target — prevents coordinate center mismatch"
  - "AlertDialogDescription asChild renders as div to support block-level failing dimension list without hydration error"
  - "expandedDims Set is local state in ScoreCard — independent of expandedIds in page.tsx (two distinct expand levels)"
  - "isSuperseded applies opacity-40 + pointer-events-none to entire card; superseded label replaces Improve buttons"

patterns-established:
  - "ScoreCard prop contract: messageId + score + isExpanded + onToggleExpand + onImprove + isSuperseded"
  - "Per-dimension Improve fires onImprove(messageId, score, key) directly; overall Improve requires AlertDialog confirm"
  - "Passing dimensions hidden under 'Show N passing' toggle when showAll=false"

requirements-completed:
  - CHAT-07
  - CHAT-08
  - CHAT-09

# Metrics
duration: 2min
completed: 2026-02-21
---

# Phase 7 Plan 01: ScoreCard Component Summary

**Extracted scoring UI into ScoreCard + ScoreRing components: animated SVG radial ring, independent per-dimension collapse, AlertDialog overall Improve flow, and superseded treatment**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-21T16:46:21Z
- **Completed:** 2026-02-21T16:48:22Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- ScoreRing: hand-rolled SVG with two circles, framer-motion mount animation on strokeDashoffset (CIRCUMFERENCE to computed offset), static `rotate(-90 cx cy)` transform for 12-o'clock start
- ScoreCard: failing-first sort, independent per-dimension expand/collapse via CSS grid-rows trick, per-dimension Improve fires directly, overall Improve opens AlertDialog with failing dimension summaries
- isSuperseded treatment: opacity-40 + pointer-events-none on wrapper + "Superseded" label replaces Improve buttons
- All verification criteria confirmed: zero TypeScript errors, build passes, framer-motion import correct, AlertDialogDescription asChild pattern, transform as static attr

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ScoreRing SVG component** - `359a9c6` (feat)
2. **Task 2: Build ScoreCard with dimensions, expand/collapse, Improve buttons** - `f28478a` (feat)

**Plan metadata:** (see docs commit below)

## Files Created/Modified

- `src/app/(dashboard)/chat/score-card.tsx` - New file: ScoreRing + ScoreCard exports (328 lines)

## Decisions Made

- Score threshold 7 used throughout score-card.tsx (getRingColor, getDimBadgeVariant) per CONTEXT.md "~7+" decision; existing Phase 6 functions in page.tsx use 8 and are untouched — known intentional discrepancy documented
- `transform={rotate(-90 cx cx)}` applied as static SVG attribute on `motion.circle` — framer-motion rotate would apply around element center (not SVG coordinate center), breaking the 12-o'clock start position
- `AlertDialogDescription asChild` renders the description element as `<div>` so block-level content (failing dimension list) can be children without triggering React hydration warning about `<div>` inside `<p>`
- `expandedDims` (per-dimension) is separate local state from `expandedIds` (outer card toggle from page.tsx) — two distinct expand levels as specified in research anti-patterns

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- ScoreCard and ScoreRing are ready for import into page.tsx
- Plan 07-02 will wire props: `isExpanded={expandedIds.has(message.id)}`, `onToggleExpand={() => toggleExpand(message.id)}`, `onImprove={handleImprove}`, `isSuperseded={regeneratedFromIds.has(message.id)}`
- `handleImprove` wrapper function in page.tsx (not yet built) will call into existing `handleRegenerate` for overall flow and add per-dimension prompt variant

---
*Phase: 07-chat-scoring-figma-preview*
*Completed: 2026-02-21*
