# Phase 4: Auth Pages - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign the login and register pages using the new design system (Phase 1 tokens, Phase 2 components). All existing auth behavior is preserved — no new auth methods, flows, or capabilities. Only the visual presentation changes.

</domain>

<decisions>
## Implementation Decisions

### Page layout structure
- Split-screen layout: left half is a brand panel, right half holds the form
- Brand panel (left): light background with the Gooder logo, a product UI screenshot/preview, and a short tagline below
- Form panel (right): contains the auth form — email, password, submit button, and navigation link to register/login

### Claude's Discretion
- Exact column width split (e.g., 45/55 or 50/50)
- Screenshot presentation style (card with shadow, rounded corners, slight tilt/float treatment)
- Tagline copy (unless a specific one exists in the codebase)
- Form layout within the right panel (label position, field spacing, button style)
- Mobile behavior — brand panel likely hidden on narrow viewports, form takes full width

</decisions>

<specifics>
## Specific Ideas

- The brand panel should feel aspirational — the screenshot gives users a preview of what they're signing into before they log in
- Light treatment for the brand panel aligns with the indigo/zinc light-mode palette established in Phase 1

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-auth-pages*
*Context gathered: 2026-02-19*
