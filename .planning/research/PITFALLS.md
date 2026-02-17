# Pitfalls Research: UI Redesign for Next.js AI Platform

**Domain:** UI Redesign (Figma-first, shadcn/UI migration)
**Researched:** 2026-02-17
**Confidence:** MEDIUM-HIGH

---

## Critical Pitfalls

### Pitfall 1: CSS Variable Collisions Breaking Existing Styles

**What goes wrong:**
shadcn/UI uses specific CSS variable names (`--primary`, `--border`, etc.) that already exist in your codebase. During migration, new component styles conflict with old ones, causing visual regressions in pages not yet redesigned.

**Why it happens:**
Both current implementation and shadcn/UI use Tailwind + CSS variables with identical naming. Half-migrated codebase has two competing style systems.

**How to avoid:**
1. Audit existing CSS variables first (globals.css already defines `--primary`, `--border`, etc.)
2. Create migration branch in CSS - use scoped class during transition
3. Test old and new side-by-side
4. Migrate color palette atomically - don't mix old/new color systems

**Warning signs:** Colors "randomly" change on unmigrated pages, hover states disappear, focus rings inconsistent

**Phase to address:** Phase 1: Design System Foundation

---

### Pitfall 2: Breaking Streaming UI State During Component Swap

**What goes wrong:**
Chat interface stops rendering streamed content correctly. Cursor animations break, message rendering stutters, "Generating..." states disappear.

**Why it happens:**
Chat page uses `useChat` from `@ai-sdk/react` with complex streaming state management and custom animations (`streaming-cursor::after`, `message-appear`). New components change DOM structure or timing, breaking React reconciliation during streaming updates.

**How to avoid:**
1. Preserve exact DOM structure for streaming containers
2. Test streaming FIRST - create test harness that streams 1000+ words
3. Keep animation classes separate from new component CSS
4. Verify ref forwarding - shadcn components use `React.forwardRef`

**Warning signs:** Messages appear in chunks, scroll-to-bottom breaks mid-stream, cursor animation missing, React key warnings

**Phase to address:** Phase 2: Chat Migration - requires dedicated sub-phase with streaming-specific QA

---

### Pitfall 3: File Upload Interactions Regressing

**What goes wrong:**
File upload for training profiles stops working or loses drag-and-drop. Progress indicators don't update.

**Why it happens:**
New design changes button/input structure, breaking event handlers or hiding native file input. Custom drag-and-drop zones lose event listeners after component refactor.

**How to avoid:**
1. Map all file upload touchpoints before redesign
2. Preserve native input accessibility (use `opacity: 0` + `position: absolute`, not `display: none`)
3. Test with real files - 50MB+ PDFs, DOCX, cancel mid-upload
4. Verify progress events still fire

**Phase to address:** Phase 3: Profiles/Training page

---

### Pitfall 4: Auth Flow Breaking Due to Layout Changes

**What goes wrong:**
Users get stuck on login page after successful auth. Register flow redirects wrong. Protected routes accessible when logged out.

**Why it happens:**
Supabase auth uses redirects and middleware. Redesign changes route structure or layout components, breaking redirect URLs. New layout doesn't check auth status at right timing.

**How to avoid:**
1. Test full auth flows FIRST - document all redirect paths
2. Preserve route group structure - don't change `(auth)` and `(dashboard)` folders without updating middleware
3. Check Supabase redirect config
4. Test SSR auth state

**Warning signs:** "PKCE verifier not found" errors, infinite redirect loops, flash of auth content, localStorage persists after logout

**Phase to address:** Phase 0: Pre-Migration Audit + Phase 3: Auth Pages

---

### Pitfall 5: Adherence Scoring UI Losing Detailed Dimension Data

**What goes wrong:**
Redesigned scoring cards show overall score but dimension breakdowns disappear. Users can't see which dimension failed. "Regenerate with feedback" button stops working.

**Why it happens:**
Current scoring UI has complex nested state: expandable cards, 8 dimension scores with progress bars, flags with severity levels. Redesign oversimplifies or breaks expand/collapse state management.

**How to avoid:**
1. Map scoring data structure (`AdherenceScore` type and all rendering paths)
2. Preserve information density - scoring cards are DENSE by design
3. Test edge cases - score with 0 fails, all warnings, automatic_fail flag
4. Verify regenerate flow - button constructs prompt from score data

**Phase to address:** Phase 2: Chat Migration - scoring cards need dedicated design review

---

### Pitfall 6: Figma Integration UI Losing Interactive Preview

**What goes wrong:**
Figma URL extraction works backend-side but UI preview doesn't show components/text nodes. Users can't confirm what was extracted.

**How to avoid:**
1. Test Figma extraction flow with 20+ components
2. Preserve confirm/dismiss state (`confirmedFigmaRef.current` must persist)
3. Handle extraction errors visually
4. Test loading state during extraction

