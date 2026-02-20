---
phase: 06-chat-interface-core
plan: "03"
subsystem: ui
tags: [chat, react, markdown, scroll, animation, memoization, streaming]

# Dependency graph
requires:
  - phase: 06-chat-interface-core
    provides: MemoizedMarkdown component and CSS animation primitives (typing-dot, message-flash, fade-in)
provides:
  - Redesigned message rendering in page.tsx with sender labels, zinc user card, white AI card
  - MemoizedMarkdown integrated for AI message rendering
  - Scroll lock detection (scrollContainerRef, isAtBottom, handleScroll)
  - Jump to bottom button (absolute positioned, animate-fade-in)
  - Bouncing typing-dot indicator on status=submitted
  - Completion flash via justCompletedId + animate-message-flash
  - Phase 7 boundary preserved with PHASE 7 comment markers
affects:
  - 06-04-PLAN.md
  - 07 (scoring card Phase 7)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Sender label pattern: text-xs 'You'/'Gooder' span above message card instead of avatar icons
    - Scroll lock pattern: scrollContainerRef + onScroll + isAtBottom state + gated scrollIntoView
    - Completion flash pattern: prevStatusRef tracks streaming->ready transition, justCompletedId drives animate-message-flash
    - Typing indicator: status=submitted condition (not isLoading) for pre-first-token phase only

key-files:
  created: []
  modified:
    - src/app/(dashboard)/chat/page.tsx

key-decisions:
  - "Sender labels ('You'/'Gooder') replace avatar icon containers per user decision — no avatar icons"
  - "User messages use bg-zinc-100 text-foreground (not primary color) per user decision"
  - "AI messages use bg-white border shadow-elevation-1 (white card with elevation) per user decision"
  - "message-bubble max-w-[80%] per card — not max-w-3xl on container (full-width layout)"
  - "Copy button always visible below AI card (not hover-only) — accessibility decision"
  - "Typing indicator uses status=submitted condition — shows only for pre-first-token phase"
  - "prevStatusRef initialized as useRef<string>('idle') — cannot reference status before useChat declaration"
  - "scoring card indent changed from ml-11 to ml-0 — avatars removed, no indent needed"
  - "PHASE 7 comment markers added to scoring/Figma JSX sections for boundary clarity"

patterns-established:
  - "Scroll lock pattern: scrollContainerRef + handleScroll + isAtBottom + gated scrollIntoView in useEffect"
  - "Jump to bottom: absolute positioned button inside relative scroll container, shows when !isAtBottom"
  - "Phase boundary comments: PHASE 7 markers on untouched scoring/Figma JSX blocks"

requirements-completed:
  - CHAT-01
  - CHAT-04
  - CHAT-06

# Metrics
duration: 4min
completed: 2026-02-20
---

# Phase 06 Plan 03: Message Rendering Redesign Summary

**Message area rebuilt with sender labels, zinc user cards, white AI cards with MemoizedMarkdown, bouncing typing-dot indicator, and scroll lock detection — Phase 7 scoring JSX preserved and marked**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-20T10:41:54Z
- **Completed:** 2026-02-20T10:45:33Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Replaced avatar icon circles with sender labels ('You'/'Gooder') above each message card
- User messages redesigned from primary-colored bubble to zinc-100 card with text-foreground
- AI messages redesigned to white card with border + shadow-elevation-1; content renders via MemoizedMarkdown
- Always-visible Copy button below each AI card (was hover-only inside bubble)
- Replaced Loader2/Bot typing indicator with three bouncing typing-dot spans (status=submitted gate)
- Added scroll lock detection: scrollContainerRef, isAtBottom state, handleScroll, gated scrollIntoView
- Jump to bottom button (absolute, animate-fade-in) appears when user scrolls up during streaming
- Completion flash: justCompletedId drives animate-message-flash on the last AI card when streaming finishes
- Full-width chat container (removed max-w-3xl from messages area), space-y-8 group spacing
- All Phase 7 scoring card and Figma extraction JSX preserved and marked with PHASE 7 comments

## Task Commits

Each task was committed atomically:

1. **Task 1: Add imports, state variables, and scroll handler** - `15e8e20` (feat)
2. **Task 2: Redesign message scroll container, empty state, and message bubbles** - `aaf0408` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/app/(dashboard)/chat/page.tsx` - Message area redesign: sender labels, zinc/white cards, MemoizedMarkdown, typing-dot, scroll lock, Jump to bottom, completion flash

## Decisions Made

- `prevStatusRef` initialized as `useRef<string>("idle")` instead of `useRef(status)` — TypeScript prevents referencing `status` before `useChat` declaration. "idle" is an appropriate default that won't match "streaming", so no false flash on mount.
- Scoring card div changed from `ml-11` to `ml-0` — the `ml-11` was compensating for the removed 44px avatar width; without avatars, no indent is needed for alignment.
- Empty state updated from `Bot` icon to `Sparkles` icon — consistent with header icon, no avatar per design decisions.
- `status === "submitted"` condition for typing indicator (not `isLoading`) — typing dots appear only before first assistant token arrives; during `status === "streaming"` the assistant card is already visible with content.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed prevStatusRef initialization using status before declaration**
- **Found during:** Task 1 (Add imports, state variables, and scroll handler)
- **Issue:** Plan specified `const prevStatusRef = useRef(status)` but `status` is destructured from `useChat` which is declared ~40 lines later — TypeScript TS2448/TS2454 errors
- **Fix:** Changed to `const prevStatusRef = useRef<string>("idle")` — explicit string type, "idle" default won't match "streaming" so no false flash on mount
- **Files modified:** src/app/(dashboard)/chat/page.tsx
- **Verification:** `npx tsc --noEmit` returned clean
- **Committed in:** 15e8e20 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 initialization bug)
**Impact on plan:** Required for TypeScript compilation. Semantically equivalent behavior — "idle" default prevents false completion flash on mount.

## Issues Encountered

None beyond the prevStatusRef initialization fix handled as Rule 1.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `page.tsx` message rendering fully redesigned; scroll lock and completion flash wired
- Phase 7 scoring card JSX is untouched and marked with `{/* PHASE 7: ... */}` comments
- `splitIntoSections`, `renderFormattedText`, `scoreMessage`, `toggleExpand`, `handleRegenerate`, `saveOutput` all preserved
- Plan 06-04 can proceed — chat input area redesign is the remaining Phase 6 work

---
*Phase: 06-chat-interface-core*
*Completed: 2026-02-20*

## Self-Check: PASSED

- FOUND: src/app/(dashboard)/chat/page.tsx
- FOUND: .planning/phases/06-chat-interface-core/06-03-SUMMARY.md
- FOUND commit: 15e8e20 (Task 1 - scroll state and imports)
- FOUND commit: aaf0408 (Task 2 - message rendering redesign)
