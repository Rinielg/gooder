# Project Research Summary

**Project:** Gooder UI Redesign
**Domain:** UI Redesign (Figma-first, shadcn/UI migration for Next.js AI platform)
**Researched:** 2026-02-17
**Confidence:** HIGH

## Executive Summary

Gooder is a working Next.js 14 brand voice AI platform that needs a visual overhaul, not a rebuild. The research confirms this is an unusually low-risk redesign because the existing stack (Radix UI, Tailwind CSS, CVA) is the exact foundation shadcn/UI builds on. A `components.json` already exists. This is an enhancement of an existing design system, not a migration between frameworks. The recommended approach is incremental, bottom-up component replacement -- primitives first, pages last -- so the app remains fully functional at every step.

The highest-value work is establishing the design token pipeline (Figma variables to CSS variables to Tailwind config) and splitting the monolithic `shared.tsx` file into individual shadcn-convention components. These two tasks unblock everything else. The single highest-risk area is the chat page: it is 1012 lines with streaming state management from Vercel AI SDK, 8-dimension adherence scoring cards, and Figma URL extraction -- all of which break if DOM structure or React reconciliation timing changes during component swaps. Chat must be migrated last and in sub-phases.

The key risk mitigation strategy is atomic color palette migration (change all CSS variables at once, not incrementally) and preserving exact DOM structure for streaming containers. Auth flows, file uploads, and scoring UI are secondary risks that each have well-documented prevention strategies. The project should take 5-6 phases over approximately 4-6 weeks if the Figma design system is completed in parallel with the foundation code work.

## Key Findings

### Recommended Stack

shadcn/UI is the correct choice and requires zero new core dependencies. The existing stack stays intact: Next.js 14, React 18, TypeScript, Tailwind CSS 3.4.1, Radix UI, CVA 0.7.1, Framer Motion, Lucide React, Sonner, Supabase, Vercel AI SDK. See [STACK.md](./STACK.md) for full details.

**Core technologies:**
- **shadcn/UI (CLI):** Component system -- builds on existing Radix+Tailwind+CVA, copy-paste ownership model enables full brand customization
- **Geist Sans / Inter:** Typography -- Geist aligns with Vercel ecosystem, Inter is the safer fallback for professional readability
- **CSS Variables (HSL):** Theming -- shadcn/UI's variable system already partially implemented in globals.css, enables Figma token sync
- **React Hook Form + Zod:** Form validation -- shadcn/UI's Form component integrates these natively
- **cmdk:** Command palette -- powers Cmd+K search/navigation, installed via shadcn CLI
- **Recharts:** Data visualization -- React-friendly charts for adherence score displays

**Add:** clsx, tailwind-merge (via cn() utility), react-hook-form, zod, cmdk, vaul (drawer)
**Remove:** Custom Radix wrappers replaced by shadcn/UI versions, shared.tsx (split into individual files)
**Keep everything else:** Sonner, Framer Motion, Supabase client, AI SDK -- no changes

### Expected Features

See [FEATURES.md](./FEATURES.md) for full feature research with shadcn component mappings.

**Must have (table stakes):**
- Consistent 8px spacing system with Tailwind config
- Clean typography scale (Geist/Inter, text-xs through text-2xl)
- Skeleton loading states (not spinners) matching content layout
- Responsive sidebar with collapse/expand and mobile drawer
- Form validation with inline errors (React Hook Form + Zod)
- Toast notifications (keep Sonner, restyle)
- Empty states with clear CTAs on all list pages
- Breadcrumb navigation hierarchy
- Subtle shadow/border elevation system

**Should have (differentiators -- Linear/Notion caliber):**
- Command palette (Cmd+K) for global navigation and actions
- Microinteractions on hover/focus (subtle scale, shadow lift)
- Rich chat interface with markdown rendering, copy buttons, streaming indicators
- Data visualization for adherence scores (radial progress, color coding)
- Contextual tooltips on icon buttons and metrics
- Keyboard shortcuts with discoverable hints

