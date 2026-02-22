---
phase: 07-chat-scoring-figma-preview
plan: "02"
subsystem: ui
tags: [react, framer-motion, score-card, figma-panel, chat, animation]

# Dependency graph
requires:
  - phase: 07-chat-scoring-figma-preview/07-01
    provides: ScoreCard component with radial ring, dimension expand/collapse, Improve buttons, and AdherenceScore types
provides:
  - ScoreCard wired into page.tsx message render loop with AnimatePresence entrance animation
  - regeneratedFromIds state tracking superseded score cards after Improve actions
  - handleImprove function routing per-dimension and overall Improve flows
  - Score threshold helpers updated to 7/5 (green/yellow) per CONTEXT.md
  - Figma extraction panel repositioned inside scroll container (id=figma-panel-inline)
affects:
  - 07-chat-scoring-figma-preview/07-03
  - phase-07.1

# Tech tracking
tech-stack:
  added: []
  patterns:
    - AnimatePresence + motion.div wrapper for score card entrance (opacity 0→1, y 4→0)
    - regeneratedFromIds Set state for superseded card visual treatment
    - handleImprove routes per-dimension to sendMessage and overall to handleRegenerate
    - Inline panel positioning (inside scroll container) instead of external border-t strip

key-files:
  created: []
  modified:
    - src/app/(dashboard)/chat/page.tsx

key-decisions:
  - "Score thresholds updated from 8/6 to 7/5 in page.tsx to match score-card.tsx and CONTEXT.md — standardised across both files"
  - "handleImprove per-dimension sends targeted DIMENSION_LABELS prompt directly via sendMessage; overall delegates to existing handleRegenerate"
  - "Figma panel moved inside scroll container so it scrolls with message list — removes awkward fixed border-top section above input"
  - "AnimatePresence used at score card level, not message level — only the card entrance/exit animates"

patterns-established:
  - "Per-dimension Improve: setRegeneratedFromIds to dim card + targeted sendMessage prompt with dimension label and notes"
  - "Overall Improve: setRegeneratedFromIds to dim card + delegate to handleRegenerate (existing AlertDialog flow)"
  - "Superseded score card: regeneratedFromIds.has(message.id) passed as isSuperseded prop → opacity-40 + pointer-events-none in ScoreCard"

requirements-completed:
  - CHAT-09
  - CHAT-10

# Metrics
duration: ~10min
completed: 2026-02-22
---

# Phase 07 Plan 02: ScoreCard Wiring and Figma Panel Repositioning Summary

**ScoreCard component wired into chat message loop with AnimatePresence animation, regeneratedFromIds supersede state, handleImprove routing, and Figma panel moved inside the scroll container**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-02-21T16:51:00Z
- **Completed:** 2026-02-22 (checkpoint approved)
- **Tasks:** 3 (2 auto + 1 checkpoint:human-verify)
- **Files modified:** 1

## Accomplishments

- Replaced ~170 lines of inline score JSX in page.tsx with the `ScoreCard` component, wiring all required props (messageId, score, isExpanded, onToggleExpand, onImprove, isSuperseded)
- Added `regeneratedFromIds` Set state and `handleImprove` function — per-dimension fires a targeted `sendMessage` prompt, overall delegates to `handleRegenerate`
- Moved Figma extraction panel inside the scroll container (before `messagesEndRef`), removing the external `border-top` section that rendered outside the scrollable area
- Standardised score color thresholds from 8/6 to 7/5 across all three helper functions (`scoreColor`, `scoreBadgeVariant`, `scoreBarColor`), matching `score-card.tsx` and CONTEXT.md

## Task Commits

Each task was committed atomically:

1. **Task 1: Add ScoreCard import, regeneratedFromIds, handleImprove, update thresholds** - `8fbe1b4` (feat)
2. **Task 2: Replace inline score JSX with ScoreCard + move Figma panel inline** - `89f9c09` (feat)
3. **Task 3: Human verification checkpoint** - approved by user

## Files Created/Modified

- `src/app/(dashboard)/chat/page.tsx` - ScoreCard wired into message render loop; Figma panel repositioned; handleImprove added; thresholds updated

## Decisions Made

- Score thresholds updated from 8/6 to 7/5 in `page.tsx` to match `score-card.tsx` and CONTEXT.md, standardising the green/yellow/red bands across both files. The previous discrepancy was a documented intentional hold from Phase 07-01.
- `handleImprove` per-dimension path sends a targeted prompt directly via `sendMessage` (no dialog); the overall path calls `handleRegenerate(score)` which shows the existing AlertDialog summarising failing dimensions.
- Figma panel moved inside the scroll container so it appears in the natural reading flow of the conversation rather than as a fixed strip above the input bar.
- `AnimatePresence` wraps only the score card, not individual messages — entrance animation scoped to the card arrival moment.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - TypeScript compiled cleanly and build passed after both tasks. Human verification approved all 9 checks.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 7 scoring UI is fully live: radial ring, dimension expand/collapse, Improve flows (per-dimension and overall), superseded card treatment, and inline Figma panel all verified working
- Phase 7.1 (Structured Output Cards) has since been completed — this plan's wiring was the prerequisite

---
*Phase: 07-chat-scoring-figma-preview*
*Completed: 2026-02-22*
