# UI/UX Features Research: Modern AI Platform Redesign

**Project:** Gooder - Brand Voice AI Platform
**Research Date:** 2026-02-17
**Context:** Next.js 14 + Supabase, targeting Linear/Notion-caliber UI quality

---

## Table Stakes (Must-Have Features)

### 1. Consistent Spacing System
**Confidence: HIGH**
- 8px base grid for all margins, padding, gaps
- Tailwind config with 4px increments
- Use `gap-4`, `p-6`, `mb-8` consistently
- Avoid arbitrary values like `p-[13px]`

### 2. Subtle Shadows & Border System
**Confidence: HIGH**
- Layered elevation with soft shadows
- Cards: `border + shadow-sm` for subtle lift
- Modals/Popovers: `shadow-lg` for clear separation
- shadcn Components: Card, Dialog, Popover, Dropdown Menu

### 3. Proper Loading States
**Confidence: HIGH**
- Skeleton loaders matching content layout, NOT generic spinners
- Table rows: skeleton rows with same height
- Chat messages: animate skeleton in sequence
- shadcn Components: Skeleton

### 4. Responsive Sidebar with Collapse
**Confidence: HIGH**
- Desktop: expand/collapse toggle (icons + text / icons only)
- Tablet/Mobile: slide-out drawer with backdrop
- Persist state: localStorage or cookies
- shadcn Components: Sheet (mobile), custom sidebar with Collapsible

### 5. Command Palette (Cmd+K)
**Confidence: HIGH**
- Global keyboard shortcut for navigation and actions
- Include: page navigation, brand switching, quick actions
- Fuzzy search with keyboard navigation
- shadcn Components: Command, Dialog

### 6. Form Validation with Inline Errors
**Confidence: HIGH**
- React Hook Form + Zod validation
- Show errors below fields, not in modals
- Visual states: default, focus, error, success
- shadcn Components: Form, Input, Label, Textarea, Select

### 7. Toast Notifications
**Confidence: HIGH**
- Already have Sonner - use consistently
- Types: success, error, warning, info, loading
- shadcn Components: Sonner (already implemented)

### 8. Empty States with Clear CTAs
**Confidence: HIGH**
- Icon + Heading + Description + Primary CTA
- Examples: "Create your first brand profile", "Start a conversation"
- shadcn Components: Card, Button

### 9. Navigation Hierarchy
**Confidence: MEDIUM-HIGH**
- Breadcrumbs for nested pages
- Active state in sidebar navigation
- shadcn Components: Breadcrumb

### 10. Keyboard Shortcuts
**Confidence: MEDIUM-HIGH**
- `Cmd+K`: Command palette, `Cmd+Enter`: Submit, `Esc`: Close modal
- Document in tooltip hints
- shadcn Components: kbd tag styling, Dialog for help modal

### 11. Clean Typography Scale
**Confidence: HIGH**
- text-xs (12px) captions, text-sm (14px) body default, text-base (16px) emphasis
- text-xl (20px) card headings, text-2xl (24px) page headings
- Sans: Inter or Geist, Mono: Geist Mono

---

## Differentiators (Competitive Visual Advantage)

### 1. Microinteractions on Hover/Focus
**Confidence: HIGH**
- Buttons: slight scale on hover (`hover:scale-105`)
- Cards: shadow lift on hover
- Keep subtle: 100-200ms, small changes
- Use Framer Motion sparingly for complex interactions

### 2. Smooth Page Transitions
**Confidence: MEDIUM-HIGH**
- Framer Motion `<AnimatePresence>` for route transitions
- Keep fast: 200-300ms max
- Don't slow down navigation

### 3. Contextual Tooltips
**Confidence: HIGH**
- Icon buttons: explain action on hover
- Metrics: explain calculation methodology
- Delay: 500ms, Brief text: 5-10 words max
- shadcn Components: Tooltip

### 4. Data Visualization for Scores
**Confidence: HIGH**
- Score cards with radial progress (0-100%)
- Color coding: green (good), amber (warning), red (poor)
- Recharts for React-friendly, responsive charts
- shadcn Components: Progress, custom chart components

### 5. Rich Chat Interface
**Confidence: HIGH**
- Markdown rendering, syntax highlighting, copy buttons
- Message actions: copy, regenerate, feedback
- Typing indicators, streaming text
- react-markdown + rehype-highlight

