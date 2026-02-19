# Phase 5: Feature Pages & Settings - Research

**Researched:** 2026-02-19
**Domain:** React page-level UI migration, form validation, skeleton/empty-state patterns, file upload UX
**Confidence:** HIGH — all findings verified directly from codebase; no external library research needed (stack already installed)

---

## Summary

Phase 5 is a pure visual refresh of 8 existing pages (7 routes: profiles list, profile detail, profile training, standards, objectives, definitions, outputs, settings). All data-fetching logic, Supabase interactions, and API calls are preserved exactly. The work is applying three consistent patterns — PageContainer + PageHeader layout, skeleton loading states, EmptyState components, and RHF+Zod inline validation — across a set of pages that currently mix these patterns inconsistently or not at all.

The **training page** (`/profiles/[id]/train`) is the single highest-risk item in the phase. It is a composite page: chat interface + file drag-and-drop uploader + progress bar. The drag-and-drop logic is fully custom (no external library), implemented as raw HTML5 drag events on a `div`. It must be visually refreshed without touching the event handlers (`handleFileDrop`, `handleFileSelect`, `isValidFile`, `handleFileUpload`) or the `fileInputRef`-based click-to-browse behavior. This page should be planned as its own standalone plan.

The **settings page** currently renders as two stacked Cards (Workspace + Security). The requirement (SETT-01, SETT-02) is to replace this with a shadcn `Tabs` layout separating workspace and account sections. The `Tabs` component is already installed. This is a low-risk surgical change but distinct enough from the list pages to merit its own plan.

The five simple management list pages (profiles list, standards, objectives, definitions, outputs) share a near-identical data pattern — load data, show skeleton while loading, render items as Cards, show EmptyState if empty, provide an inline form for create/edit. These can be batched into 2-3 plans by complexity. Standards is the most complex list page (expandable rules, edit mode, active toggle); profiles list needs a new `ProfileCard` component; objectives, definitions, and outputs are simple.

**Primary recommendation:** Plan this phase as 5 plans. Plan 01: ProfileCard + profiles list page. Plan 02: Standards page (most complex list). Plan 03: Objectives + Definitions + Outputs (simple list pages, batched). Plan 04: Settings tab layout. Plan 05: Profile detail + training pages (training is the critical-risk item).

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PAGE-01 | Profiles list page redesigned with ProfileCard components and empty state | New `ProfileCard` component needed; EmptyState and CardSkeleton exist |
| PAGE-02 | Profile detail page redesigned with new layout and components | PageContainer + PageHeader; existing Cards sections stay, just restyled |
| PAGE-03 | Profile training page redesigned preserving file upload drag-and-drop | CRITICAL: drag/drop handlers must not be touched; only visual shell changes |
| PAGE-04 | Standards management page redesigned with consistent card/table layout | Most complex list page: expandable rows, edit mode, active toggle, dynamic rules |
| PAGE-05 | Objectives management page redesigned with consistent card/table layout | Simple: title + description + delete; inline add form; EmptyState |
| PAGE-06 | Definitions/glossary page redesigned with consistent card/table layout | Simplest: term/definition pairs; EmptyState; inline add form |
| PAGE-07 | Saved outputs page redesigned with consistent card/table layout | Read-only list with filter tabs and delete; EmptyState exists in current code |
| PAGE-08 | All list pages show skeleton loading states during data fetch | CardSkeleton and TableSkeleton exist in `src/components/ui/skeletons.tsx` |
| PAGE-09 | All list pages show empty states with CTAs when no data exists | EmptyState component exists in `src/components/ui/empty-state.tsx` |
| PAGE-10 | All forms show inline validation errors (not modal/toast-only) | FormInput + FormErrorSummary from `src/components/ui/form-field.tsx` exist |
| SETT-01 | Settings page redesigned with new component system (tabs, forms, cards) | Tabs component installed; two current Cards become TabsContent panels |
| SETT-02 | Workspace and account settings sections clearly separated | Two distinct `TabsTrigger` values: "workspace" and "account" |
</phase_requirements>

---

## Standard Stack

### Core (already installed — no new packages needed)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| `react-hook-form` | ^7.71.1 | Form state management | Installed |
| `zod` | ^4.3.6 | Schema validation | Installed |
| `@hookform/resolvers` | ^5.2.2 | Zod adapter for RHF | Installed |
| `shadcn/ui` (Radix+Tailwind) | Existing | All UI primitives | Installed |
| `sonner` | Existing | Toast notifications | Installed |
| `lucide-react` | ^0.563.0 | Icons | Installed |

