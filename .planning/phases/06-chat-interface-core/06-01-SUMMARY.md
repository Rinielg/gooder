---
phase: 06-chat-interface-core
plan: "01"
subsystem: ui
tags: [react-markdown, remark-gfm, react-shiki, css, animations, next.js, esm]

# Dependency graph
requires: []
provides:
  - react-markdown@10.1.0 installed and importable in client components
  - remark-gfm@4.0.1 installed for GitHub Flavored Markdown
  - react-shiki@0.9.1 installed for syntax highlighting
  - next.config.js transpilePackages includes react-markdown and remark-gfm for ESM compatibility
  - CSS keyframes: typing-dot, message-flash, updated streaming-cursor (ellipsis)
affects:
  - 06-02-PLAN.md
  - 06-03-PLAN.md
  - 06-04-PLAN.md

# Tech tracking
tech-stack:
  added:
    - react-markdown@^10.1.0
    - remark-gfm@^4.0.1
    - react-shiki@^0.9.1
  patterns:
    - ESM packages require transpilePackages in next.config.js for Next.js 14 compatibility
    - CSS animation keyframes defined in globals.css for shared chat UI primitives

key-files:
  created: []
  modified:
    - package.json
    - package-lock.json
    - next.config.js
    - src/app/globals.css

key-decisions:
  - "react-markdown@10 is ESM-only; transpilePackages in next.config.js prevents require() of ES Module errors"
  - "streaming-cursor changed from block cursor (▋) to pulsing ellipsis (' ...') with muted-foreground color"
  - "typing-dot uses bounce animation (translateY -5px at 30%) for three-dot typing indicator"
  - "message-flash uses 0.06 primary opacity at 40% for subtle highlight effect"

patterns-established:
  - "CSS animation primitives for chat UI live in globals.css for global availability"

requirements-completed:
  - CHAT-02
  - CHAT-03

# Metrics
duration: 2min
completed: 2026-02-20
---

# Phase 06 Plan 01: Dependencies & CSS Primitives Summary

**react-markdown, remark-gfm, and react-shiki installed with ESM transpilation config; typing-dot, message-flash, and updated streaming-cursor keyframes added to globals.css**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-20T10:37:27Z
- **Completed:** 2026-02-20T10:38:52Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Installed react-markdown@^10.1.0, remark-gfm@^4.0.1, react-shiki@^0.9.1 (112 new packages total)
- Updated next.config.js transpilePackages to prevent ESM import errors in production builds
- Added three CSS animation primitives to globals.css: typing-dot bounce, message-flash highlight, and updated streaming-cursor ellipsis

## Task Commits

Each task was committed atomically:

1. **Task 1: Install react-markdown, remark-gfm, react-shiki** - `40ac5d7` (chore)
2. **Task 2: Update next.config.js for ESM transpilation** - `3413343` (chore)
3. **Task 3: Add chat animation keyframes to globals.css** - `4188466` (feat)

**Plan metadata:** (docs: complete plan)

## Files Created/Modified
- `package.json` - Added react-markdown, remark-gfm, react-shiki dependencies
- `package-lock.json` - Updated with 112 new packages
- `next.config.js` - transpilePackages extended to ["geist", "react-markdown", "remark-gfm"]
- `src/app/globals.css` - streaming-cursor updated; typing-dot and message-flash keyframes added

## Decisions Made
- Used transpilePackages (not serverComponentsExternalPackages) for react-markdown ESM compatibility — this is the correct Next.js 14 approach for client component packages
- streaming-cursor switched from block cursor `▋` with primary color to pulsing ellipsis `" ..."` with muted-foreground color for softer visual appearance
- typing-dot animation duration 1s ease-in-out for smooth bounce feel; message-flash 0.8s ease-out for quick but noticeable highlight

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All three packages are importable; plans 06-02, 06-03, and 06-04 can proceed
- CSS classes `.typing-dot` and `.animate-message-flash` are globally available
- `.streaming-cursor::after` now renders ellipsis as specified in chat redesign

---
*Phase: 06-chat-interface-core*
*Completed: 2026-02-20*
