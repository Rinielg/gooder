---
phase: 02-component-library
plan: 03
subsystem: component-library
tags:
  - skeleton-loading
  - content-shaped-skeletons
  - pulse-animation
dependency_graph:
  requires:
    - skeleton-primitive
    - card-primitive
  provides:
    - card-skeleton-variant
    - table-skeleton-variant
    - form-skeleton-variant
  affects:
    - all-loading-states
tech_stack:
  added: []
  patterns:
    - content-shaped-loading
    - pulse-fade-animation
key_files:
  created:
    - src/components/ui/skeletons.tsx
  modified: []
decisions:
  - title: "Use pulse fade animation (not shimmer)"
    rationale: "Follows Phase 1 decision and shadcn/UI default. Pulse is simpler and performs better than shimmer sweep."
    alternative: "Shimmer sweep animation"
  - title: "No built-in delay mechanism"
    rationale: "Keep skeletons stateless and composable. Consumers control delay via conditional rendering or Suspense boundaries."
    alternative: "Built-in delay prop with setTimeout"
metrics:
  duration: 76
  completed: 2026-02-18
---

# Phase 02 Plan 03: Skeleton Loading Variants - Summary

Created three reusable skeleton loading variants (CardSkeleton, TableSkeleton, FormSkeleton) that mirror content layout shapes and use pulse fade animation to replace spinner-based loading states.

## Execution Summary

**Status:** Complete
**Tasks completed:** 1/1
**Duration:** 76 seconds (1.3 minutes)
**Commit:** ff6354d

### Tasks Completed

| Task | Name | Status | Commit |
|------|------|--------|--------|
| 1 | Create CardSkeleton, TableSkeleton, and FormSkeleton components | Complete | ff6354d |

## What Was Built

Created a single file (`src/components/ui/skeletons.tsx`) with three exported skeleton loading variants that compose the base shadcn `Skeleton` primitive:

**1. CardSkeleton**
- Mirrors card layout used in profile cards, output cards, etc.
- Layout: avatar circle (40x40) + title bar + subtitle bar, followed by 3 text lines with varying widths (100%, 80%, 60%), and an action button skeleton at bottom
- Props: `count` (default: 3), `className`
- Renders in a responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop
- Wrapped in Card component with `p-6` padding and `space-y-4` vertical spacing

**2. TableSkeleton**
- Mirrors data table layout used in standards, objectives, definitions pages
- Layout: header row (muted background) + configurable data rows with varying column widths
- Props: `rows` (default: 5), `columns` (default: 4), `className`
- First column wider (w-48) than others (w-20 to w-32) to mimic typical table structure
- Full-width container with rounded border

**3. FormSkeleton**
- Mirrors form layout used in settings, profile editing
- Layout: label bar + input rectangle for each field, followed by submit button skeleton
- Props: `fields` (default: 4), `className`
- First field label wider (w-32) than others (w-20) to reflect typical label width variation
- Vertical stack with `space-y-6` spacing

**Animation:**
All three variants use the base `Skeleton` primitive which applies `animate-pulse` (pulse fade animation) per Phase 1 decision. No shimmer/sweep animation.

**Design Pattern:**
Content-shaped loading: each skeleton mirrors the shape and layout of the content it replaces, reducing perceived load time and providing visual continuity.

## Key Decisions

**1. Use pulse fade animation (not shimmer)**
- **Rationale:** Follows Phase 1 decision and shadcn/UI default. Pulse is simpler, performs better, and is the standard pattern in modern UI libraries.
- **Alternative:** Shimmer sweep animation (rejected)

**2. No built-in delay mechanism**
- **Rationale:** Keep skeletons stateless and composable. Consumers control delay via conditional rendering or Suspense boundaries. Adding delay inside components makes them harder to compose.
- **Alternative:** Built-in delay prop with setTimeout (rejected)

## Deviations from Plan

None - plan executed exactly as written. All three skeleton variants created with content-shaped layouts, pulse animation, and configurable props.

## Technical Details

**Component Composition:**
Each skeleton variant composes the base `Skeleton` primitive from `@/components/ui/skeleton` (installed in 02-01). The base primitive provides:
- `animate-pulse` animation (fade in/out pulse)
- `bg-primary/10` background color (semantic token)
- `rounded-md` border radius

**Layout Strategy:**
- **CardSkeleton:** Uses shadcn `Card` wrapper to match real card styling, renders multiple cards in responsive grid
- **TableSkeleton:** Uses custom border/rounded container to match table structure, header row with muted background, data rows with border-top
- **FormSkeleton:** Simple vertical stack of label + input pairs with submit button at bottom

**Customization:**
All three variants accept:
- Count/rows/fields prop to control quantity
- `className` prop for additional styling via `cn()` utility
- Props passed to root container for maximum flexibility

**Performance:**
- No JavaScript animation (pure CSS `animate-pulse`)
- No state management
- Lightweight render (just divs with Tailwind classes)
- Composable without side effects

## Verification Results

All verification criteria passed:

1. `src/components/ui/skeletons.tsx` exists ✓
2. File imports `Skeleton` from `@/components/ui/skeleton` ✓
3. File imports `Card` from `@/components/ui/card` ✓
4. File exports `CardSkeleton`, `TableSkeleton`, `FormSkeleton` ✓
5. Base skeleton uses `animate-pulse` (verified in skeleton.tsx) ✓
6. No shimmer or backgroundPosition in skeletons.tsx ✓
7. `npx tsc --noEmit` passes with zero errors ✓
8. `npm run build` succeeds ✓

## Files Changed

**Created (1 file):**
- src/components/ui/skeletons.tsx (89 lines)
  - CardSkeleton component with responsive grid layout
  - TableSkeleton component with header + data rows
  - FormSkeleton component with label + input fields
  - All TypeScript interfaces for props
  - All using `cn()` utility for className merging

**Modified:** None

## Next Steps

With skeleton loading variants complete, Phase 2 Plan 02 can now use these to replace spinner-based loading states in page-level components. These three variants cover the primary content patterns in Gooder:

- **CardSkeleton:** Use for profile lists, output lists, any card-based content
- **TableSkeleton:** Use for standards page, objectives page, definitions page, any tabular data
- **FormSkeleton:** Use for settings page, profile editing, any form-based content

Page-specific compositions (e.g., ProfileListSkeleton that renders CardSkeleton with specific count) can be built in later phases as needed.

**Immediate next plan:** 02-02-PLAN.md (if exists) or next incomplete plan in phase 02

## Self-Check: PASSED

All claimed files and commits verified:

```
FOUND: src/components/ui/skeletons.tsx
FOUND: ff6354d
```

Exports verified:
- CardSkeleton exported ✓
- TableSkeleton exported ✓
- FormSkeleton exported ✓

Imports verified:
- Skeleton from @/components/ui/skeleton ✓
- Card from @/components/ui/card ✓

Animation verified:
- Base Skeleton uses animate-pulse ✓
- No shimmer in skeletons.tsx ✓