**Phase to address:** Phase 3: Chat Features

---

## Technical Debt Patterns

| Shortcut | Long-term Cost | When Acceptable |
|----------|----------------|-----------------|
| Copy-paste shadcn without customizing | Duplicate code, divergence | Never - customize in components/ui/ first |
| Skip TypeScript types for props | Runtime errors, hard refactors | Never - types prevent regressions |
| Inline Tailwind instead of CVA | Inconsistent variants | Never for reusable components |
| Defer dark mode testing | Wasted CSS variables | Acceptable if dark mode explicitly removed |
| Remove animations entirely | Worse perceived performance | Never for streaming UI, loading, toasts |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase auth | Check auth in useEffect, flash of wrong UI | Use SSR middleware, check server-side first |
| AI SDK streaming | New component triggers re-render per token | Keep streaming container flat, use React.memo |
| Sonner toasts | Replace with new toast system | Keep sonner, restyle via Tailwind classes |
| localStorage profile | Forget to update on change | Centralize in layout, dispatch custom event |
| Framer Motion | Add motion to every component | Use sparingly - streaming can't handle constant animations |
| CVA variants | Create new variant system | Keep CVA - shadcn uses it, consistent with current code |

---

## Performance Traps

| Trap | Prevention |
|------|------------|
| Re-rendering entire chat per streamed token | Memoize message components, only update active stream |
| Too many CSS variables per render | Use static classes where possible |
| Unoptimized icon imports | Import individually (already correct) |
| Framer Motion layout on large lists | Remove layout animations from lists >20 items |
| Too many Radix Portal overlays | Audit Dialog/Popover/Tooltip usage |

---

## "Looks Done But Isn't" Checklist

- [ ] **Streaming chat:** Smooth at 1000+ tokens, cursor animation, auto-scroll, can scroll up without jumping
- [ ] **File uploads:** .docx + .pdf, drag-drop, progress bar, error states, file size limits
- [ ] **Auth flows:** Login→dashboard, register, logout→login, protected redirect, SSR state, no PKCE errors
- [ ] **Adherence scoring:** All 8 dimensions render, expand/collapse, regenerate includes issues, color coding
- [ ] **Figma integration:** Extract→preview→confirm flow, error handling, loading state
- [ ] **Profile switching:** Sidebar updates, localStorage persists, `bvp-profile-change` event fires
- [ ] **Toast notifications:** Appear, readable, don't block UI, auto-dismiss
- [ ] **Responsive:** Works at 1920px, 1440px, 1280px, 768px
- [ ] **Keyboard navigation:** Tab order, Enter/Shift+Enter in textarea, Esc closes modals
- [ ] **Loading states:** Initial load, workspace data, streaming, scoring, Figma extraction, file upload

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| CSS variable collision | LOW | Namespace vars, update gradually |
| Streaming UI broken | HIGH | Revert component structure, compare DOM tree, restore refs |
| File upload regression | MEDIUM | Revert file input, re-apply styles, test with real files |
| Auth redirect loop | LOW | Check Supabase allowlist, verify middleware, clear cookies |
| Scoring UI data loss | MEDIUM | Revert scoring card, verify type mapping, test all severities |
| Performance regression | MEDIUM | React DevTools Profiler, add React.memo, remove animations |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|-----------------|--------------|
| CSS variable collision | Phase 1: Foundation | Side-by-side old/new comparison |
| Streaming UI break | Phase 2: Chat | 1000+ token stream test |
| File upload regression | Phase 3: Profiles/Train | Upload .docx + .pdf, drag-drop |
| Auth flow break | Phase 0 + Phase 3 | Full auth flow test suite |
| Scoring UI data loss | Phase 2: Chat | 8 dimensions, expand/collapse, regenerate |
| Figma preview missing | Phase 3: Chat Features | Real Figma URL extraction |
| Performance regression | All phases (continuous) | <16ms frame time during streaming |

---

## Phase-Specific Warnings

### Phase 0: Pre-Migration Audit
- Map ALL state types: Supabase (auth, data), AI SDK (streaming), localStorage (profile), URL (routes)

### Phase 1: Design System Foundation
- Changing `--primary` breaks every existing page until all components migrated
- Use feature flag or route-based CSS loading

### Phase 2: Component Migration (Chat)
- Chat page is 1012 lines, 6 state variables, 3 external integrations
- Migrate in sub-phases: layout → streaming → scoring → Figma

### Phase 3: Feature Pages
- Each page has different data models despite looking similar
- Test each independently

### Phase 4: Polish & Animations
- Avoid animations on chat messages, score cards, anything updating during streaming
- Use CSS transitions for simple hover/focus

---

*Pitfalls research for: Gooder UI Redesign*
*Researched: 2026-02-17*
