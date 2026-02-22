# Roadmap: Gooder UI Redesign

## Overview

This roadmap transforms Gooder from a functional-but-generic brand voice AI platform into a premium, ultra-modern product. The work proceeds bottom-up: establish design tokens and Figma design system first, install and customize the shadcn/UI component library, rebuild the app shell and navigation, then migrate pages from simplest (auth, settings) to most complex (chat with streaming and scoring). Chat is split into two phases per research guidance -- it is the highest-risk page due to streaming state, 8-dimension scoring, and Figma integration. Polish and responsive QA come last, after all pages are functional with the new component system.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Design System & Figma Foundation** - Define design tokens (colors, typography, spacing, shadows), create Figma design system, split shared.tsx into individual components
- [ ] **Phase 2: Component Library** - Install all shadcn/UI primitives, integrate form validation, build skeleton/empty-state/toast patterns
- [ ] **Phase 3: App Shell & Navigation** - Redesign sidebar with collapse/expand and mobile drawer, add breadcrumbs, page headers, and consistent layout wrapper
- [ ] **Phase 4: Auth Pages** - Redesign login and register pages as first end-to-end validation of the new design system
- [ ] **Phase 5: Feature Pages & Settings** - Redesign all management pages (profiles, standards, objectives, definitions, outputs, settings) with consistent patterns
- [x] **Phase 6: Chat Interface Core** - Redesign chat layout, message rendering, streaming behavior, markdown display, copy button, and input area (completed 2026-02-20)
- [ ] **Phase 7: Chat Scoring & Figma Preview** - Redesign adherence score cards with radial progress, dimension expand/collapse, regenerate-with-feedback, and Figma extraction UI
- [ ] **Phase 8: Polish & Responsive QA** - Add microinteractions, contextual tooltips, keyboard hints, consistent transitions, and responsive testing at all breakpoints

## Phase Details

### Phase 1: Design System & Figma Foundation
**Goal**: Every visual decision (color, type, spacing, elevation) has a single source of truth usable in both Figma and code
**Depends on**: Nothing (first phase)
**Requirements**: DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05, DSGN-06
**Success Criteria** (what must be TRUE):
  1. New color palette is live in globals.css as HSL CSS variables, and every existing page renders with the new colors (atomic swap, no mixed old/new)
  2. Typography uses a single font family (Geist or Inter) with a consistent scale from text-xs through text-2xl visible across existing pages
  3. Tailwind config enforces 8px spacing grid -- all gap/padding/margin utilities align to the grid
  4. shared.tsx no longer exists; each component group lives in its own file under src/components/ui/ following shadcn convention
  5. A Figma file exists with the brand color palette, typography scale, and shadcn/UI component library ready for page design
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md -- Split shared.tsx into individual shadcn component files
- [ ] 01-02-PLAN.md -- Define design tokens (color palette, Geist font, spacing grid, shadow elevation)
- [ ] 01-03-PLAN.md -- Create Figma design system with brand tokens and component library

### Phase 2: Component Library
**Goal**: All reusable UI primitives are installed, customized to the design system, and ready for page-level composition
**Depends on**: Phase 1
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05
**Success Criteria** (what must be TRUE):
  1. All required shadcn/UI primitives (dialog, dropdown-menu, select, tabs, tooltip, skeleton, alert-dialog, breadcrumb, table, sheet, form, popover) are installed and render with the Phase 1 design tokens
  2. A form built with React Hook Form + Zod displays inline validation errors below each invalid field (not modal or toast-only)
  3. A skeleton loading component exists that matches content layout shape and can replace any spinner-based loading state
  4. An EmptyState component exists with icon, heading, description, and CTA button -- usable on any list page
  5. Sonner toast notifications render with the new design system colors and typography
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md -- Install all 12 shadcn/UI primitives via CLI and react-hook-form
- [ ] 02-02-PLAN.md -- Form validation integration, EmptyState component, and Sonner toast restyling
- [ ] 02-03-PLAN.md -- Skeleton loading variants (CardSkeleton, TableSkeleton, FormSkeleton)