### Components Already Built (Phase 2 + Phase 3 deliverables)

| Component | File | Interface |
|-----------|------|-----------|
| `FormInput` | `src/components/ui/form-field.tsx` | `name, label, description?, children, className?` |
| `FormErrorSummary` | `src/components/ui/form-field.tsx` | `className?` |
| `EmptyState` | `src/components/ui/empty-state.tsx` | `icon, heading, description, actionLabel, onAction, className?` |
| `CardSkeleton` | `src/components/ui/skeletons.tsx` | `count?, className?` — grid layout 1/2/3 cols |
| `TableSkeleton` | `src/components/ui/skeletons.tsx` | `rows?, columns?, className?` |
| `FormSkeleton` | `src/components/ui/skeletons.tsx` | `fields?, className?` |
| `PageContainer` | `src/components/layout/page-container.tsx` | `children, className?` — 1280px max-width, px-6 py-8 |
| `PageHeader` | `src/components/layout/page-header.tsx` | `title, actions?, breadcrumbs?, className?` |
| `Breadcrumbs` | `src/components/layout/breadcrumbs.tsx` | `overrides?: Record<string,string>` |

### shadcn Primitives Available

| Component | Import | Used For |
|-----------|--------|----------|
| `Tabs, TabsList, TabsTrigger, TabsContent` | `@/components/ui/tabs` | Settings page layout |
| `Table, TableHeader, TableBody, TableRow, TableHead, TableCell` | `@/components/ui/table` | Optional: definitions or standards as table |
| `Card, CardContent, CardHeader, CardTitle, CardDescription` | `@/components/ui/card` | All page cards |
| `Badge` | `@/components/ui/badge` | Status labels, type labels |
| `Button` | `@/components/ui/button` | All CTAs |
| `Input, Textarea` | `@/components/ui/input`, `@/components/ui/textarea` | Form fields |
| `Select, SelectTrigger, SelectContent, SelectItem` | `@/components/ui/select` | Replaces native `<select>` in Standards form |
| `AlertDialog` | `@/components/ui/alert-dialog` | Replaces `window.confirm()` for destructive actions |
| `Label` | `@/components/ui/label` | Form labels (when not using FormInput) |
| `Separator` | `@/components/ui/separator` | Section dividers |

**Installation:** No new packages needed. All components are already installed and styled.

---

## Architecture Patterns

### Page Anatomy (all list pages follow this structure)

```
PageContainer
  PageHeader (title, actions slot)
  [Skeleton during load] OR [list OR EmptyState]
  [Inline create/edit form card if applicable]
```

### Pattern 1: Skeleton Loading State Swap

Replace the current spinner pattern (`if (loading) return <Loader2 spinner>`) with skeleton components:

```typescript
// CURRENT (all pages):
if (loading) {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
}

// PHASE 5 TARGET:
if (loading) {
  return (
    <PageContainer>
      <PageHeader title="Brand Profiles" />
      <CardSkeleton count={3} />
    </PageContainer>
  );
}
```

The skeleton should match the layout shape of the loaded content (CardSkeleton for card lists, TableSkeleton for table layouts).

### Pattern 2: EmptyState Swap

Replace the current inline empty state blocks (each page has its own ad-hoc empty message) with the `EmptyState` component:

```typescript
// CURRENT (profiles page):
{profiles.length === 0 && (
  <Card>
    <CardContent className="flex flex-col items-center py-12 text-center">
      <Mic2 className="w-12 h-12 text-muted-foreground/50 mb-4" />
      <h3 className="font-medium mb-1">No brand profiles yet</h3>
      <p className="text-sm text-muted-foreground mb-4">...</p>
      <Button onClick={() => setShowCreate(true)}>...</Button>
    </CardContent>
  </Card>
)}

// PHASE 5 TARGET:
{profiles.length === 0 && (
  <EmptyState
    icon={Mic2}
    heading="No brand profiles yet"
    description="Create your first brand voice profile to start generating on-brand content."
    actionLabel="Create your first profile"
    onAction={() => setShowCreate(true)}
  />
)}
```

### Pattern 3: RHF + Zod Form Migration

Pages with forms (profiles list create, standards, objectives, definitions, settings) need their `useState`-based form state replaced with RHF + Zod. Each form needs:
1. A `z.object()` schema
2. `useForm({ resolver: zodResolver(schema), mode: "onBlur", reValidateMode: "onChange" })`
3. `<Form {...form}>` wrapper
4. `<FormInput name="..." label="...">` wrappers for each field
5. `<FormErrorSummary />` above the submit button

