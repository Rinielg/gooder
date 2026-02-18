# Phase 3: App Shell & Navigation - Context

**Gathered:** 2026-02-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign the app shell: sidebar navigation with collapse/expand and mobile drawer, brand profile selector, active page indicators, breadcrumb navigation on nested pages, and consistent PageContainer/PageHeader wrappers for all dashboard pages. No new pages or routes — this wraps existing content in the new navigation system.

</domain>

<decisions>
## Implementation Decisions

### Sidebar behavior
- Medium width when expanded (240-260px)
- Collapse/expand toggle is a floating edge handle on the sidebar's right edge
- Smooth slide transition (~200ms) — labels fade out, icons stay
- Collapsed state persists across sessions via localStorage

### Mobile navigation
- Sidebar switches to mobile drawer at 1024px (lg breakpoint)
- Hamburger trigger placement: Claude's discretion
- Drawer slide direction: Claude's discretion
- Overlay tap closes the drawer
- Navigating to a page does NOT auto-close the drawer — lets user browse multiple pages
- Same content as desktop sidebar (full parity)
- Mobile top bar shows logo/brand only (not page title)
- Mobile top bar includes a "New Chat" shortcut button alongside the hamburger

### Profile selector
- Positioned at the top of the sidebar — first thing visible
- Shows brand name only with a chevron when expanded (no avatar or description)
- Opens as a popover with search/filter input for users with many brands
- When sidebar is collapsed: shows first letter of brand name in a circle avatar — clickable to open popover

### Page framing
- PageContainer max-width: 1280px, centered
- PageHeader: title on the left, action buttons on the right (no description line)
- Breadcrumbs: text links with separators (Profiles > Brand Name > Training)
- Breadcrumbs appear above the page title on nested pages — hierarchy flows top-down

### Claude's Discretion
- Hamburger trigger placement on mobile
- Mobile drawer slide direction (left or bottom)
- Exact spacing and padding within sidebar items
- Active navigation indicator style (background, border-left, color change)
- Collapsed sidebar width (typically 64-80px)
- PageContainer horizontal padding amount

</decisions>

<specifics>
## Specific Ideas

No specific references — open to standard approaches within the design system established in Phases 1-2.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-app-shell-navigation*
*Context gathered: 2026-02-18*
