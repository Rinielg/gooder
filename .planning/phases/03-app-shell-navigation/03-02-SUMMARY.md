---
phase: 03-app-shell-navigation
plan: 02
subsystem: Layout Components
tags: [layout, breadcrumbs, page-structure, navigation]
dependency_graph:
  requires: [shadcn-breadcrumb-primitives, next-navigation, utils-cn]
  provides: [PageContainer, PageHeader, Breadcrumbs]
  affects: [all-dashboard-pages]
tech_stack:
  added: []
  patterns: [server-components, client-components, pathname-routing]
key_files:
  created:
    - src/components/layout/page-container.tsx
    - src/components/layout/page-header.tsx
    - src/components/layout/breadcrumbs.tsx
  modified: []
decisions:
  - PageContainer enforces 1280px max-width per user requirement
  - px-6 (24px) horizontal padding for comfortable reading width
  - py-8 (32px) vertical padding for generous spacing
  - PageHeader places breadcrumbs above title (not below) per user decision
  - Breadcrumbs return null on top-level pages (single segment) to avoid redundant navigation
  - Overrides prop enables dynamic segment labeling (e.g., brand names instead of UUIDs)
metrics:
  duration: 78
  completed: 2026-02-18T18:18:47Z
---

# Phase 03 Plan 02: Page Layout Components Summary

**One-liner:** PageContainer, PageHeader, and Breadcrumbs provide consistent 1280px-centered framing with dynamic pathname-based breadcrumb navigation for all dashboard pages.

## Objective Achieved

Created three foundational layout components that establish uniform page structure across the entire dashboard:

1. **PageContainer** - Enforces 1280px max-width, horizontal centering, and consistent padding
2. **PageHeader** - Title left, optional actions right, breadcrumbs above title
3. **Breadcrumbs** - Dynamic breadcrumb generation from URL pathname with clickable hierarchy

These components are presentation-only with no sidebar dependency, enabling parallel page implementation.

## Tasks Completed

### Task 1: PageContainer and PageHeader Components
**Commit:** `489be6c`

Created server-side layout components:

**PageContainer (`src/components/layout/page-container.tsx`):**
- Enforces `max-w-[1280px]` constraint
- Centered with `mx-auto`
- Horizontal padding: `px-6` (24px)
- Vertical padding: `py-8` (32px)
- Accepts `className` prop for overrides via `cn()` utility
- Server component (no 'use client' directive)

**PageHeader (`src/components/layout/page-header.tsx`):**
- Layout: `space-y-2` for vertical rhythm
- Title row: flex layout with `items-center justify-between`
- Title styling: `text-2xl font-semibold tracking-tight`
- Optional breadcrumbs rendered **above** title (key user decision)
- Optional actions slot on the right with `gap-2` spacing
- Server component (no 'use client' directive)

**Files created:**
- `src/components/layout/page-container.tsx` (13 lines)
- `src/components/layout/page-header.tsx` (26 lines)

### Task 2: Dynamic Breadcrumbs Component
**Commit:** `9d5f9fd`

Created client-side breadcrumb navigation:

