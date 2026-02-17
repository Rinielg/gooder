# Requirements: Gooder UI Redesign

**Defined:** 2026-02-17
**Core Value:** The UI should feel like a premium, modern product — clean, simple, and functional — not a default template.

## v1 Requirements

Requirements for the visual refresh. Each maps to roadmap phases.

### Design System Foundation

- [ ] **DSGN-01**: New color palette defined as CSS variables (HSL format) in globals.css, replacing current values
- [ ] **DSGN-02**: Typography system using Geist or Inter font with consistent scale (text-xs through text-2xl)
- [ ] **DSGN-03**: 8px spacing grid enforced via Tailwind config (consistent gaps, padding, margins)
- [ ] **DSGN-04**: Shadow/border elevation system with layered depth (shadow-sm for cards, shadow-lg for overlays)
- [ ] **DSGN-05**: shared.tsx split into individual component files matching shadcn convention (one component group per file)
- [ ] **DSGN-06**: Figma design system created with shadcn/UI component library, brand colors, and typography

### Component Library

- [ ] **COMP-01**: All missing shadcn/UI primitives installed via CLI (dialog, dropdown-menu, select, tabs, tooltip, skeleton, alert-dialog, breadcrumb, table, sheet, form, popover)
- [ ] **COMP-02**: Form components integrated with React Hook Form + Zod validation showing inline errors
- [ ] **COMP-03**: Skeleton loading states replacing spinner-based loading on all pages
- [ ] **COMP-04**: Empty state component with icon, heading, description, and CTA button
- [ ] **COMP-05**: Toast notifications (Sonner) restyled to match new design system

### App Shell & Navigation

- [ ] **SHELL-01**: Redesigned sidebar with collapse/expand toggle (icons-only when collapsed)
- [ ] **SHELL-02**: Mobile-responsive sidebar using Sheet component as slide-out drawer
- [ ] **SHELL-03**: Profile selector in sidebar restyled with new components
- [ ] **SHELL-04**: Active navigation state indicators on current page
- [ ] **SHELL-05**: Breadcrumb navigation on nested pages (e.g., Profiles > [Name] > Training)
- [ ] **SHELL-06**: Consistent page header pattern across all dashboard pages
- [ ] **SHELL-07**: PageContainer wrapper enforcing consistent padding and max-width

### Auth Pages

- [ ] **AUTH-01**: Login page redesigned with new design system (typography, colors, spacing, components)
- [ ] **AUTH-02**: Register page redesigned with new design system
- [ ] **AUTH-03**: Auth pages preserve all existing redirect behavior and Supabase integration

### Chat Interface

- [ ] **CHAT-01**: Chat message layout redesigned with new card/typography components
- [ ] **CHAT-02**: Streaming text rendering preserved with smooth token-by-token display
- [ ] **CHAT-03**: Streaming cursor animation preserved or improved
- [ ] **CHAT-04**: Auto-scroll behavior maintained during streaming
- [ ] **CHAT-05**: Markdown rendering in AI responses with proper heading, list, and code formatting
- [ ] **CHAT-06**: Copy-to-clipboard button on AI-generated messages
- [ ] **CHAT-07**: Adherence score cards redesigned with radial progress indicators and color coding
- [ ] **CHAT-08**: All 8 scoring dimensions visible with expand/collapse interaction
- [ ] **CHAT-09**: Regenerate-with-feedback button preserves specific dimension issues in prompt
- [ ] **CHAT-10**: Figma extraction preview UI preserved with component/text node lists
- [ ] **CHAT-11**: Chat input area restyled with new components (textarea, send button)

### Feature Pages

- [ ] **PAGE-01**: Profiles list page redesigned with ProfileCard components and empty state
- [ ] **PAGE-02**: Profile detail page redesigned with new layout and components
- [ ] **PAGE-03**: Profile training page redesigned preserving file upload drag-and-drop
- [ ] **PAGE-04**: Standards management page redesigned with consistent card/table layout
- [ ] **PAGE-05**: Objectives management page redesigned with consistent card/table layout
- [ ] **PAGE-06**: Definitions/glossary page redesigned with consistent card/table layout
- [ ] **PAGE-07**: Saved outputs page redesigned with consistent card/table layout
- [ ] **PAGE-08**: All list pages show skeleton loading states during data fetch
- [ ] **PAGE-09**: All list pages show empty states with CTAs when no data exists
- [ ] **PAGE-10**: All forms show inline validation errors (not modal/toast-only)

### Settings Page

- [ ] **SETT-01**: Settings page redesigned with new component system (tabs, forms, cards)
- [ ] **SETT-02**: Workspace and account settings sections clearly separated