**Key constraint:** `window.confirm()` calls (delete confirmations in profiles, standards, objectives, definitions, outputs) should be replaced with `AlertDialog` components for accessibility and design consistency. This is part of the visual refresh.

### Pattern 4: Native `<select>` Replacement

The Standards page uses a native `<select>` for category:
```typescript
// CURRENT:
<select value={formCategory} onChange={...} className="w-full h-10 rounded-md border...">

// PHASE 5 TARGET:
<FormInput name="category" label="Category">
  <Select onValueChange={field.onChange} defaultValue={field.value}>
    <SelectTrigger><SelectValue /></SelectTrigger>
    <SelectContent>
      {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
    </SelectContent>
  </Select>
</FormInput>
```

Note: shadcn `Select` with RHF requires `onValueChange={field.onChange}` not `onChange`, since it's not a native element.

### Pattern 5: Settings Page Tab Layout

```typescript
// TARGET structure:
<PageContainer>
  <PageHeader title="Settings" />
  <Tabs defaultValue="workspace">
    <TabsList>
      <TabsTrigger value="workspace">Workspace</TabsTrigger>
      <TabsTrigger value="account">Account</TabsTrigger>
    </TabsList>
    <TabsContent value="workspace">
      {/* Workspace name form card */}
    </TabsContent>
    <TabsContent value="account">
      {/* Email display + password change form card */}
    </TabsContent>
  </Tabs>
</PageContainer>
```

### Pattern 6: ProfileCard Component (new component needed)

The profiles list page needs a `ProfileCard` component. Based on current code, the card renders: icon + name + status badge + completeness percentage + optional module count + chevron arrow. Should be extracted as a reusable component in `src/components/features/profiles/profile-card.tsx` (or `src/components/ui/profile-card.tsx`).

### Pattern 7: Preserving Training Page Drag-and-Drop

The training page file upload uses:
- `isDragging` state driven by `onDragOver`/`onDragLeave`/`onDrop` on a `div`
- `fileInputRef` (hidden `<input type="file">`) for click-to-browse
- `handleFileDrop(e)` and `handleFileSelect(e)` handlers call `handleFileUpload(file)`
- `uploadStatus` state machine: `"idle" | "uploading" | "processing" | "success" | "error"`

**Preservation rule:** The event handler functions and state machine logic must not be modified. Only the visual container (`className` props on the drop zone `div`, card styling for upload states) changes. The `fileInputRef` `<input>` must stay hidden with same `accept` attribute.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form inline validation | Custom error state with `useState` | `FormInput` + `FormErrorSummary` from `form-field.tsx` | Already built in Phase 2 |
| Empty list state | Per-page custom empty UI | `EmptyState` from `empty-state.tsx` | Already built in Phase 2; consistent icon+heading+desc+CTA |
| Loading skeleton | New spinner or loading component | `CardSkeleton` / `TableSkeleton` from `skeletons.tsx` | Already built in Phase 2 |
| Page layout wrapper | Per-page padding/max-width | `PageContainer` + `PageHeader` from layout/ | Already built in Phase 3 |
| Delete confirmation dialogs | `window.confirm()` calls (existing) | `AlertDialog` from `alert-dialog.tsx` | Installed; accessible; matches design system |
| Native `<select>` | Leave native elements | shadcn `Select` + `SelectItem` | Matches design system styling automatically |
| File drag-and-drop | New library (react-dropzone) | Existing custom implementation | Already works; no new dependency; NO FUNCTIONALITY CHANGES |
| Tab layout | Custom tab UI | shadcn `Tabs` from `tabs.tsx` | Already installed; keyboard-accessible |

**Key insight:** This phase has almost zero new infrastructure to build. Every pattern is already implemented. The work is applying existing patterns to existing pages — a mechanical but careful migration.

---

## Common Pitfalls

### Pitfall 1: Breaking Training Page File Upload
**What goes wrong:** Moving the drop zone `div` into a new component or restructuring the JSX tree causes the `isDragging` state to not update correctly, or `fileInputRef.current?.click()` fires on a detached DOM element.
**Why it happens:** The training page has tight coupling between the drop zone div's event handlers and the surrounding state variables. The state machine (`uploadStatus`) drives conditional rendering — restructuring conditional branches can cause the `fileInputRef` input to unmount/remount, losing the ref.
**How to avoid:** Keep all state, refs, and handler functions exactly as-is. Only change `className` strings on existing JSX elements. Do not extract into sub-components. Do not reorder conditional rendering blocks.
**Warning signs:** "Cannot read properties of null (reading 'click')" TypeScript errors, or drag events not firing after JSX restructure.