### Phase 3: App Shell & Navigation
**Goal**: Users navigate the app through a polished, responsive sidebar with clear hierarchy indicators and consistent page framing
**Depends on**: Phase 2
**Requirements**: SHELL-01, SHELL-02, SHELL-03, SHELL-04, SHELL-05, SHELL-06, SHELL-07
**Success Criteria** (what must be TRUE):
  1. Sidebar can be collapsed to icons-only mode and expanded back, with the toggle persisting across page navigations
  2. On viewports narrower than the desktop breakpoint, the sidebar renders as a slide-out Sheet drawer instead of a fixed panel
  3. The active page is visually indicated in sidebar navigation (distinct background/color on the current route link)
  4. Nested pages display breadcrumb navigation showing the hierarchy (e.g., Profiles > Brand Name > Training)
  5. Every dashboard page uses a consistent PageContainer wrapper with uniform padding and max-width, plus a PageHeader with title and optional actions
**Plans**: 3 plans

Plans:
- [ ] 03-01-PLAN.md -- Collapsible sidebar with hooks, profile selector popover, and active nav indicators
- [ ] 03-02-PLAN.md -- PageContainer, PageHeader, and dynamic Breadcrumbs components
- [ ] 03-03-PLAN.md -- Mobile Sheet drawer navigation and responsive dashboard layout

### Phase 4: Auth Pages
**Goal**: Login and register pages look intentionally designed and premium while preserving all existing auth behavior
**Depends on**: Phase 2
**Requirements**: AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (what must be TRUE):
  1. Login page renders with new design system typography, colors, spacing, and shadcn/UI form components
  2. Register page renders with new design system typography, colors, spacing, and shadcn/UI form components
  3. All existing auth flows work identically: login redirects to dashboard, register creates account, invalid credentials show errors, Supabase session persists across refresh
**Plans**: 2 plans

Plans:
- [ ] 04-01-PLAN.md -- Login page redesign (split-screen, brand panel, screenshot asset, RHF form)
- [ ] 04-02-PLAN.md -- Register page redesign (same split-screen structure, 3-field RHF form, workspace API call preserved)

### Phase 5: Feature Pages & Settings
**Goal**: All management pages (profiles, standards, objectives, definitions, outputs, settings) use the new design system with consistent patterns for lists, forms, loading, and empty states
**Depends on**: Phase 3
**Requirements**: PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05, PAGE-06, PAGE-07, PAGE-08, PAGE-09, PAGE-10, SETT-01, SETT-02
**Success Criteria** (what must be TRUE):
  1. Profiles list page displays ProfileCard components with new styling, and the profile detail and training pages use new layout components with file upload drag-and-drop still functional
  2. Standards, objectives, and definitions pages each render with consistent card/table layouts using shadcn Table and Card components
  3. Saved outputs page renders with consistent card/table layout matching the other management pages
  4. Every list page shows skeleton loading states during data fetch and an EmptyState with CTA button when no data exists
  5. Every form across all feature pages shows inline validation errors below invalid fields (not only via toast/modal)
  6. Settings page renders with tabbed layout (shadcn Tabs) clearly separating workspace and account sections
**Plans**: 5 plans

Plans:
- [ ] 05-01-PLAN.md — Profiles list page + ProfileCard component
- [ ] 05-02-PLAN.md — Standards management page (RHF, shadcn Select, AlertDialog)
- [ ] 05-03-PLAN.md — Objectives + Definitions + Outputs (batched simple list pages)
- [ ] 05-04-PLAN.md — Settings page (Tabs layout, two RHF forms)
- [ ] 05-05-PLAN.md — Profile detail page + training page (breadcrumbs, AlertDialog, critical-risk upload preservation)

### Phase 6: Chat Interface Core
**Goal**: The primary workspace (chat) renders with the new design system while preserving all streaming, scrolling, and rendering behavior
**Depends on**: Phase 3
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05, CHAT-06, CHAT-11
**Success Criteria** (what must be TRUE):
  1. Chat messages render with new card/typography components, clearly distinguishing user messages from AI responses
  2. Streaming text displays token-by-token with smooth rendering and a visible cursor animation -- no regressions from current behavior
  3. Chat auto-scrolls during streaming and stops when user manually scrolls up
  4. AI responses render markdown correctly: headings, lists, code blocks, and inline code all display with proper formatting
  5. Each AI-generated message has a visible copy-to-clipboard button that copies the full response text
  6. Chat input area uses restyled textarea and send button from the new component system
**Plans**: 4 plans

