# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-17)

**Core value:** The UI should feel like a premium, modern product -- clean, simple, and functional -- not a default template.
**Current focus:** Phase 7: Chat Scoring & Output

## Current Position

Phase: 7.1 of 8 (Structured Output Cards)
Plan: 3 of 3 in current phase
Status: Complete
Last activity: 2026-02-22 -- Completed 07.1-03-PLAN.md — human verification approved; post-verify fixes committed (WhatsApp fallback, UX Journey parsing, accordion default collapsed)

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 10
- Average duration: 1.5 minutes
- Total execution time: 0.22 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 3 | 5 min | 1.7 min |
| 02 | 2 | 5 min | 2.5 min |
| 03 | 2 | 5 min | 2.3 min |
| 04 | 2 | 15 min | 7.5 min |
| 05 | 5 | 14 min | 2.8 min |

**Recent Trend:**
- Last 5 plans: 04-01 (10 min), 04-02 (5 min), 05-04 (1 min), 05-03 (3 min), 05-05 (7 min)
- Trend: Two-file rewrites with complex state changes ~7 min; form-heavy pages benefit from established RHF patterns

*Updated after each plan completion*

**Execution Details:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P01 | 3 min | 2 tasks | 19 files |
| Phase 01 P02 | 2 min | 2 tasks | 7 files |
| Phase 01 P03 | 0 min | 1 task | 0 files (Figma external) |
| Phase 02 P01 | 229 | 2 tasks | 16 files |
| Phase 02 P03 | 76 | 1 tasks | 1 files |
| Phase 02 P02 | 105 | 2 tasks | 3 files |
| Phase 03 P02 | 78 | 2 tasks | 3 files |
| Phase 03 P01 | 196 | 2 tasks | 4 files |
| Phase 04 P01 | 10 min | 2 tasks | 2 files |
| Phase 04 P02 | 5 min | 2 tasks | 1 files |
| Phase 05 P01 | 2 min | 2 tasks | 2 files |
| Phase 05 P04 | 1 min | 1 task | 1 files |
| Phase 05 P02 | 1 | 1 tasks | 1 files |
| Phase 05 P03 | 3 min | 2 tasks | 3 files |
| Phase 05 P05 | 7 | 2 tasks | 2 files |
| Phase 06 P01 | 2 min | 3 tasks | 4 files |
| Phase 06 P02 | 135 | 2 tasks | 1 files |
| Phase 06 P03 | 219 | 2 tasks | 1 files |
| Phase 06 P04 | 35 min | 2 tasks | 2 files |
| Phase 07 P01 | 2 | 2 tasks | 1 files |
| Phase 07.1 P01 | 2 | 2 tasks | 1 files |
| Phase 07.1 P02 | 1 | 1 tasks | 1 files |
| Phase 07.1 P03 | ~20min | 3 tasks + post-verify fixes | 4 files |
| Phase 07 P02 | 10 | 3 tasks | 1 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- shadcn/UI as component system (existing Radix+Tailwind+CVA foundation)
- Design in Figma first, then implement in code
- Light mode only (no dark mode)
- No functionality changes (visual refresh only)
- [Phase 01]: Split monolithic shared.tsx into 6 individual component files following shadcn/UI convention
- [Phase 01]: Use indigo/zinc palette from shadcn theme gallery (proven premium look)
- [Phase 01]: Extend Tailwind spacing with supplementary 8px-grid tokens (preserve defaults for shadcn compatibility)
- [Phase 01]: Mirror CSS variables into Figma Variables to keep design and code synchronized
- [Phase 01]: Use shadcn/UI community file as Figma base (provides complete component library)
- [Phase 02-03]: Use pulse fade animation for all skeleton variants (not shimmer)
- [Phase 02-03]: No built-in delay mechanism - keep skeletons stateless
- [Phase 02-02]: Named convenience wrapper FormInput to avoid conflict with shadcn's FormField Controller wrapper
- [Phase 02-02]: Toaster removed richColors prop for cleaner CSS variable integration with indigo/zinc palette
- [Phase 03-02]: PageContainer enforces 1280px max-width per user requirement
- [Phase 03-02]: Breadcrumbs return null on top-level pages to avoid redundant navigation
- [Phase 03-02]: Overrides prop pattern enables dynamic segment labeling without data fetching in breadcrumb component
- [Phase 03-01]: Opacity transitions instead of conditional rendering for smoother label fade animations
- [Phase 03-01]: Floating edge toggle handle for premium feel and space efficiency
- [Phase 03-01]: Loading placeholder at expanded width prevents hydration layout shift
- [Phase 04-01]: Split-screen layout established as auth page pattern (brand panel hidden md:flex + form flex-1)
- [Phase 04-01]: RHF + Zod replaces useState for all form field state; useState retained only for loading
- [Phase 04-01]: Auth pages own full-page layout — no PageContainer, no layout.tsx in (auth) group
- [Phase 04-02]: workspaceName is optional in Zod schema — fallback to email prefix + "'s Workspace" handled in onSubmit, not schema validation
- [Phase 04-02]: autoComplete="organization" for workspace name field as semantic HTML complement
- [Phase 05-01]: Feature components live in src/components/features/{feature}/ directory
- [Phase 05-01]: ProfileCard is pure presentational — no state, no data fetching; extracted from inline page markup
- [Phase 05-01]: CardSkeleton with className='grid-cols-1' for list-layout loading states on feature pages
- [Phase 05-04]: shadcn Tabs with defaultValue='workspace' separates settings into Workspace and Account sections
- [Phase 05-04]: RHF workspaceForm and passwordForm replace all useState form fields in settings page
- [Phase 05-04]: FormSkeleton fields={3} replaces Loader2 spinner in settings loading state
- [Phase 05-04]: workspaceForm.reset() in load() callback populates RHF-controlled workspace name field from Supabase
- [Phase 05]: Dynamic rules array stays as useState — not useFieldArray; RHF validates name/category only
- [Phase 05]: shadcn Select requires Controller wrapper with onValueChange pattern — not FormInput cloneElement
- [Phase 05]: deleteTarget state (string | null) drives AlertDialog: open={!!deleteTarget} replaces window.confirm()
- [Phase 05-03]: AlertDialog + deleteTarget pattern established as standard delete confirmation across management pages
- [Phase 05-03]: Definitions list migrated to shadcn Table (Term | Definition | delete) for improved scannability over card-per-row
- [Phase 05-03]: CardSkeleton className='grid-cols-1' for single-column card lists; TableSkeleton for tabular data
- [Phase 05]: Training page uses inline pulse skeleton not FormSkeleton+PageContainer — preserves flex flex-col h-full layout for chat interface
- [Phase 05]: AlertDialog replaces window.confirm() in profile detail: deleteProfileOpen (boolean) for profile delete, deleteDocTarget (string|null) for training doc delete
- [Phase 05]: Breadcrumbs overrides={{ [id]: entity.name }} pattern validated on profile detail and training pages
- [Phase 06-01]: react-markdown@10 is ESM-only; transpilePackages in next.config.js prevents require() of ES Module errors in Next.js 14
- [Phase 06-01]: streaming-cursor changed from block cursor to pulsing ellipsis with muted-foreground color
- [Phase 06-01]: CSS animation primitives for chat UI (typing-dot, message-flash) defined globally in globals.css
- [Phase 06]: github-light theme for code blocks, language label top-left, copy button top-right
- [Phase 06]: MARKDOWN_COMPONENTS at module scope prevents reference churn; isInlineCode(node) for accurate inline detection
- [Phase 06]: Block-level memoization pattern: parseMarkdownBlocks + MarkdownBlock memoization for streaming performance
- [Phase 06-03]: Sender labels ('You'/'Gooder') replace avatar icons; user messages use bg-zinc-100, AI messages use bg-white + shadow-elevation-1
- [Phase 06-03]: prevStatusRef initialized as useRef<string>('idle') — cannot reference status before useChat declaration
- [Phase 06-03]: Typing indicator uses status=submitted (not isLoading) — bouncing dots only for pre-first-token phase
- [Phase 06-03]: Scoring card indent changed from ml-11 to ml-0 — avatars removed, no indent needed
- [Phase 06-03]: PHASE 7 comment markers added to scoring/Figma JSX for boundary clarity
- [Phase 06-04]: Textarea not disabled during streaming — stop button is cancel mechanism; isLoading (not isStreaming) used for send/stop toggle
- [Phase 06-04]: Input floated as rounded card (w-[50vw] with shadow) rather than full-width border-t strip for premium feel
- [Phase 06-04]: layout.tsx merged into single JSX tree — split mobile/desktop returns unmounted children on resize, resetting chat page state
- [Phase 07-01]: Score threshold 7 used in score-card.tsx per CONTEXT.md; Phase 6 page.tsx functions remain at 8 — intentional documented discrepancy
- [Phase 07-01]: motion.circle transform is static SVG attribute (not framer animate target) to preserve 12-o'clock ring start position
- [Phase 07-01]: AlertDialogDescription asChild renders as div for block-level failing dimension children (avoids div-in-p hydration error)
- [Phase 07-01]: expandedDims (per-dimension) is separate local state from expandedIds in page.tsx — two independent expand levels
- [Phase 07.1]: overflow-x-auto with native div used for UX Journey horizontal scroll — ScrollArea component is vertical-only
- [Phase 07.1]: Array.from(matchAll()) used instead of spread operator — TS error on RegExpStringIterator without explicit target
- [Phase 07.1]: OUTPUT_TYPE_CONFIG exported from output-card.tsx for reuse in adjust-dialog.tsx without duplication
- [Phase 07.1-02]: Internal text state in AdjustDialog — adjustText never reaches page.tsx, preventing message list re-renders on every keystroke (research pitfall 5)
- [Phase 07.1-03]: isCurrentlyStreaming gates on both 'streaming' and 'submitted' status — both mean partial content pre-full-response
- [Phase 07.1-03]: submitAdjust() truncates sectionBody to 200 chars — avoids echoing full content in every adjust prompt
- [Phase 07.1-03]: AdjustDialog at z-20 above input form z-10 — prevents z-index overlap
- [Phase 07.1-03]: WhatsApp card always uses section.body.trim() fallback — removes gray MemoizedMarkdown fallback path
- [Phase 07.1-03]: JourneyScreenCard parses Headline/Body copy/CTA via parseScreenSections() multi-variant regex
- [Phase 07.1-03]: Adherence score accordion starts collapsed (expandedDims empty Set, showAll false); auto-expand on score arrival removed
- [Phase 07.1-03]: SectionedMessage in markdown-message.tsx uses ANALYSIS_RE to route sections to accordion vs card
- [Phase 07-02]: Score thresholds updated from 8/6 to 7/5 in page.tsx to match score-card.tsx and CONTEXT.md
- [Phase 07-02]: handleImprove per-dimension fires targeted sendMessage prompt; overall delegates to handleRegenerate AlertDialog flow
- [Phase 07-02]: Figma panel moved inside scroll container to appear in conversation flow rather than fixed border-top strip above input

### Roadmap Evolution

- Phase 07.1 inserted after Phase 7: Structured Output Cards (URGENT) — per-output-type chat cards with Save/Copy/Adjust, UX journey horizontal scroll, email/push/SMS field rendering

### Pending Todos

None yet.

### Blockers/Concerns

- ~~Figma token export pipeline not validated end-to-end (research gap).~~ RESOLVED: Manual CSS variable authoring from Figma visual specs is the chosen approach. Tokens are mirrored in both systems.
- ~~Geist vs Inter font decision still open.~~ RESOLVED: Geist font installed and configured in 01-02.
- ~~Chat page (1012 lines) is highest risk. Migrated last in Phases 6-7.~~ Phase 6 fully complete and verified. Phase 7 scoring/output work remains.

## Session Continuity

Last session: 2026-02-22
Stopped at: Completed 07-02-PLAN.md — ScoreCard wired into page.tsx, Figma panel repositioned inside scroll container, human verification approved
Resume file: None