### 6. Intelligent Search & Filtering
**Confidence: MEDIUM-HIGH**
- Debounced search input (300ms)
- URL state for filters (shareable links)
- Multi-select filters with counts
- shadcn Components: Input, Select, Checkbox, Popover

### 7. Onboarding Flows & Feature Discovery
**Confidence: MEDIUM-HIGH**
- First-time setup wizard
- Progress checklist (4/7 setup steps complete)
- Contextual help
- shadcn Components: Dialog, Alert, Progress

---

## Anti-Features (Things to NOT Do)

### 1. Over-Animation
- Avoid Framer Motion on every element, long durations (>300ms)
- Rule: Animate state changes and transitions, not static content

### 2. Dark Gradients Everywhere
- Avoid purple-to-blue gradients on every card, glassmorphism overuse
- Alternative: Solid colors, subtle texture, clean white space

### 3. Complex Nested Navigation
- Avoid mega-menus, hidden navigation, too many tabs/sub-tabs
- For Gooder: Keep sidebar flat, use page headers for context

### 4. Modal Overload
- Avoid multi-step modals, modals opening other modals
- Alternative: Inline editing, sheets/sidebars, undo patterns

### 5. Inconsistent Patterns
- Don't mix UI libraries, button styles, spacing
- Stick to shadcn/UI only, create pattern library

### 6. Poor Mobile Responsiveness
- Ensure touch targets >44px, no horizontal scroll
- For Gooder: Ensure chat, profiles, scores are mobile-friendly

### 7. Overwhelming Dashboards
- Start with 3-5 key metrics, allow drill-down
- Progressive disclosure, "Show more" patterns

---

## shadcn/UI Component Mapping

| Feature | shadcn Components | Priority |
|---------|------------------|----------|
| Forms | Form, Input, Textarea, Select, Checkbox, Label | HIGH |
| Buttons & Actions | Button, Toggle, Switch | HIGH |
| Navigation | Sheet (mobile nav), Collapsible | HIGH |
| Feedback | Sonner (toast), Alert, Skeleton | HIGH |
| Overlays | Dialog, Popover, Tooltip, Dropdown Menu | HIGH |
| Data Display | Card, Table, Badge, Progress | HIGH |
| Layout | Separator, ScrollArea | MEDIUM-HIGH |
| Command | Command (for palette) | HIGH |

## Custom Components to Build

| Feature | Implementation | Complexity |
|---------|----------------|------------|
| Sidebar Navigation | Custom with Collapsible + Sheet | Medium |
| Chat Interface | ScrollArea + Card + react-markdown | High |
| Score Visualizations | Recharts + Progress | Medium |
| Empty States | Card template with icon | Low |
| Filter Panel | Popover + Checkbox + Select | Medium |

---

## Implementation Priority Tiers

### Tier 1: Foundation (Must complete before public)
- Consistent spacing system, Clean typography scale
- Form validation, Proper loading states (skeletons)
- Toast notifications (Sonner), Subtle shadows & borders
- Empty states with CTAs, Responsive sidebar

### Tier 2: Polish (Elevates quality)
- Command palette (Cmd+K), Contextual tooltips
- Data visualization for scores, Rich chat interface
- Microinteractions, Keyboard shortcuts

### Tier 3: Advanced (Post-launch enhancements)
- Smooth page transitions, Intelligent search & filtering
- Onboarding flows, Advanced data visualizations

---

## Reference Platforms (Inspiration)

| Platform | Strengths | Apply To |
|----------|-----------|----------|
| Linear | Minimal sidebar, command palette, keyboard-first | Navigation, shortcuts |
| Notion | Inline editing, empty states, progressive disclosure | Content layout |
| Vercel Dashboard | Clean metrics, minimal chrome | Status indicators |
| ChatGPT / Claude.ai | Chat UI, markdown rendering, copy buttons | Chat interface |
| Stripe Dashboard | Data tables, filters | Output logs, filtering |

---

## Design System Recommendations

**Color Palette (Light Mode):**
- Primary: Single accent color (e.g., indigo-600)
- Neutrals: Gray scale (50-950)
- Semantic: Green/red/amber/blue

**Spacing Scale:** 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

**Typography Scale:** text-xs (12px) through text-3xl (30px)

**Border Radius:** rounded-sm (2px), rounded (4px), rounded-md (6px), rounded-lg (8px)

---

*Research complete, ready for implementation planning*
*Last Updated: 2026-02-17*