Plans:
- [ ] 06-01-PLAN.md — Dependencies + CSS keyframes (react-markdown, remark-gfm, react-shiki, next.config.js, globals.css)
- [ ] 06-02-PLAN.md — MemoizedMarkdown + CodeBlock component (markdown-message.tsx, react-shiki github-light)
- [ ] 06-03-PLAN.md — Message rendering redesign (sender labels, card surfaces, typing indicator, scroll lock, copy button)
- [ ] 06-04-PLAN.md — Input area + stop button + completion flash (sticky textarea, send-to-stop transform)

### Phase 7: Chat Scoring & Figma Preview
**Goal**: Adherence scoring and Figma extraction features within chat render with premium data visualization while preserving all information density
**Depends on**: Phase 6
**Requirements**: CHAT-07, CHAT-08, CHAT-09, CHAT-10
**Success Criteria** (what must be TRUE):
  1. Adherence score cards display with radial progress indicators and color coding (green/yellow/red) reflecting pass/fail status
  2. All 8 scoring dimensions are visible with expand/collapse interaction -- no dimension data is lost or hidden by default
  3. The regenerate-with-feedback button works, passing specific dimension issues back into the prompt for targeted improvement
  4. Figma extraction preview UI renders component and text node lists correctly, preserving the existing extraction workflow
**Plans**: 2 plans

Plans:
- [ ] 07-01-PLAN.md — ScoreRing SVG component + ScoreCard with dimensions, expand/collapse, Improve buttons (score-card.tsx)
- [ ] 07-02-PLAN.md — Wire ScoreCard into page.tsx + handleImprove + regeneratedFromIds + Figma panel repositioned inline

### Phase 07.1: Structured Output Cards (INSERTED)

**Goal:** Multi-section AI responses render as separate per-type visual cards (email, SMS, push, WhatsApp, UX Journey) with Save, Copy, and Adjust actions, and a targeted Adjust dialog above the input for focused revisions
**Depends on:** Phase 7
**Requirements:** OUTCARD-01, OUTCARD-02, OUTCARD-03, OUTCARD-04, OUTCARD-05
**Plans:** 3 plans

Plans:
- [ ] 07.1-01-PLAN.md — OutputCardGroup + all card variants + type detection + field parsing (output-card.tsx)
- [ ] 07.1-02-PLAN.md — AdjustDialog floating panel component (adjust-dialog.tsx)
- [ ] 07.1-03-PLAN.md — Wire OutputCardGroup + AdjustDialog into page.tsx + streaming gate + human verify

### Phase 8: Polish & Responsive QA
**Goal**: The entire app feels premium through consistent microinteractions, helpful tooltips, and verified responsive behavior
**Depends on**: Phase 5, Phase 7
**Requirements**: POLH-01, POLH-02, POLH-03, POLH-04, POLH-05
**Success Criteria** (what must be TRUE):
  1. Interactive elements (buttons, cards, links) show subtle hover microinteractions (scale, shadow lift, or color transition) with 100-200ms timing
  2. Every icon-only button has a contextual tooltip explaining its action on hover
  3. Keyboard shortcut hints are visible in tooltips where applicable (e.g., Cmd+Enter to send)
  4. All transition/animation timing across the app is consistent at 100-200ms with no janky or instant state changes
  5. Layout renders correctly at 1920px, 1440px, 1280px, and 768px breakpoints with no overlapping elements or broken layouts
**Plans**: TBD

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD
- [ ] 08-03: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 > 2 > 3 > 4 > 5 > 6 > 7 > 8
(Phases 4 and 5 can run after Phase 2 and 3 respectively; Phases 5 and 6 can run in parallel after Phase 3.)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Design System & Figma Foundation | 0/3 | Not started | - |
| 2. Component Library | 0/3 | Not started | - |
| 3. App Shell & Navigation | 0/3 | Not started | - |
| 4. Auth Pages | 0/1 | Not started | - |
| 5. Feature Pages & Settings | 0/5 | Not started | - |
| 6. Chat Interface Core | 0/4 | Complete    | 2026-02-20 |
| 7. Chat Scoring & Figma Preview | 0/2 | Not started | - |
| 7.1. Structured Output Cards | 0/3 | Complete    | 2026-02-22 |
| 8. Polish & Responsive QA | 0/3 | Not started | - |

---
*Roadmap created: 2026-02-17*
*Last updated: 2026-02-21*