### Pitfall 2: RHF + shadcn Select Integration
**What goes wrong:** Passing `{...field}` spread to `SelectTrigger` causes `onChange` to receive a Radix event object, not a string value.
**Why it happens:** shadcn `Select` is not a native HTML element — it uses `onValueChange` (string) not `onChange` (event).
**How to avoid:** Use `<Select onValueChange={field.onChange} value={field.value}>` explicitly. Do not spread `{...field}` onto `SelectTrigger`.

### Pitfall 3: CardSkeleton Grid Layout Mismatch
**What goes wrong:** `CardSkeleton` renders a 1/2/3 column grid, but profile cards render as a single-column list.
**Why it happens:** `CardSkeleton`'s default layout (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) is designed for card grids, not single-column lists.
**How to avoid:** For single-column list pages (profiles, standards, objectives, definitions, outputs), pass `className="grid-cols-1"` to `CardSkeleton`, or use `TableSkeleton` which renders as a vertical list. Alternatively, create simple list skeleton inline.

### Pitfall 4: window.confirm() Replacement Scope
**What goes wrong:** Replacing all `window.confirm()` calls with `AlertDialog` in one pass is more work than expected — each requires: trigger element, controlled open state, dialog content, confirm/cancel handlers.
**Why it happens:** Each destructive action (delete profile, delete standard, delete objective, delete definition, delete output, delete training doc) needs its own controlled AlertDialog state.
**How to avoid:** Plan for AlertDialog wrapping each destructive action. Use a shared pattern: `const [deleteTarget, setDeleteTarget] = useState<string | null>(null)` — a single AlertDialog per page controlled by `deleteTarget` state.

### Pitfall 5: FormInput Incompatibility with Controlled Non-Input Children
**What goes wrong:** `FormInput` uses `React.cloneElement(children, field)` to inject RHF field props. This breaks for `Textarea` if `rows` prop is set (gets overwritten) or for `Select` (wrong prop names).
**Why it happens:** `React.cloneElement` merges the `field` object onto props, which may conflict with explicitly set props.
**How to avoid:** For `Textarea`, set `rows` inside the `FormInput` child — it won't be overwritten since RHF doesn't set `rows`. For `Select`, do NOT use `FormInput` with cloneElement; instead use `FormField` directly from `form.tsx` and set `onValueChange={field.onChange}` manually.

