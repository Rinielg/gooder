---
phase: 04-auth-pages
plan: 01
subsystem: auth
tags: [react-hook-form, zod, next/image, tailwind, supabase, split-screen-layout]

requires:
  - phase: 02-component-library
    provides: FormInput, FormErrorSummary, Form wrappers and design system tokens (shadow-elevation-3)
provides:
  - Split-screen login page with brand panel and RHF form
  - public/screenshots/dashboard-preview.png — product screenshot asset for brand panel
affects:
  - 04-02-PLAN.md (register page likely follows same split-screen pattern)
  - Any future auth pages

tech-stack:
  added: []
  patterns:
    - Split-screen auth page layout (brand panel left, form right, brand panel hidden on mobile)
    - React Hook Form + Zod for auth form validation (useForm + zodResolver + onBlur mode)
    - FormInput/FormErrorSummary wrappers for inline field-level errors
    - next/image with priority for above-the-fold product screenshots

key-files:
  created:
    - public/screenshots/dashboard-preview.png
    - .planning/phases/04-auth-pages/04-01-SUMMARY.md
  modified:
    - src/app/(auth)/login/page.tsx

key-decisions:
  - "Split-screen layout established as auth page pattern: brand panel (hidden md:flex) + form (flex-1)"
  - "RHF + Zod replaces useState for all form field state; useState retained only for loading"
  - "shadow-elevation-3 used for dashboard screenshot card (custom token from Phase 01 tailwind config)"
  - "rotate-[-2deg] CSS transform on screenshot gives aspirational tilt to brand panel image"

patterns-established:
  - "Auth pages own full-page layout — no PageContainer, no layout.tsx in (auth) group"
  - "Brand panel includes: wordmark (Zap + text), product screenshot via next/image, tagline copy"
  - "Mobile-only wordmark (md:hidden) compensates for hidden brand panel on small screens"
  - "RHF mode: onBlur — errors appear on blur, revalidate onChange for real-time clearing"

requirements-completed:
  - AUTH-01
  - AUTH-03

duration: 10min
completed: 2026-02-19
---

# Phase 04 Plan 01: Split-Screen Login Page Summary

**Split-screen login page with Zap wordmark, next/image product screenshot, and React Hook Form + Zod replacing all useState field state**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-02-19T03:30:00Z
- **Completed:** 2026-02-19T03:37:15Z
- **Tasks:** 2
- **Files modified:** 2 (+ screenshot asset)

## Accomplishments

- Replaced centered card login with full-height split-screen layout (brand panel left, auth form right)
- Brand panel hidden on mobile (hidden md:flex) with compensating mobile-only wordmark (flex md:hidden)
- Migrated form state from useState(email)/useState(password) to React Hook Form + Zod with inline validation on blur
- Preserved all Supabase auth behavior: signInWithPassword(values.email, values.password), router.push/refresh, toast.error
- Dashboard product screenshot rendered at 640x400 with shadow-elevation-3, ring-border/50, and rotate-[-2deg] tilt

## Task Commits

Each task was committed atomically:

1. **Task 1: Create dashboard-preview.png screenshot asset** - `edff610` (chore)
2. **Task 2: Rewrite login page as split-screen layout with RHF form** - `b98868c` (feat)

## Files Created/Modified

- `public/screenshots/dashboard-preview.png` — 457KB dashboard UI screenshot for brand panel product preview
- `src/app/(auth)/login/page.tsx` — Full rewrite: split-screen layout, RHF + Zod form, next/image screenshot, Supabase auth preserved

## Decisions Made

- Used `shadow-elevation-3` (from Phase 01 Tailwind config) for the screenshot card — matches the design system elevation tokens rather than generic Tailwind utilities
- `rotate-[-2deg]` CSS transform on screenshot container gives aspirational tilt without a separate CSS file
- Auth pages own their full-page layout (no PageContainer wrapper) — consistent with the plan's explicit note and design intent

## Deviations from Plan

None - plan executed exactly as written. shadow-elevation-3 token existed in tailwind.config.ts (no need for shadow-2xl fallback).

## Issues Encountered

- zsh glob expansion blocked `git add src/app/(auth)/login/page.tsx` — resolved by quoting the path: `git add "src/app/(auth)/login/page.tsx"`. No impact on output.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Split-screen auth pattern established; register page (04-02) can follow the same layout pattern
- FormInput/FormErrorSummary integration validated end-to-end on a real auth page
- No blockers

## Self-Check

- [x] `public/screenshots/dashboard-preview.png` — EXISTS (457KB)
- [x] `src/app/(auth)/login/page.tsx` — EXISTS, contains `useForm`, `FormInput`, `dashboard-preview.png`, `values.email`, `values.password`
- [x] `edff610` commit — EXISTS (chore: screenshot asset)
- [x] `b98868c` commit — EXISTS (feat: login page rewrite)
- [x] `npx tsc --noEmit` — PASSED (no errors)
- [x] `npm run build` — PASSED (compiled successfully, /login route static)

## Self-Check: PASSED

---
*Phase: 04-auth-pages*
*Completed: 2026-02-19*