**Defer (v2+):**
- Dark mode (explicitly out of scope, light-only simplifies CSS variable management)
- Smooth page transitions (Framer Motion AnimatePresence -- risk of slowing navigation)
- Onboarding flows and feature discovery wizards
- Intelligent search with URL-state filters
- Advanced data visualizations beyond score cards

### Architecture Approach

The architecture follows a three-layer component system: primitives (`ui/`) at the bottom, composed domain components (`composed/`) in the middle, and layout/page components at the top. Lower layers never import from higher layers. Migration proceeds bottom-up: split shared.tsx, install shadcn primitives, extract composed components, refactor layouts, update pages. See [ARCHITECTURE.md](./ARCHITECTURE.md) for full structure.

**Major components:**
1. **ui/ (Layer 1)** -- shadcn primitives installed via CLI: button, card, dialog, tabs, skeleton, etc. One component group per file.
2. **composed/ (Layer 2, NEW)** -- Domain-specific compositions: ProfileCard, EmptyState, PageHeader, StatusBadge, ProfileSelector. Reduces duplication across pages.
3. **layout/ (Layer 3)** -- AppSidebar (refactored with new components), DashboardLayout, PageContainer (new, enforces consistent spacing/padding).
4. **Design token system** -- CSS variables in globals.css consumed by Tailwind. Figma variables export to JSON, convert to CSS variables. Single source of truth for colors.

**Key patterns to follow:**
- Composition over configuration (CardHeader + CardTitle, not Card props)
- CVA for any component with 3+ visual variants
- Server Components by default, "use client" only when needed
- Controlled components for complex forms, uncontrolled for simple ones

### Critical Pitfalls

See [PITFALLS.md](./PITFALLS.md) for full pitfall analysis with recovery strategies.

1. **CSS variable collisions during migration** -- Current globals.css already defines `--primary`, `--border`, etc. Changing these breaks every unmigrated page simultaneously. **Avoid:** Migrate color palette atomically in a single commit; do not mix old and new color systems.
2. **Breaking streaming chat UI during component swap** -- Chat page has complex streaming state from `useChat()`, custom cursor animations, auto-scroll behavior. New components change DOM structure, breaking React reconciliation. **Avoid:** Preserve exact DOM structure for streaming containers; create streaming test harness (1000+ tokens); migrate chat last and in sub-phases.
3. **Auth flow redirect failures** -- Supabase auth uses middleware redirects. Layout changes can break redirect URLs and route group structure. **Avoid:** Document all redirect paths before migration; preserve `(auth)` and `(dashboard)` route group structure; test full auth flows early.
4. **Adherence scoring UI losing dimension data** -- Scoring cards show 8 dimensions with expand/collapse, severity flags, and regenerate-with-feedback. Redesign can oversimplify. **Avoid:** Map full `AdherenceScore` type and all rendering paths; preserve information density; test edge cases (0 fails, all warnings, automatic_fail).
5. **File upload interactions regressing** -- Drag-and-drop zones lose event listeners after component refactor; native file input gets hidden incorrectly. **Avoid:** Map all file upload touchpoints; use `opacity: 0` not `display: none`; test with real 50MB+ files.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 0: Pre-Migration Audit (1-2 days)
**Rationale:** PITFALLS.md warns that state management (Supabase auth, AI SDK streaming, localStorage, URL routing) is the biggest risk area. Must map all state before touching components.
**Delivers:** Documented state map, auth flow diagram, streaming behavior baseline, visual regression screenshots of all pages.
**Addresses:** Foundation for all subsequent work; prevents blind spots.
**Avoids:** Auth flow breakage (Pitfall 4), streaming UI regression (Pitfall 2).

