---
phase: 06-chat-interface-core
plan: "02"
subsystem: ui
tags: [react-markdown, react-shiki, remark-gfm, memoization, streaming, markdown-rendering]

# Dependency graph
requires:
  - phase: 06-chat-interface-core
    provides: chat page context and streaming architecture
provides:
  - MemoizedMarkdown component for block-level memoized markdown rendering
  - CodeBlock component for fenced and inline code with react-shiki github-light
affects:
  - 06-chat-interface-core (plan 03 and beyond will import from markdown-message.tsx)

# Tech tracking
tech-stack:
  added:
    - react-markdown (markdown-to-react renderer)
    - remark-gfm (GitHub Flavored Markdown plugin)
    - react-shiki (syntax highlighting via Shiki)
  patterns:
    - Block-level memoization pattern: parseMarkdownBlocks splits on empty lines, MarkdownBlock memoizes each block individually
    - MARKDOWN_COMPONENTS at module scope prevents new object reference per render
    - isInlineCode(node) from react-shiki for accurate inline vs fenced detection

key-files:
  created:
    - src/app/(dashboard)/chat/markdown-message.tsx
  modified:
    - package.json (react-markdown, remark-gfm, react-shiki added)

key-decisions:
  - "github-light theme for code blocks per user decision — no dark background"
  - "Language label top-left, copy button top-right in code block chrome"
  - "Inline code uses bg-zinc-100 to distinguish from AI card white surface"
  - "Always pass language ?? 'text' to ShikiHighlighter — never undefined"
  - "isInlineCode(node) from react-shiki for inline detection over newline-count heuristic"
  - "MARKDOWN_COMPONENTS defined at module scope to prevent reference churn"
  - "parseMarkdownBlocks splits at empty lines for block granularity memoization"

patterns-established:
  - "MemoizedMarkdown pattern: split content into blocks, memoize each, use message id in keys"
  - "CodeBlock pattern: isInlineCode gate → inline code path OR ShikiHighlighter fenced path"

requirements-completed:
  - CHAT-05

# Metrics
duration: 2min
completed: 2026-02-20
---

# Phase 6 Plan 02: Markdown Message Summary

**Memoized markdown renderer (MemoizedMarkdown + CodeBlock) with react-shiki github-light syntax highlighting and block-level streaming performance optimization**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-20T10:37:29Z
- **Completed:** 2026-02-20T10:39:45Z
- **Tasks:** 2
- **Files modified:** 1 created + package.json updated

## Accomplishments

- Created `markdown-message.tsx` with two named exports: `CodeBlock` and `MemoizedMarkdown`
- CodeBlock renders fenced code via react-shiki with github-light theme, language label top-left, copy button top-right; inline code renders with bg-zinc-100 distinct styling
- MemoizedMarkdown splits content into paragraph-level blocks via `parseMarkdownBlocks`, memoizes each with custom equality fn to prevent re-rendering completed blocks during streaming
- Installed react-markdown, remark-gfm, and react-shiki dependencies (not previously in package.json)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create CodeBlock component** - `175a632` (feat)
2. **Task 2: Add MemoizedMarkdown component** - `51d243d` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/app/(dashboard)/chat/markdown-message.tsx` - 164-line "use client" file with CodeBlock and MemoizedMarkdown exports
- `package.json` + `package-lock.json` - Added react-markdown, remark-gfm, react-shiki

## Decisions Made

- github-light theme for code blocks — light mode only project, no dark backgrounds per user decision
- Language label top-left / copy button top-right layout per project spec
- `MARKDOWN_COMPONENTS` at module scope prevents new object reference on every render (critical for memoization to work)
- `isInlineCode(node)` from react-shiki for accurate inline detection — avoids fragile newline-count heuristic (Pitfall 5 per research)
- Always pass `language ?? "text"` to ShikiHighlighter, never undefined
- No `@tailwindcss/typography` prose classes — not installed, manual Tailwind classes used throughout

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing npm dependencies**
- **Found during:** Task 1 (Create CodeBlock component)
- **Issue:** react-markdown, remark-gfm, and react-shiki were not in package.json; imports would fail without installation
- **Fix:** Ran `npm install react-markdown remark-gfm react-shiki` before writing the file
- **Files modified:** package.json, package-lock.json
- **Verification:** All imports resolved, TypeScript clean, build passes
- **Committed in:** 175a632 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking — missing dependencies)
**Impact on plan:** Required prerequisite for any imports to resolve. No scope creep.

## Issues Encountered

None beyond the missing dependency installation handled as Rule 3.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `markdown-message.tsx` is ready for import by `page.tsx` in Plan 06-03
- Both `MemoizedMarkdown` and `CodeBlock` are exported as named exports
- File is "use client", TypeScript clean, and build-verified
- No blockers

---
*Phase: 06-chat-interface-core*
*Completed: 2026-02-20*

## Self-Check: PASSED

- FOUND: src/app/(dashboard)/chat/markdown-message.tsx
- FOUND: .planning/phases/06-chat-interface-core/06-02-SUMMARY.md
- FOUND commit: 175a632 (Task 1 - CodeBlock)
- FOUND commit: 51d243d (Task 2 - MemoizedMarkdown)
