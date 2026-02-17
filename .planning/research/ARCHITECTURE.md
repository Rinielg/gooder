# Architecture Research: shadcn/UI Migration for Next.js AI Platform

**Domain:** UI Redesign (Figma-first, shadcn/UI migration)
**Researched:** 2026-02-17
**Confidence:** HIGH (based on codebase analysis + established patterns)

---

## Migration Strategy: Incremental Adoption

**Approach:** Bottom-up, layer-by-layer migration. Never rewrite entire pages at once.

**Why incremental:** The app is working. Users depend on it. Breaking the chat streaming, file upload, or auth during redesign is unacceptable. Each migration step must leave the app fully functional.

**Key insight:** shadcn/UI builds on the SAME foundation already in the codebase (Radix UI + Tailwind + CVA). This is an enhancement, not a framework swap.

---

## Component Architecture: Three-Layer System

```
Layer 1: Primitives (ui/)
    ↓ imports
Layer 2: Composed (composed/)    ← NEW layer
    ↓ imports
Layer 3: Layout (layout/)
    ↓ imports
Layer 4: Pages (app/)
```

**Rules:**
- Lower layers cannot import from higher layers
- Migrate bottom-up (primitives first)
- Pages are last to change (minimal disruption)

---

## Recommended Project Structure

```
src/
├── components/
│   ├── ui/                          # Layer 1: shadcn primitives
│   │   ├── button.tsx               # Existing ✓
│   │   ├── input.tsx                # Existing ✓
│   │   ├── label.tsx                # Existing ✓
│   │   ├── card.tsx                 # SPLIT from shared.tsx
│   │   ├── textarea.tsx             # SPLIT from shared.tsx
│   │   ├── badge.tsx                # SPLIT from shared.tsx
│   │   ├── separator.tsx            # SPLIT from shared.tsx
│   │   ├── scroll-area.tsx          # SPLIT from shared.tsx
│   │   ├── avatar.tsx               # SPLIT from shared.tsx
│   │   ├── dialog.tsx               # NEW: via shadcn CLI
│   │   ├── dropdown-menu.tsx        # NEW: via shadcn CLI
│   │   ├── select.tsx               # NEW: via shadcn CLI
│   │   ├── tabs.tsx                 # NEW: via shadcn CLI
│   │   ├── tooltip.tsx              # NEW: via shadcn CLI
│   │   ├── skeleton.tsx             # NEW: via shadcn CLI
│   │   └── [additional components]
│   │
│   ├── composed/                    # NEW: App compositions
│   │   ├── profile-card.tsx         # Refactor from pages
│   │   ├── profile-selector.tsx     # Extract from sidebar
│   │   ├── page-header.tsx          # Common pattern
│   │   ├── empty-state.tsx          # Common pattern
│   │   ├── loading-spinner.tsx      # Extract loading patterns
│   │   └── status-badge.tsx         # Typed status colors
│   │
│   └── layout/
│       ├── app-sidebar.tsx          # Refactor with new components
│       ├── dashboard-layout.tsx     # Extract from page layout
│       └── page-container.tsx       # NEW: Consistent padding/spacing
│
├── lib/
│   └── utils.ts                     # cn() helper ✓
│
└── app/
    └── (dashboard)/
        └── [pages use composed + ui layers]
```

### Structure Rationale

**Split shared.tsx into individual files:**
- Current shared.tsx mixes 9 components (Card, Textarea, Badge, Separator, ScrollArea, Avatar)
- shadcn convention: one component group per file
- Enables selective imports and better tree-shaking
- Prevents circular dependencies

**Add composed/ layer:**
- Existing pages have repeated patterns (profile cards, empty states)
- Composed components reduce duplication
- Centralizes domain-specific styling
- Makes Figma-to-code mapping clearer

---

## Architectural Patterns

### Pattern 1: CSS Variable Theming

All colors/spacing defined as CSS variables in globals.css, consumed via Tailwind.

```css
:root {
  --primary: 337 74% 49%;        /* HSL without hsl() */
  --primary-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
}
```

**Migration implication:** New color palette → update CSS variables in globals.css, components unchanged.

### Pattern 2: Composition over Configuration

**Bad (configuration approach):**
```typescript
<Card title="Profile" badge="active" action={<Button>Edit</Button>} />
```