### Phase 1: Design System Foundation (3-5 days)
**Rationale:** ARCHITECTURE.md identifies splitting shared.tsx and establishing design tokens as blockers for all other work. STACK.md confirms CSS variable system is the theming mechanism. Must be done first.
**Delivers:** Split shared.tsx into individual component files; new CSS variable palette in globals.css; Tailwind config updated; typography system (Geist/Inter); spacing system validated; cn() utility confirmed.
**Addresses:** Table stakes features -- consistent spacing, typography scale, shadow/border system.
**Avoids:** CSS variable collisions (Pitfall 1) by migrating palette atomically.

### Phase 2: Primitive Components (2-3 days)
**Rationale:** shadcn CLI components must be installed and customized before composed components can use them. STACK.md provides the priority list.
**Delivers:** All shadcn primitives installed via CLI: dialog, dropdown-menu, select, tabs, tooltip, skeleton, alert-dialog, breadcrumb, table, command, sheet, scroll-area, form, popover.
**Addresses:** Component foundation needed by every feature page.
**Avoids:** Premature abstraction (ARCHITECTURE anti-pattern) -- install and use before wrapping.

### Phase 3: Composed Components + Layout (5-7 days)
**Rationale:** ARCHITECTURE.md identifies repeated patterns (ProfileCard, EmptyState, PageHeader) across multiple pages. Extracting these before page migration prevents duplication and establishes the visual language.
**Delivers:** composed/ layer components (ProfileCard, EmptyState, ProfileSelector, PageHeader, StatusBadge, LoadingSpinner); refactored AppSidebar; PageContainer with consistent spacing; responsive sidebar with collapse/expand + mobile Sheet.
**Addresses:** Sidebar navigation, empty states, loading states (skeletons), navigation hierarchy (breadcrumbs).
**Avoids:** Inconsistent patterns across pages (FEATURES anti-feature); shared component files anti-pattern.

### Phase 4: Feature Page Migration (7-10 days)
**Rationale:** ARCHITECTURE.md specifies page migration order from simplest to most complex. Each page is independent, enabling parallel work if needed. Chat is explicitly last.
**Delivers:** Redesigned pages in order: Settings, Definitions, Standards, Objectives, Outputs, Profiles (including file upload).
**Addresses:** Form validation with inline errors, data tables, empty states with CTAs, toast notification consistency.
**Avoids:** File upload regression (Pitfall 3) -- Profiles page tested with real files before moving to chat.

### Phase 5: Chat Interface Migration (5-7 days)
**Rationale:** PITFALLS.md identifies chat as the highest-risk page (1012 lines, 6 state variables, 3 external integrations). Must be migrated in sub-phases: layout first, then streaming container, then scoring cards, then Figma integration.
**Delivers:** Redesigned chat with markdown rendering, streaming indicators, copy buttons, adherence score visualizations, Figma extraction preview.
**Addresses:** Rich chat interface (differentiator), data visualization for scores (differentiator), keyboard shortcuts (Cmd+Enter submit).
**Avoids:** Streaming UI breakage (Pitfall 2), scoring data loss (Pitfall 5), Figma preview regression (Pitfall 6).

### Phase 6: Polish + Command Palette (3-5 days)
**Rationale:** FEATURES.md Tier 2/3 features (command palette, tooltips, microinteractions) are polish that should only happen after all pages are functional with new components.
**Delivers:** Command palette (Cmd+K), contextual tooltips, microinteractions (hover scale/shadow), keyboard shortcuts documentation, responsive QA pass.
**Addresses:** All differentiator features not covered in page migrations; final visual QA.
**Avoids:** Over-animation (FEATURES anti-feature) -- keep to 100-200ms, CSS transitions preferred over Framer Motion.

### Phase Ordering Rationale

