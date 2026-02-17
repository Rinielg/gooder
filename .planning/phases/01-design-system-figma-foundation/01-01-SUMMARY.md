---
phase: 01-design-system-figma-foundation
plan: 01
subsystem: component-architecture
tags: [refactor, shadcn-ui, component-structure, imports]
dependency-graph:
  requires: []
  provides: [shadcn-ui-file-structure]
  affects: [all-consumer-files]
tech-stack:
  added: []
  patterns: [shadcn-ui-convention]
key-files:
  created:
    - src/components/ui/card.tsx
    - src/components/ui/textarea.tsx
    - src/components/ui/badge.tsx
    - src/components/ui/separator.tsx
    - src/components/ui/scroll-area.tsx
    - src/components/ui/avatar.tsx
  modified:
    - src/app/(auth)/login/page.tsx
    - src/app/(auth)/register/page.tsx
    - src/app/(dashboard)/objectives/page.tsx
    - src/app/(dashboard)/standards/page.tsx
    - src/app/(dashboard)/definitions/page.tsx
    - src/app/(dashboard)/settings/page.tsx
    - src/app/(dashboard)/profiles/page.tsx
    - src/app/(dashboard)/profiles/[id]/page.tsx
    - src/app/(dashboard)/profiles/[id]/train/page.tsx
    - src/app/(dashboard)/chat/page.tsx
    - src/app/(dashboard)/outputs/page.tsx
    - src/components/layout/app-sidebar.tsx
  deleted:
    - src/components/ui/shared.tsx
decisions:
  - Split monolithic shared.tsx into 6 individual files following shadcn/UI convention
  - Each component group gets its own file with dedicated imports
  - Preserved exact component code without modifications to ensure zero visual impact
metrics:
  duration: 3 minutes
  tasks-completed: 2
  files-created: 6
  files-modified: 12
  files-deleted: 1
  commits: 2
  typescript-errors: 0
  completed: 2026-02-17T18:28:03Z
---

# Phase 01 Plan 01: Split shared.tsx into individual component files

**One-liner:** Restructured monolithic shared.tsx into 6 individual component files following shadcn/UI convention (Card, Textarea, Badge, Separator, ScrollArea, Avatar), updated 12 consumer files, zero visual impact.

## Objective Achieved

Split the monolithic shared.tsx into individual component files following shadcn/UI convention (one component group per file), and updated all 12 consumer files to import from the new paths. This is a structural refactor with zero visual impact -- every component renders identically after the split.

## Tasks Completed

### Task 1: Create 6 individual component files from shared.tsx
- **Status:** Complete
- **Commit:** 359f527
- **Action:** Split shared.tsx into 6 individual files:
  - `card.tsx`: Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent
  - `textarea.tsx`: Textarea component and TextareaProps interface
  - `badge.tsx`: Badge component with badgeVariants
  - `separator.tsx`: Separator component wrapping Radix Separator
  - `scroll-area.tsx`: ScrollArea component wrapping Radix ScrollArea
  - `avatar.tsx`: Avatar and AvatarFallback components wrapping Radix Avatar
- **Result:** All 6 files created with exact component code from shared.tsx, each with correct React/cn/Radix imports

### Task 2: Update all 12 consumer files and delete shared.tsx
- **Status:** Complete
- **Commit:** 44112ba
- **Action:** Updated every file importing from `@/components/ui/shared` to import from individual files:
  - Auth pages (login, register) → card.tsx
  - Dashboard pages → card.tsx, badge.tsx, textarea.tsx, separator.tsx
  - App sidebar → scroll-area.tsx
- **Result:** shared.tsx deleted, all imports updated, TypeScript compilation passes with zero errors

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

All success criteria met:

- ✅ shared.tsx does not exist
- ✅ 6 new component files exist in src/components/ui/ with exact content from the original shared.tsx
- ✅ All 12 consumer files have updated imports pointing to individual component files
- ✅ TypeScript compilation passes with zero errors (`npx tsc --noEmit`)
- ✅ No visual changes to any page (structural refactor only)

**TypeScript check:** `npx tsc --noEmit` exited with code 0

**Import verification:** `grep -r "from.*@/components/ui/shared" src/` returned no results

**File structure verification:** All 6 component files exist and shared.tsx is deleted

## Technical Notes

- Each new component file maintains the exact same component code, className props, and behavior as the original shared.tsx
- Import patterns follow shadcn/UI convention: React, cn utility, and Radix primitives where needed
- No changes to component logic, styling, or prop handling - pure structural move
- Badge component exports `badgeVariants` for potential reuse in other components

## Self-Check: PASSED

**Created files verification:**
```bash
[ -f "src/components/ui/card.tsx" ] && echo "FOUND: card.tsx"
[ -f "src/components/ui/textarea.tsx" ] && echo "FOUND: textarea.tsx"
[ -f "src/components/ui/badge.tsx" ] && echo "FOUND: badge.tsx"
[ -f "src/components/ui/separator.tsx" ] && echo "FOUND: separator.tsx"
[ -f "src/components/ui/scroll-area.tsx" ] && echo "FOUND: scroll-area.tsx"
[ -f "src/components/ui/avatar.tsx" ] && echo "FOUND: avatar.tsx"
```
Result: All files FOUND

**Commits verification:**
```bash
git log --oneline --all | grep -q "359f527" && echo "FOUND: 359f527"
git log --oneline --all | grep -q "44112ba" && echo "FOUND: 44112ba"
```
Result: Both commits FOUND

**Deleted file verification:**
```bash
test ! -f "src/components/ui/shared.tsx" && echo "CONFIRMED: shared.tsx deleted"
```
Result: CONFIRMED deleted

## Impact Assessment

- **Breaking changes:** None
- **Visual changes:** None (zero visual impact confirmed)
- **Performance impact:** None (same component code, just different file organization)
- **Future work enabled:** Establishes correct shadcn/UI structure for upcoming visual refresh in Phase 01 Plan 02 and beyond

## Next Steps

Phase 01 Plan 02 will audit the project structure and document current state before Figma design work begins. The component structure is now ready for the visual refresh.
