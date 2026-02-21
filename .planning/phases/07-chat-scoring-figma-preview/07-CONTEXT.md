# Phase 7: Chat Scoring & Figma Preview - Context

**Gathered:** 2026-02-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign the two complex UI sections already preserved in `page.tsx` with `{/* PHASE 7: ... */}` markers — the adherence score cards (8-dimension brand voice scoring) and the Figma extraction preview panel. All scoring logic, API calls, data flow, and business behaviour stay untouched. Only the visual presentation layer changes.

</domain>

<decisions>
## Implementation Decisions

### Score Card Presentation
- Overall score displayed as a large radial/circular progress ring with the score value inside — the score is the hero
- Color system: green/yellow/red thresholds (green = passing ~7+, yellow = borderline ~5–6.9, red = failing <5)
- Score card sits indented below the AI message card, visually separate — score feels like metadata attached to the response
- While scoring is in progress: minimal spinner with a "Scoring..." label — no full skeleton shape until data arrives

### Dimension Expand/Collapse
- Default state shows: dimension name + score + pass/fail badge — scannable across all 8 dimensions
- Failing dimensions surface first; passing dimensions hidden under a "Show all" toggle
- Expanded state shows: score notes (feedback text) + an "Improve" button for that specific dimension
- Multiple dimensions can be expanded simultaneously — independent, not accordion

### Regenerate-with-Feedback UX
- Two entry points: per-dimension "Improve" button (in expanded state) and an overall "Improve" button on the score card
- Overall "Improve" button: opens a summary of all failing dimensions with their notes first — user reviews then confirms
- On trigger (both per-dimension and overall): feedback context is silently injected and a new message sends automatically — no manual input needed
- Button label: "Improve" with a wand/sparkle icon (both per-dimension and overall)
- After regeneration: the original score card collapses/dims to show it's superseded — keeps conversation history readable

### Figma Extraction Panel
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

</decisions>

<specifics>
## Specific Ideas

- The radial ring on the overall score is the visual anchor — it should be immediately readable (score inside, color-coded arc)
- "Failing dimensions first" means the most actionable information is at the top without requiring any interaction
- The "Improve" confirm flow (summary → confirm) prevents accidental regeneration and gives the user a moment to understand what's being sent
- Superseded score cards should read as "done/archived" not "broken" — subtle visual treatment, not aggressive

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 07-chat-scoring-figma-preview*
*Context gathered: 2026-02-21*