- **Foundation before features:** Splitting shared.tsx and establishing design tokens blocks all component work (ARCHITECTURE.md build order dependencies).
- **Bottom-up migration:** Primitives before composed, composed before pages. This ensures each layer is stable before the next depends on it.
- **Simple pages before complex:** Settings/Definitions/Standards have straightforward CRUD UI. Migrating these builds confidence and validates the component system before tackling chat.
- **Chat last, always:** Three research files independently flag chat as highest risk. It has streaming state, scoring UI, Figma integration, and is the most complex page by line count.
- **Polish after function:** Command palette, tooltips, and microinteractions add no value if the base pages are broken.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Design System Foundation):** Figma-to-code token pipeline needs validation. Which Figma plugin (Tokens Studio vs Style Dictionary vs manual)? How exactly do exported tokens map to shadcn's HSL variable format? Needs hands-on testing.
- **Phase 5 (Chat Interface):** Streaming DOM structure preservation is poorly documented. Need to profile `useChat()` re-render behavior with React DevTools before migrating. The streaming test harness (1000+ tokens) should be built as part of Phase 0.

Phases with standard patterns (skip research-phase):
- **Phase 2 (Primitive Components):** shadcn CLI handles installation; documentation is excellent.
- **Phase 4 (Feature Pages):** Standard CRUD page patterns with well-documented shadcn components (Form, Table, Card).
- **Phase 6 (Polish):** cmdk and tooltip patterns are well-documented in shadcn and community.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | shadcn/UI is already partially adopted; existing stack is the exact foundation. No technology risk. |
| Features | HIGH | Feature list is based on established SaaS UI patterns (Linear, Notion, Vercel). Well-understood domain. |
| Architecture | HIGH | Three-layer component system is standard React/shadcn convention. Migration order derived from codebase analysis. |
| Pitfalls | MEDIUM-HIGH | Critical pitfalls (CSS collisions, streaming breakage) are well-identified with prevention strategies. Chat complexity is the main uncertainty. |

**Overall confidence:** HIGH

This is a well-scoped visual redesign on a compatible stack. The primary risk is not technology but execution discipline -- resisting the urge to change behavior while changing appearance, and migrating the chat page carefully.

### Gaps to Address

- **Figma token export pipeline:** No researcher validated an end-to-end Figma variables to CSS variables workflow. Need to test with actual Figma file during Phase 1 planning. Fallback: manual CSS variable authoring based on Figma visual specs.
- **Geist vs Inter font decision:** Both recommended but no final decision. Should be made during Figma design phase based on aesthetic preference. Low risk -- both work identically with the stack.
- **Performance baseline:** No current Lighthouse scores or React profiler data captured. Should be established in Phase 0 to detect regressions. Without baseline, "performance regression" pitfall is hard to verify.
- **Responsive breakpoint strategy:** FEATURES.md mentions mobile responsiveness but PROJECT.md says "desktop-first, responsive as bonus." Need to clarify minimum responsive support level (tablet? phone?) before Phase 3 layout work.
- **shared.tsx exact contents:** ARCHITECTURE.md references 9 components in shared.tsx but the exact current state should be verified before Phase 1 begins. The file may have changed since research.
- **Auth page design scope:** Login and register pages are in scope per PROJECT.md but PITFALLS.md warns about auth redirect fragility. Need to decide: restyle only (safe) or restructure layout (risky)?

## Sources

### Primary (HIGH confidence)
- shadcn/UI official documentation -- component API, CLI usage, theming system, components.json configuration
- Vercel AI SDK documentation -- useChat() hook behavior, streaming patterns
- Tailwind CSS v3.4 documentation -- CSS variable integration, configuration
- Radix UI documentation -- primitive component APIs, accessibility patterns
- Next.js 14 documentation -- App Router, Server Components, route groups

### Secondary (MEDIUM confidence)
- Codebase analysis -- existing component structure, shared.tsx contents, globals.css variables, page complexity
- shadcn/UI Figma Community files -- component availability and variant coverage
- Figma Tokens Studio / Style Dictionary -- token export capabilities (not validated end-to-end)

### Tertiary (LOW confidence)
- Figma-to-code tools (Anima, Builder.io) -- compatibility with shadcn/UI not confirmed; manual approach recommended
- Recharts for score visualization -- recommended based on React ecosystem fit, not validated against Gooder's specific scoring data structure

---
*Research completed: 2026-02-17*
*Ready for roadmap: yes*
