# Phase 2: Component Library - Context

**Gathered:** 2026-02-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Install all shadcn/UI primitives, integrate form validation with React Hook Form + Zod, and build reusable skeleton loading, empty state, and toast notification patterns. These components become the building blocks that every later phase (auth, feature pages, chat, polish) composes into full pages. No page-level redesigns happen here — only primitives and patterns.

</domain>

<decisions>
## Implementation Decisions

### Skeleton Loading Design
- Pulse fade animation (shadcn/ui default style), not shimmer sweep
- Content-shaped skeletons that mirror the layout they replace (circle for avatar, short bar for title, longer bars for text)
- Three reusable skeleton variants built upfront: Card skeleton, Table skeleton, Form skeleton
- Page-specific skeleton compositions can be built from these three in later phases

### Empty State Design
- Lucide icons only (no custom illustrations) — clean, minimal, consistent with existing icon system
- Friendly and encouraging copy tone — e.g., "Looks like you're just getting started! Create a brand profile to begin."
- Three-element pattern: icon + heading + description + primary CTA button
- CTA uses primary button style (full primary-colored, not ghost/outline)

### Toast Notifications
- Bottom-center position (Material Design snackbar style)
- 5-second auto-dismiss duration for all toast types
- Stack up to 3 toasts when multiple fire at once (capped to avoid clutter)

### Form Validation UX
- Errors appear on blur (when user leaves a field) — not while typing, not on submit only
- Once an error is shown, it clears in real-time as the user fixes the input (satisfying instant feedback)
- Inline error messages: small red text directly below the invalid field
- On form submit with multiple errors: show a summary banner at the top ("3 fields need attention") in addition to inline errors per field

### Claude's Discretion
- Skeleton show delay (whether to add a brief delay before showing skeleton to avoid flash on fast loads)
- Error toast persistence behavior (auto-dismiss vs persist until manually dismissed)
- Exact skeleton animation timing and easing
- shadcn/UI primitive customization details beyond design token application

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. The decisions above define the patterns; implementation details follow shadcn/UI conventions and the Phase 1 design tokens.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-component-library*
*Context gathered: 2026-02-18*