### Polish & Interactions

- [ ] **POLH-01**: Subtle hover microinteractions on interactive elements (scale, shadow lift, color transitions)
- [ ] **POLH-02**: Contextual tooltips on icon-only buttons explaining their action
- [ ] **POLH-03**: Keyboard shortcut hints visible in tooltips where applicable
- [ ] **POLH-04**: Consistent transition timing (100-200ms) across all interactive elements
- [ ] **POLH-05**: Responsive layout tested at 1920px, 1440px, 1280px, and 768px breakpoints

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Navigation

- **NAV-01**: Command palette (Cmd+K) for global search, page navigation, and brand switching
- **NAV-02**: Keyboard shortcuts modal (? key) documenting all available shortcuts

### Visual Polish

- **VPOL-01**: Smooth page transitions using Framer Motion AnimatePresence between routes
- **VPOL-02**: Dark mode theme with full CSS variable set

### User Guidance

- **GUID-01**: First-time setup wizard (create brand profile, upload training docs)
- **GUID-02**: Progress checklist showing setup completion status
- **GUID-03**: Contextual feature discovery tooltips for new users

### Advanced Features

- **ADVF-01**: Intelligent search with URL-state filters on list pages
- **ADVF-02**: Advanced data visualizations (trend sparklines, comparison charts) for score history

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Dark mode | Light-only for now; can layer on later via CSS variable theming |
| New features or functionality | Purely visual refresh — no behavior changes |
| Backend/API changes | All existing endpoints stay as-is |
| Mobile-first responsive redesign | Desktop-first; responsive as bonus at key breakpoints |
| Animation overhaul | Keep Framer Motion usage minimal; CSS transitions preferred |
| New pages or routes | No new navigation destinations |
| Database schema changes | No data model modifications |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DSGN-01 | Phase 1 | Pending |
| DSGN-02 | Phase 1 | Pending |
| DSGN-03 | Phase 1 | Pending |
| DSGN-04 | Phase 1 | Pending |
| DSGN-05 | Phase 1 | Pending |
| DSGN-06 | Phase 1 | Pending |
| COMP-01 | Phase 2 | Pending |
| COMP-02 | Phase 2 | Pending |
| COMP-03 | Phase 2 | Pending |
| COMP-04 | Phase 2 | Pending |
| COMP-05 | Phase 2 | Pending |
| SHELL-01 | Phase 3 | Pending |
| SHELL-02 | Phase 3 | Pending |
| SHELL-03 | Phase 3 | Pending |
| SHELL-04 | Phase 3 | Pending |
| SHELL-05 | Phase 3 | Pending |
| SHELL-06 | Phase 3 | Pending |
| SHELL-07 | Phase 3 | Pending |
| AUTH-01 | Phase 4 | Pending |
| AUTH-02 | Phase 4 | Pending |
| AUTH-03 | Phase 4 | Pending |
| CHAT-01 | Phase 6 | Pending |
| CHAT-02 | Phase 6 | Pending |
| CHAT-03 | Phase 6 | Pending |
| CHAT-04 | Phase 6 | Pending |
| CHAT-05 | Phase 6 | Pending |
| CHAT-06 | Phase 6 | Pending |
| CHAT-07 | Phase 7 | Pending |
| CHAT-08 | Phase 7 | Pending |
| CHAT-09 | Phase 7 | Pending |
| CHAT-10 | Phase 7 | Pending |
| CHAT-11 | Phase 6 | Pending |
| PAGE-01 | Phase 5 | Pending |
| PAGE-02 | Phase 5 | Pending |
| PAGE-03 | Phase 5 | Pending |
| PAGE-04 | Phase 5 | Pending |
| PAGE-05 | Phase 5 | Pending |
| PAGE-06 | Phase 5 | Pending |
| PAGE-07 | Phase 5 | Pending |
| PAGE-08 | Phase 5 | Pending |
| PAGE-09 | Phase 5 | Pending |
| PAGE-10 | Phase 5 | Pending |
| SETT-01 | Phase 5 | Pending |
| SETT-02 | Phase 5 | Pending |
| POLH-01 | Phase 8 | Pending |
| POLH-02 | Phase 8 | Pending |
| POLH-03 | Phase 8 | Pending |
| POLH-04 | Phase 8 | Pending |
| POLH-05 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 49 total
- Mapped to phases: 49
- Unmapped: 0

---
*Requirements defined: 2026-02-17*
*Last updated: 2026-02-17 after roadmap creation (traceability mapped)*
