# Gooder UI Redesign

## What This Is

A full visual refresh of the Gooder brand voice AI platform. Gooder is a Next.js app where users train brand voice profiles, generate brand-aligned content via AI chat, and score content adherence. The platform works — it just looks generic. This project redesigns every page using shadcn/UI components with a clean, ultra-modern aesthetic, designed first in Figma then implemented in code.

## Core Value

The UI should feel like a premium, modern product — clean, simple, and functional — not a default template. Every page should look intentional.

## Requirements

### Validated

<!-- Shipped and confirmed valuable — existing functionality to preserve. -->

- ✓ User authentication (login, register, sessions) — existing
- ✓ Workspace-based multi-tenancy with role-based access — existing
- ✓ Brand profile CRUD (create, view, edit, list) — existing
- ✓ AI chat with streaming responses for content generation — existing
- ✓ Document upload and brand voice training (PDF, DOCX, text) — existing
- ✓ 8-dimension adherence scoring with pass/fail — existing
- ✓ Platform standards management — existing
- ✓ Business objectives management — existing
- ✓ Terminology/definitions glossary — existing
- ✓ Saved outputs management — existing
- ✓ Sidebar navigation with profile selector — existing
- ✓ Settings page (workspace/account) — existing

### Active

<!-- Current scope. Building toward these. -->

- [ ] Figma design system using shadcn/UI component library
- [ ] New color palette — fresh, modern, fitting the ultra-clean aesthetic
- [ ] Light mode only (no dark mode for now)
- [ ] Redesigned auth pages (login, register)
- [ ] Redesigned app shell (sidebar, navigation, layout)
- [ ] Redesigned chat interface (primary workspace)
- [ ] Redesigned profile pages (list, detail, training)
- [ ] Redesigned standards, objectives, definitions pages
- [ ] Redesigned outputs page
- [ ] Redesigned settings page
- [ ] Consistent typography, spacing, and component styling across all pages
- [ ] shadcn/UI component integration (replace custom/ad-hoc components)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Dark mode — light only for now, can add later
- New features or functionality — this is purely visual, no behavior changes
- Backend/API changes — all existing endpoints stay as-is
- Mobile-first responsive redesign — desktop-first, responsive as bonus
- Animation overhaul — keep Framer Motion usage minimal/existing

## Context

- The app already uses Radix UI + Tailwind CSS + class-variance-authority — the same foundation shadcn/UI builds on. There's even a `components.json` config file present, suggesting partial shadcn/UI adoption already.
- Existing UI components live in `src/components/ui/` (button, input, label, shared primitives).
- The dashboard layout uses a client component (`src/app/(dashboard)/layout.tsx`) that loads workspace and profile context.
- Chat uses Vercel AI SDK's `useChat()` hook for streaming — the chat UI wrapper changes but the streaming logic stays.
- Active profile state is stored in localStorage and synced via custom events.
- The design-first workflow means: Figma designs → code implementation. Claude helps structure the Figma file with shadcn/UI components.

## Constraints

- **Functionality preservation**: All existing features must continue working identically after the redesign
- **Tech stack**: Stay on Next.js 14, Tailwind CSS, Radix UI (via shadcn/UI) — no framework changes
- **Design system**: shadcn/UI as the component foundation
- **Theme**: Light mode only, new color palette
- **Aesthetic**: Clean, simple, ultra-modern, functional (Linear/Notion-caliber polish)

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| shadcn/UI as component system | Already using Radix + Tailwind + CVA foundation; shadcn/UI formalizes this | — Pending |
| Design in Figma first | Visual refresh benefits from design exploration before code; user preference | — Pending |
| New color palette | Current palette feels generic; fresh palette supports ultra-modern target | — Pending |
| Light mode only | Reduces scope; dark mode can be layered on later via shadcn/UI theming | — Pending |
| No functionality changes | Keeps scope focused on visual quality; avoids feature creep | — Pending |

---
*Last updated: 2026-02-17 after initialization*