### Pitfall 6: Standards Dynamic Rules Array with RHF
**What goes wrong:** The standards form has a dynamic array of rule inputs (`formRules: string[]`). RHF's `useFieldArray` is the correct primitive but it's a different API than `useState`.
**Why it happens:** `useFieldArray` works on object arrays, not string arrays. Wrapping strings in `{ value: string }` objects adds complexity.
**How to avoid:** Keep the dynamic rules array as `useState` (it's not a validation concern — just a UI list that gets flattened to `string[]` on save). Validate the array length at schema level using `z.array(z.string().min(1)).min(1)` on the whole `rules` field, not per-item.

---

## Code Examples

### RHF + Zod form with FormInput (verified from form-field.tsx)

```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form } from "@/components/ui/form"
import { FormInput, FormErrorSummary } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
  })

  async function onSubmit(values: FormValues) {
    // submit logic
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormErrorSummary />
        <FormInput name="name" label="Name">
          <Input placeholder="Enter name" />
        </FormInput>
        <Button type="submit">Save</Button>
      </form>
    </Form>
  )
}
```

### EmptyState usage (verified from empty-state.tsx)

```typescript
import { EmptyState } from "@/components/ui/empty-state"
import { Mic2 } from "lucide-react"

<EmptyState
  icon={Mic2}
  heading="No brand profiles yet"
  description="Create your first brand voice profile to start generating on-brand content."
  actionLabel="Create your first profile"
  onAction={() => setShowCreate(true)}
/>
```

### Skeleton loading pattern

```typescript
import { CardSkeleton } from "@/components/ui/skeletons"

if (loading) {
  return (
    <PageContainer>
      <PageHeader title="Brand Profiles" />
      <CardSkeleton count={3} className="grid-cols-1" />
    </PageContainer>
  )
}
```

### AlertDialog for destructive actions

```typescript
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Pattern: single AlertDialog per page, controlled by deleteTarget state
const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

<AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete this item?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={() => { handleDelete(deleteTarget!); setDeleteTarget(null) }}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Tabs layout for Settings

```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

<Tabs defaultValue="workspace">
  <TabsList className="mb-6">
    <TabsTrigger value="workspace">Workspace</TabsTrigger>
    <TabsTrigger value="account">Account</TabsTrigger>
  </TabsList>
  <TabsContent value="workspace" className="space-y-6">
    {/* Workspace card */}
  </TabsContent>
  <TabsContent value="account" className="space-y-6">
    {/* Account/security card */}
  </TabsContent>
</Tabs>
```

---

## Page-by-Page Assessment

### Pages in Scope

| Route | File | Complexity | Key Concerns |
|-------|------|-----------|--------------|
| `/profiles` | `profiles/page.tsx` | MEDIUM | New ProfileCard component; RHF create form; inline create panel |
| `/profiles/[id]` | `profiles/[id]/page.tsx` | LOW-MEDIUM | No form; many Card sections; TrainingDocs list; AlertDialog for delete |
| `/profiles/[id]/train` | `profiles/[id]/train/page.tsx` | HIGH (RISK) | File drag-and-drop must not break; chat interface; progress bar |
| `/standards` | `standards/page.tsx` | HIGH | Dynamic rules array; edit mode; active toggle; shadcn Select |
| `/objectives` | `objectives/page.tsx` | LOW | Simple form; simple list |
| `/definitions` | `definitions/page.tsx` | LOW | Simplest page in phase |
| `/outputs` | `outputs/page.tsx` | LOW | Read-only list; filter buttons; copy action; EmptyState already exists |
| `/settings` | `settings/page.tsx` | LOW | Tab layout addition; two existing forms become two TabsContent panels |

### Current State vs. Target State

| Page | Current Loading | Current Empty | Current Form | Target Changes |
|------|-----------------|---------------|--------------|----------------|
| Profiles list | Spinner | Ad-hoc card with button | useState inline | CardSkeleton, EmptyState, RHF form, ProfileCard component |
| Profile detail | Spinner | "not found" text | None (actions only) | PageContainer, PageHeader, AlertDialog for delete |
| Profile training | Spinner | - | None (chat+upload) | Visual shell only; skeleton header; preserve ALL upload logic |
| Standards | Spinner | Text paragraph | useState multi-field | CardSkeleton/TableSkeleton, EmptyState, RHF+shadcn Select, AlertDialog |
| Objectives | Spinner | Text paragraph | useState 2-field | CardSkeleton, EmptyState, RHF |
| Definitions | Spinner | Text paragraph | useState 2-field | TableSkeleton (term/def are table-like), EmptyState, RHF |
| Outputs | Spinner | Ad-hoc card (good) | None | CardSkeleton, replace ad-hoc EmptyState with EmptyState component |
| Settings | Spinner | N/A | useState 2 forms | Tabs layout, RHF for both forms |

### Forms to Migrate to RHF + Zod

| Page | Form Fields | Validation Needed |
|------|-------------|-------------------|
| Profiles list — create | `name: string` | min 1 char |
| Standards — create/edit | `name: string`, `category: StandardCategory`, `rules: string[]` | name min 1, rules array min 1 item |
| Objectives — create | `title: string`, `description?: string` | title min 1 |
| Definitions — create | `term: string`, `definition: string` | both min 1 |
| Settings — workspace | `workspaceName: string` | min 1 char |
| Settings — account/password | `newPassword: string` | min 8 chars |

**Note:** Profile training page has NO traditional form — only a textarea for chat input and the file upload. The chat textarea is NOT a form in the RHF sense. Leave it as-is.

---

## Plan Count Recommendation

The roadmap placeholder says "5 TBD plans." Based on the codebase, **5 plans is correct** and maps as follows:

| Plan | Scope | Rationale |
|------|-------|-----------|
| **05-01** | Profiles list page + ProfileCard component | Standalone: needs new component, RHF form, PageContainer |
| **05-02** | Standards management page | Standalone: most complex list page; dynamic rules array; shadcn Select |
| **05-03** | Objectives + Definitions + Outputs (batched) | Three simple pages with identical patterns; safe to batch |
| **05-04** | Settings page tab layout | Standalone: Tab restructure is surgical but distinct from list pages |
| **05-05** | Profile detail page + Profile training page | Grouped because training is the critical-risk item needing careful isolation; detail page is low-risk companion |

**Why 5 and not fewer:** Training page (high risk) justifies its own contained plan. Standards (highest complexity) justifies isolation. Settings (different pattern: tabs) justifies isolation. Batching the three simple list pages (objectives/definitions/outputs) is safe — they're nearly identical.

---

## Open Questions

1. **ProfileCard component location**
   - What we know: No `ProfileCard` component exists yet; the card markup is inline in profiles/page.tsx
   - What's unclear: Should it live in `src/components/ui/` (generic) or `src/components/features/profiles/` (feature-specific)?
   - Recommendation: Create `src/components/features/profiles/profile-card.tsx` since it uses domain types (`BrandProfile`, `ProfileStatus`). Features directory doesn't exist yet — create it.

2. **Table vs. Card layout for Definitions**
   - What we know: Definitions are term/definition pairs — very table-like. `TableSkeleton` is appropriate.
   - What's unclear: Should definitions render as a shadcn `Table` or as a list of Cards?
   - Recommendation: Use shadcn `Table` for definitions (term | definition | delete action columns). More compact and scannable. Standards can stay as Cards (rules need expand/collapse which is harder in table cells).

3. **Outputs filter buttons**
   - What we know: Current filter is a row of `Button` components toggling `filter` state (`"all" | OutputType`).
   - What's unclear: Should this become shadcn `Tabs` (filter as tabs) or stay as button group?
   - Recommendation: Keep as button group (it's a filter, not navigation). Use `variant="default"` for active, `variant="outline"` for inactive — already the current pattern. No change needed.

4. **Breadcrumbs on nested profile pages**
   - What we know: `Breadcrumbs` component from Phase 3 auto-generates from URL path. Profile detail is `/profiles/[id]` — it would show "Profiles > [uuid]" which is wrong.
   - What's unclear: Should `Breadcrumbs` receive the profile name as an override?
   - Recommendation: Profile detail and training pages should pass `overrides={{ [profileId]: profile.name }}` to `Breadcrumbs`. The `Breadcrumbs` component accepts `overrides?: Record<string, string>` for exactly this purpose.

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)

All findings verified by reading actual source files:

- `src/app/(dashboard)/profiles/page.tsx` — current state of profiles list
- `src/app/(dashboard)/profiles/[id]/page.tsx` — current state of profile detail
- `src/app/(dashboard)/profiles/[id]/train/page.tsx` — training page with file upload implementation
- `src/app/(dashboard)/standards/page.tsx` — standards management page
- `src/app/(dashboard)/objectives/page.tsx` — objectives page
- `src/app/(dashboard)/definitions/page.tsx` — definitions page
- `src/app/(dashboard)/outputs/page.tsx` — outputs page
- `src/app/(dashboard)/settings/page.tsx` — settings page
- `src/components/ui/empty-state.tsx` — EmptyState component interface
- `src/components/ui/skeletons.tsx` — CardSkeleton, TableSkeleton, FormSkeleton
- `src/components/ui/form-field.tsx` — FormInput, FormErrorSummary
- `src/components/layout/page-container.tsx` — PageContainer component
- `src/components/layout/page-header.tsx` — PageHeader component
- `src/components/layout/breadcrumbs.tsx` — Breadcrumbs with overrides prop
- `src/components/ui/tabs.tsx` — Tabs, TabsList, TabsTrigger, TabsContent
- `src/components/ui/table.tsx` — Table components
- `src/components/ui/select.tsx` — Select components
- `src/components/ui/alert-dialog.tsx` — AlertDialog (confirmed installed)
- `src/components/ui/skeleton.tsx` — Base Skeleton primitive
- `package.json` — Confirmed: react-hook-form 7.71.1, zod 4.3.6, @hookform/resolvers 5.2.2
- `.planning/ROADMAP.md` — Phase 5 plan count (TBD/5)
- `.planning/phases/02-component-library/02-02-SUMMARY.md` — FormInput, EmptyState patterns
- `.planning/phases/03-app-shell-navigation/03-03-SUMMARY.md` — Layout components confirmed delivered

---

## Metadata

**Confidence breakdown:**
- Current page state: HIGH — read all 8 page files directly
- Component interfaces: HIGH — read all Phase 2/3 deliverable files directly
- Plan count recommendation: HIGH — based on complexity assessment of actual code
- Training page risk: HIGH — drag-and-drop implementation fully inspected
- RHF+shadcn Select integration: HIGH — Select component inspected; RHF docs well-known; pitfall is standard
- AlertDialog pattern: HIGH — component installed and inspected

**Research date:** 2026-02-19
**Valid until:** 2026-03-21 (stable codebase; no fast-moving dependencies)