**Good (composition approach):**
```typescript
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Profile</CardTitle>
      <Badge>active</Badge>
    </div>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### Pattern 3: Class Variance Authority (CVA)

Type-safe variant system for component styling. Already in use for Button. Use for any component needing 3+ visual variations.

### Pattern 4: Server vs Client Components

- shadcn components are client components (use state, refs)
- Page layouts can be server components
- Keep client boundary as low as possible
- Current state: DashboardLayout is "use client", AppSidebar is "use client"

### Pattern 5: Controlled vs Uncontrolled Components

- Controlled: Complex validation, dependent fields
- Uncontrolled: Simple forms, Server Actions
- Existing forms use controlled pattern with state

---

## Design Token Architecture

### CSS Variable System (Current)

**Location:** src/app/globals.css

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 337 74% 49%;
  --border: 214.3 31.8% 91.4%;
  --sidebar: 0 0% 98%;
  --sidebar-border: 214.3 31.8% 91.4%;
  --chart-1: 337 74% 49%;
  --chart-2: 173 58% 39%;
}
```

### Migration from Current Color System

1. Export Figma variables to JSON
2. Compare against current CSS variables
3. Update mismatched values
4. Add new semantic tokens (success, warning, info)
5. Test visual regression on key pages

**Light mode only:** Remove .dark {} block, remove darkMode config from tailwind.config.ts

### Figma → Code Workflow

**Phase 1: Design in Figma**
1. Designer creates components using Figma variables
2. Variables map to CSS variable naming (--primary, --border)

**Phase 2: Export Tokens**
1. Use Figma plugin (Tokens Studio, Style Dictionary)
2. Export as JSON

**Phase 3: Sync to Code**
1. Convert JSON to CSS variables
2. Update globals.css
3. Components automatically reflect changes

**Phase 4: Component Development**
1. Designer provides Figma component specs
2. Developer maps to shadcn primitives
3. Custom styling goes in composed/ layer

---

## Component Migration Order

### Phase 1: Split shared.tsx (3-5 days)
1. Create individual component files (card.tsx, textarea.tsx, badge.tsx, etc.)
2. Update imports across codebase
3. Delete shared.tsx after all imports updated
- **Risk:** Import errors if search/replace incomplete
- **Mitigation:** TypeScript compiler finds broken imports

### Phase 2: Add Missing Primitives
Install via shadcn CLI: Dialog, Dropdown Menu, Select, Tabs, Tooltip, Skeleton, Alert Dialog, Breadcrumb, Table

### Phase 3: Extract Composed Components (5-7 days)
- **ProfileCard** (high reuse) - from profiles/page.tsx
- **EmptyState** (high reuse) - from profiles/page.tsx
- **ProfileSelector** - from app-sidebar.tsx
- **LoadingSpinner** - from layout, profiles page

### Phase 4: Refactor Layout Components
- AppSidebar: Replace custom select with ProfileSelector, add Tooltip to collapsed items
- Dashboard layout: Use LoadingSpinner, Skeleton for loading states

### Phase 5: Update Pages (10-15 days)
**Order (simplest to complex):**
1. /settings
2. /definitions
3. /standards
4. /objectives
5. /outputs
6. /profiles
7. /chat (most complex - streaming, scoring, Figma integration)

---

## Data Flow

### Request Flow
```
[User loads page] → [DashboardLayout (client)] ← Auth check
    → [Fetch workspace data] → Supabase
    → [Render AppSidebar + children]
    → [Page (client)] ← Workspace context
    → [Fetch domain data] → Supabase
    → [Render components]
```

### State Management (No change needed)
- React useState for local state
- localStorage for persistence (active profile)
- CustomEvent for cross-component communication (`bvp-profile-change`)
- No Redux/Zustand needed for MVP

---

## Anti-Patterns to Avoid

### 1. Premature Abstraction
Don't create wrapper components for everything. Use shadcn directly. Only wrap for app-specific logic.

### 2. Mixing Design Tokens
Don't use hard-coded colors alongside CSS variables. ALL colors via CSS variables.

### 3. Shared Component Files
Don't put multiple components in one file. One file per component group (shadcn convention).

### 4. Over-using Composition
Compose only when pattern repeats 3+ times. Three similar lines is better than premature abstraction.

### 5. Client Components Everywhere
Default to Server Components. Add "use client" only when needed (state, events, refs).

---

## Build Order Dependencies

**Must happen in order:**
1. Split shared.tsx → Update imports → Delete shared.tsx
2. Install shadcn components → Use in composed/ → Use in pages

**Can happen in parallel:**
- Design token migration (CSS variables)
- Component extraction (doesn't affect existing pages)
- Page migrations (each page independent)

**Blocks other work:**
- Splitting shared.tsx blocks all other component work
- Design token migration should happen early

---

## Risk Areas

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking pages during shared.tsx split | HIGH | Comprehensive search/replace, TypeScript errors |
| Design token mismatch Figma vs code | MEDIUM | Side-by-side review before merge |
| Components look different after migration | MEDIUM | Visual regression testing on key pages |
| Performance regression from client components | LOW | Lighthouse audits before/after |

---

*Architecture research for: Gooder AI Platform UI Redesign*
*Researched: 2026-02-17*