**Breadcrumbs (`src/components/layout/breadcrumbs.tsx`):**
- Client component using `usePathname` hook for pathname detection
- Parses URL into segments, building cumulative hrefs
- Default label mappings for all dashboard sections (chat, profiles, standards, objectives, definitions, outputs, settings, train)
- Merges optional `overrides` prop for dynamic route segments (e.g., brand names for `/profiles/[id]`)
- Returns `null` for single-segment paths (top-level pages don't need breadcrumbs)
- Uses shadcn Breadcrumb primitives: `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`
- ChevronRight separator icon (from shadcn breadcrumb.tsx)
- Clickable `Link` components for navigation
- Proper React.Fragment keying for list rendering

**Files created:**
- `src/components/layout/breadcrumbs.tsx` (77 lines)

## Verification Results

All verification checks passed:

- TypeScript compilation: `npx tsc --noEmit` - zero errors
- Next.js production build: `npm run build` - success
- PageContainer has `max-w-[1280px]` and `mx-auto` classes
- PageHeader renders breadcrumbs before title
- Breadcrumbs uses `usePathname` and shadcn primitives
- Breadcrumbs returns null for single-segment paths
- No 'use client' in page-container.tsx or page-header.tsx
- 'use client' present in breadcrumbs.tsx

## Deviations from Plan

None - plan executed exactly as written.

## Technical Details

**Component Architecture:**
- **Server components:** PageContainer, PageHeader (static layout, no hooks)
- **Client component:** Breadcrumbs (requires usePathname hook)

**Breadcrumb Label Resolution:**
1. Check `overrides` prop (highest priority - for dynamic segments)
2. Check `defaultLabels` mapping (static dashboard sections)
3. Fall back to raw segment (handles unknown routes gracefully)

**Breadcrumb Rendering Logic:**
- Single segment (e.g., `/chat`) - Returns `null` (no breadcrumb UI)
- Multiple segments (e.g., `/profiles/abc-123`) - Renders full hierarchy
- Last segment - `BreadcrumbPage` (non-clickable, current page indicator)
- Non-last segments - `BreadcrumbLink` with Next.js `Link` (clickable navigation)

**Integration Pattern:**
```tsx
// Example usage in a page
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Button } from "@/components/ui/button"

export default function ProfilePage({ params }: { params: { id: string } }) {
  // Fetch brand name for breadcrumb override
  const brandName = await getBrandName(params.id)

  return (
    <PageContainer>
      <PageHeader
        title={brandName}
        breadcrumbs={<Breadcrumbs overrides={{ [params.id]: brandName }} />}
        actions={
          <>
            <Button variant="outline">Edit</Button>
            <Button>Train</Button>
          </>
        }
      />
      {/* Page content */}
    </PageContainer>
  )
}
```

## Dependencies

**Requires:**
- `@/components/ui/breadcrumb` (shadcn primitives)
- `@/lib/utils` (cn utility)
- `next/navigation` (usePathname hook)
- `next/link` (Link component)

**Provides:**
- `PageContainer` - exported layout wrapper
- `PageHeader` - exported header component
- `Breadcrumbs` - exported navigation component

**Affects:**
- All dashboard pages will adopt these components in subsequent phases
- Establishes consistent 1280px-centered layout standard
- Enables uniform breadcrumb navigation across nested routes

## Key Decisions

1. **Max-width 1280px:** Per user requirement - balances readability and screen real estate
2. **Padding px-6 (24px):** Comfortable reading width without feeling cramped
3. **Padding py-8 (32px):** Generous vertical spacing for premium feel
4. **Breadcrumbs above title:** User decision - shows context before page identity
5. **No breadcrumbs on top-level pages:** Avoids redundant "Chat" breadcrumb on /chat page
6. **Overrides prop pattern:** Enables parent pages to inject entity names for dynamic routes without data fetching in breadcrumb component
7. **Server-first components:** PageContainer and PageHeader are server components (no unnecessary client-side JS)

## Files Modified

**Created (3 files):**
- `src/components/layout/page-container.tsx` - 13 lines
- `src/components/layout/page-header.tsx` - 26 lines
- `src/components/layout/breadcrumbs.tsx` - 77 lines

**Total:** 116 lines added

## Next Steps

These components are ready for immediate adoption:

1. **Phase 03 Plan 03:** Integrate sidebar + page layouts in app/layout.tsx
2. **Phase 04+:** All dashboard pages will use PageContainer + PageHeader pattern
3. **Nested routes:** Pass overrides prop to Breadcrumbs for dynamic segment names

## Self-Check

Verifying all claims in summary:

**Files created:**
- FOUND: src/components/layout/page-container.tsx
- FOUND: src/components/layout/page-header.tsx
- FOUND: src/components/layout/breadcrumbs.tsx

**Commits exist:**
- FOUND: 489be6c (Task 1 - PageContainer and PageHeader)
- FOUND: 9d5f9fd (Task 2 - Breadcrumbs)

## Self-Check: PASSED

All files created and commits verified.
