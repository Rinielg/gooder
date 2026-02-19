# Phase 4: Auth Pages - Research

**Researched:** 2026-02-19
**Domain:** Next.js App Router auth page layout, React Hook Form + Zod validation, split-screen layout, next/image, Supabase auth preservation
**Confidence:** HIGH

## Summary

This phase redesigns the login and register pages to use a split-screen layout: a brand panel on the left and an auth form panel on the right. All existing Supabase auth behavior is preserved — only the visual layer changes. The existing pages are `"use client"` components using `useState` for controlled inputs; the redesign will migrate the form state management to React Hook Form + Zod (already installed and ready) while keeping the existing Supabase call patterns unchanged.

The split-screen layout is straightforward in Next.js 14 App Router: a full-height `flex` container in the page component, no special routing needed. The `(auth)` route group has no existing layout file, so both login and register pages can each render their own full-page layout independently. The brand panel uses Tailwind's `bg-muted` or an indigo-toned background (`bg-primary/5`) from the existing CSS variable tokens, with an `<Image>` from `next/image` for the product screenshot. On mobile, the brand panel is hidden via `hidden md:flex` on the left column.

The key technical findings: (1) framer-motion is installed but has not been used anywhere in the codebase yet — it is available for subtle float/entrance animations on the brand panel if desired; (2) there is no existing auth layout file, so the split-screen wrapping lives entirely within each page component; (3) the product name is "Gooder" (used in mobile-top-bar) while the app title metadata says "Brand Voice Platform" — the brand panel should use "Gooder" as the product mark; (4) React Hook Form + Zod are installed but not yet used in any auth page — only the `FormInput` wrapper exists in the component library; (5) no screenshot image asset exists yet in the project's `public/` directory — it must be created as part of this phase.

**Primary recommendation:** Rewrite both auth pages as split-screen layouts. Left brand panel: `hidden md:flex` column with indigo-tinted background, Gooder wordmark with Zap icon, a static screenshot rendered via `next/image`, and tagline copy. Right form panel: vertically centered form using the existing `FormInput` wrapper + `Form` provider from Phase 2, `useForm` + `zodResolver` for validation, and the unchanged Supabase `signInWithPassword` / `signUp` calls for auth logic.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Page layout structure:**
- Split-screen layout: left half is a brand panel, right half holds the form
- Brand panel (left): light background with the Gooder logo, a product UI screenshot/preview, and a short tagline below
- Form panel (right): contains the auth form — email, password, submit button, and navigation link to register/login

### Claude's Discretion

- Exact column width split (e.g., 45/55 or 50/50)
- Screenshot presentation style (card with shadow, rounded corners, slight tilt/float treatment)
- Tagline copy (unless a specific one exists in the codebase)
- Form layout within the right panel (label position, field spacing, button style)
- Mobile behavior — brand panel likely hidden on narrow viewports, form takes full width

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | Login page redesigned with new design system (typography, colors, spacing, components) | Existing login page is plain `useState` + shadcn Card; redesign replaces with split-screen, FormInput wrapper, Zod schema, and design system tokens. No Supabase logic changes. |
| AUTH-02 | Register page redesigned with new design system | Same approach as AUTH-01. Register page has workspace name, email, password fields + API call to `/api/auth/register`; all preserved. |
| AUTH-03 | Auth pages preserve all existing redirect behavior and Supabase integration | Supabase calls (`signInWithPassword`, `signUp`), `router.push("/chat")`, `router.refresh()`, `toast.error()` and the `/api/auth/register` fetch are all kept verbatim — only the form state management changes from `useState` to `useForm`. |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | ^7.71.1 | Form state, validation, submission handling | Already installed (Phase 2 FormInput built on it); performance-optimized (uncontrolled by default), minimal re-renders |
| zod | ^4.3.6 | Schema-based validation | Already installed; pairs with @hookform/resolvers for RHF integration; type-safe, excellent error messages |
| @hookform/resolvers | ^5.2.2 | Bridges Zod schemas to RHF | Already installed; single function `zodResolver(schema)` as RHF resolver |
| next/image | 14.2.35 (built-in) | Optimized image rendering for product screenshot | Built-in to Next.js; automatic width/height optimization, lazy loading, blur placeholder support |
| FormInput / Form (Phase 2) | Already in codebase | Consistent form field layout with inline validation | Built in Phase 02-02; handles FormItem + FormLabel + FormControl + FormMessage composition |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| framer-motion | ^12.34.0 | Subtle entrance animations or float effects on brand panel | Already installed, never yet used; available for screenshot card float treatment or panel fade-in |
| lucide-react | ^0.563.0 | Zap icon for Gooder logo mark | Already used in sidebar and auth pages |
| sonner (toast) | ^2.0.7 | Error/success toasts | Already configured in root layout; same `toast.error()` / `toast.success()` calls preserved |
| tailwindcss-animate | ^1.0.7 | CSS keyframe utilities | For entrance animations without framer-motion if simpler approach chosen |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React Hook Form + Zod | Existing `useState` pattern | useState is already working but has no validation; RHF+Zod gives inline validation, error messages, and FormInput reuse — no reason to avoid it since both are already installed |
| next/image for screenshot | `<img>` tag | next/image gives lazy loading, blur placeholder, and automatic srcset; adds minimal complexity and `public/` is local so no domain config needed |
| Tailwind hidden/flex for mobile | Custom CSS or JS breakpoint | Pure Tailwind responsive utilities are sufficient; no JS needed for hiding the brand panel |

**Installation:**
```bash
# All required libraries already installed — no new packages needed
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   └── (auth)/
│       ├── login/
│       │   └── page.tsx          # Full split-screen redesign
│       └── register/
│           └── page.tsx          # Full split-screen redesign
└── public/
    └── screenshots/
        └── dashboard-preview.png # Product screenshot for brand panel (must be created)
```

No new component files are required. Both pages are self-contained. A shared `AuthBrandPanel` component is an option if the two pages share the exact same left panel markup, but it's not strictly necessary for a two-page scope.

### Pattern 1: Split-Screen Full-Height Layout

**What:** Two-column flex layout filling the viewport. Left column (brand panel) hides on mobile. Right column (form panel) is always visible.

**When to use:** Auth pages, landing pages, onboarding flows where you want to show the product alongside the form.

**Example:**
```typescript
// Full-height split screen
export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Brand panel — hidden below md breakpoint */}
      <div className="hidden md:flex md:w-1/2 lg:w-[45%] bg-muted flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Logo */}
        {/* Screenshot card */}
        {/* Tagline */}
      </div>

      {/* Form panel — full width on mobile, right half on md+ */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          {/* Form */}
        </div>
      </div>
    </div>
  )
}
```

**Key insight:** The `(auth)` route group has no existing `layout.tsx` — there is no shared layout to work around. Each page is free to render a full-page structure directly. Do not add a layout file unless sharing the brand panel is explicitly desired.

### Pattern 2: React Hook Form + Zod for Auth Form

**What:** Replace `useState` controlled inputs with `useForm` + `zodResolver`. Keep Supabase calls in `handleSubmit` handler. Use `FormInput` wrapper from Phase 2.

**When to use:** Any form that needs inline validation, error display, and loading states.

**Example:**
```typescript
// Source: existing FormInput usage pattern (form-field.tsx comments)
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form } from "@/components/ui/form"
import { FormInput } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",           // Errors appear on blur
    reValidateMode: "onChange" // Errors clear in real-time
  })

  async function onSubmit(values: LoginFormValues) {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })
      if (error) {
        toast.error(error.message)
        return
      }
      router.push("/chat")
      router.refresh()
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput name="email" label="Email">
          <Input type="email" placeholder="you@company.com" autoComplete="email" />
        </FormInput>
        <FormInput name="password" label="Password">
          <Input type="password" placeholder="••••••••" autoComplete="current-password" />
        </FormInput>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>
    </Form>
  )
}
```

**Key insight:** `FormInput` from Phase 2 requires being inside a `<Form {...form}>` provider (which is `FormProvider` from RHF). Without `Form`, `useFormContext()` inside `FormInput` will throw. The `form.handleSubmit(onSubmit)` wraps the handler and prevents form submission if validation fails — no need for manual `e.preventDefault()`.

### Pattern 3: Product Screenshot with next/image

**What:** Display a static PNG screenshot of the app dashboard in the brand panel using Next.js's `Image` component.

**When to use:** Any local image that benefits from lazy loading and browser-optimized delivery.

**Example:**
```typescript
import Image from "next/image"

// Inside brand panel
<div className="relative w-full max-w-md rounded-xl overflow-hidden shadow-elevation-3 ring-1 ring-border/50 rotate-[-2deg]">
  <Image
    src="/screenshots/dashboard-preview.png"
    alt="Gooder dashboard preview"
    width={800}
    height={500}
    className="w-full h-auto"
    priority={false}
  />
</div>
```

**Key insight:** The `next.config.js` `images.remotePatterns` only covers `*.supabase.co` — this does not affect local `public/` images. Local images in `public/` are served directly by Next.js with no configuration required. The screenshot file must exist at `/public/screenshots/dashboard-preview.png` before the page is built.

**Screenshot creation options:**
1. Take a browser screenshot of the existing dashboard (chat page) and place in `public/screenshots/`
2. Use a placeholder image as a stub during implementation, replace with real screenshot before final review
3. Use a Next.js `blur` placeholder while loading: add `placeholder="blur"` with `blurDataURL` for perceived performance

### Pattern 4: Brand Panel Visual Design

**What:** Light indigo/zinc tinted panel using existing CSS variables from Phase 1.

**When to use:** Brand panel backgrounds that should align with the established indigo/zinc palette.

**Recommended approach:**
```typescript
// Option A: Very subtle — use bg-muted (zinc-100 equivalent)
<div className="bg-muted">

// Option B: Slight indigo tint — primary at low opacity over white
<div className="bg-primary/5">

// Option C: Zinc-50 with gradient to primary/10 at bottom
<div className="bg-gradient-to-br from-background to-primary/8">
```

**Existing tokens available (from globals.css):**
- `--background`: white (`0 0% 100%`)
- `--muted`: zinc-100 equivalent (`240 4.8% 95.9%`)
- `--primary`: indigo-500 equivalent (`238 76% 59%`)
- `--border`: zinc-200 equivalent (`240 5.9% 90%`)

**Key insight:** The brand panel should feel clearly different from the white form panel without being dark. A subtle `bg-primary/5` (very light indigo wash) or `bg-muted` (zinc-100) are both appropriate. The context says "light treatment" — avoid saturated backgrounds.

### Pattern 5: Mobile Hiding via Tailwind Responsive Utilities

**What:** Hide the brand panel below the `md` breakpoint (768px) using Tailwind's responsive prefix.

**When to use:** Any element that should only appear on larger viewports.

**Example:**
```typescript
// Brand panel: hidden on mobile, flex on md+
<div className="hidden md:flex md:w-1/2 lg:w-[45%] ...">

// Form panel: full width on mobile, half-width on md+
<div className="flex-1 flex items-center justify-center ...">
```

**Key insight:** This is pure CSS — no JavaScript, no `useMediaQuery` hook needed. The form panel uses `flex-1` so it fills all available space when the brand panel is hidden (mobile) and shares space when both columns are visible (desktop). No hydration risk since no client-side state is involved.

### Anti-Patterns to Avoid

- **Keeping `useState` for form fields:** The existing pages use `useState` for each input. Do not keep this pattern — it creates unnecessary re-renders and loses the validation benefits of RHF. Migrate fully to `useForm`.
- **Wrapping in `PageContainer`:** `PageContainer` enforces 1280px max-width and is designed for dashboard pages. Auth pages use their own full-height layout. Do not import `PageContainer` into auth pages.
- **Adding an `(auth)` layout.tsx for the split screen:** The brand panel markup is slightly different between login (tagline copy) and register (may have different emphasis). Keep each page self-contained unless the panels are 100% identical.
- **Using `<img>` instead of `next/image`:** `next/image` is the correct pattern for this stack; it handles optimization, lazy loading, and prevents Cumulative Layout Shift (CLS) from undeclared image dimensions.
- **Omitting `autoComplete` attributes:** The existing pages already have `autoComplete="email"` and `autoComplete="current-password"` / `autoComplete="new-password"`. These are important for browser password managers and must be preserved in the redesign.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom regex checks with `useState` | Zod schema + `zodResolver` | Zod handles email format, min length, required fields with clear messages; already installed |
| Inline error display | Conditional `<p>` elements below each input | `FormInput` wrapper (Phase 2) | Handles FormItem/FormLabel/FormControl/FormMessage composition; ensures consistent error styling |
| Image optimization | Raw `<img>` with manual width/height | `next/image` | Automatic srcset, lazy loading, blur placeholder, LCP optimization |
| Loading state | Custom loading boolean per field | Single `loading` state + `disabled={loading}` on submit | Form-level loading is sufficient for auth; field-level loading would be over-engineering |
| Responsive layout | JS-based show/hide | Tailwind `hidden md:flex` | Pure CSS, no hydration risk, no JS bundle cost |

**Key insight:** The most common mistake on auth page redesigns is rebuilding validation from scratch when a working validation library is already installed. Use `FormInput` + Zod and move on.

## Common Pitfalls

### Pitfall 1: Breaking Supabase Auth Calls During RHF Migration

**What goes wrong:** Migrating from `useState` to `useForm` accidentally changes how form values are passed to `supabase.auth.signInWithPassword()`, causing auth to silently fail (e.g., `undefined` email/password).

**Why it happens:** With `useState`, values are read from state variables directly. With RHF, values are passed as the `values` argument to `onSubmit`. If the developer forgets to read from `values` and still references old state variables that no longer exist, the call receives empty strings.

**How to avoid:** Delete the old `useState` declarations for email/password. Read exclusively from `values.email` and `values.password` in the `onSubmit` handler. The Supabase client call signature is unchanged.

**Warning signs:** Auth works on existing page, fails silently on redesigned page. `toast.error()` is called but the error message is `"Invalid login credentials"` — which means the call reached Supabase with empty credentials.

### Pitfall 2: FormInput Requiring Form Context

**What goes wrong:** `FormInput` throws "useFormField should be used within FormField" or `useFormContext` throws at runtime.

**Why it happens:** `FormInput` uses `useFormContext()` internally. This hook requires a `<Form {...form}>` provider ancestor. If you use `FormInput` inside a `<form>` element without the `<Form>` wrapper, it throws.

**How to avoid:** Always wrap the `<form>` element with `<Form {...form}>` from `@/components/ui/form`. The `Form` component is `FormProvider` from RHF re-exported.

```typescript
// Correct
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormInput name="email" label="Email">...</FormInput>
  </form>
</Form>

// Wrong — FormInput will throw
<form onSubmit={form.handleSubmit(onSubmit)}>
  <FormInput name="email" label="Email">...</FormInput>
</form>
```

**Warning signs:** Runtime error in console: "useFormField should be used within `<FormField>`" or "Cannot read properties of null (reading 'control')".

### Pitfall 3: Missing Screenshot Asset at Build Time

**What goes wrong:** Build fails or the brand panel shows a broken image because the screenshot PNG doesn't exist in `public/`.

**Why it happens:** `next/image` with a local `src="/screenshots/dashboard-preview.png"` path will show an error if the file doesn't exist. Unlike remote images, there is no runtime fallback.

**How to avoid:** Before implementing the brand panel with a real screenshot: either (a) use a placeholder solid color background with the logo/tagline only until the screenshot is ready, or (b) create the screenshot file first as step one of the implementation plan.

**Warning signs:** 404 on `/screenshots/dashboard-preview.png`. The `next/image` component shows a broken image icon in development.

### Pitfall 4: Zod v4 API Differences

**What goes wrong:** Zod v4 (installed: `^4.3.6`) has breaking API changes from Zod v3. Some community code examples (pre-2025) use v3 syntax.

**Why it happens:** Zod v4 was released in 2025. Most online examples still use Zod v3 syntax. The core `z.object()`, `z.string()`, `.email()`, `.min()` APIs remain the same. However, `z.string().nonempty()` was removed in favor of `.min(1)`.

**How to avoid:** Use `z.string().min(1, "Required")` instead of `.nonempty()`. Use `z.string().email()` which is unchanged. For the auth schemas here, the differences are minimal and the standard patterns all work in v4.

**Warning signs:** TypeScript error on `.nonempty()` method. Runtime error about unknown method.

### Pitfall 5: Auth Page "use client" Requirement

**What goes wrong:** Removing `"use client"` from auth pages causes build error because the pages use browser-only APIs (Supabase browser client, `useRouter`, `useState`, `useForm`).

**Why it happens:** All hooks and the Supabase browser client require a client component context. The existing pages correctly have `"use client"` at the top.

**How to avoid:** Keep `"use client"` as the first line of both auth page files. The split-screen layout adds no server-side requirements — the entire page is client-rendered.

## Code Examples

### Login Page: Full Redesign Structure

```typescript
// src/app/(auth)/login/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form } from "@/components/ui/form"
import { FormInput } from "@/components/ui/form-field"
import { toast } from "sonner"
import { Loader2, Zap } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  })

  async function onSubmit(values: LoginFormValues) {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })
      if (error) {
        toast.error(error.message)
        return
      }
      router.push("/chat")
      router.refresh()
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Brand panel */}
      <div className="hidden md:flex md:w-[45%] bg-primary/5 flex-col items-center justify-center p-12 border-r border-border">
        {/* Logo mark */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <span className="text-2xl font-semibold tracking-tight">Gooder</span>
        </div>

        {/* Product screenshot */}
        <div className="relative w-full max-w-md rounded-xl overflow-hidden shadow-elevation-3 ring-1 ring-border/50">
          <Image
            src="/screenshots/dashboard-preview.png"
            alt="Gooder dashboard preview"
            width={800}
            height={500}
            className="w-full h-auto"
          />
        </div>

        {/* Tagline */}
        <p className="mt-8 text-center text-muted-foreground text-sm max-w-xs">
          Brand voice that sounds like you — every time.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile logo (only shown when brand panel is hidden) */}
          <div className="flex items-center gap-2 md:hidden mb-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-xl font-semibold">Gooder</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground">Enter your credentials to access your workspace</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormInput name="email" label="Email">
                <Input type="email" placeholder="you@company.com" autoComplete="email" />
              </FormInput>
              <FormInput name="password" label="Password">
                <Input type="password" placeholder="••••••••" autoComplete="current-password" />
              </FormInput>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>
          </Form>

          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

### Register Page: Zod Schema (3 fields)

```typescript
// Register has an additional optional workspace name field
const registerSchema = z.object({
  workspaceName: z.string().optional(),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type RegisterFormValues = z.infer<typeof registerSchema>

// The onSubmit handler is unchanged from current implementation:
async function onSubmit(values: RegisterFormValues) {
  setLoading(true)
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    })
    // ... rest of existing register logic (workspace creation API call)
    const workspaceName = values.workspaceName || `${values.email.split("@")[0]}'s Workspace`
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: authData.user.id, workspaceName }),
    })
    // ... rest unchanged
  }
}
```

### Screenshot Placeholder Strategy

```typescript
// While waiting for real screenshot, use a styled placeholder card
// Replace with Image component once PNG is in public/screenshots/

// Placeholder option — shows app chrome with muted colors
<div className="w-full max-w-md rounded-xl shadow-elevation-3 ring-1 ring-border/50 bg-background p-4 space-y-3">
  <div className="h-8 bg-muted rounded-md w-1/2" />
  <div className="h-32 bg-muted rounded-md" />
  <div className="h-4 bg-muted rounded w-3/4" />
  <div className="h-4 bg-muted rounded w-1/2" />
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useState` per field for forms | React Hook Form with `useForm` | 2020+ (RHF mature) | Uncontrolled inputs, fewer re-renders, built-in validation |
| `e.preventDefault()` + manual submit | `form.handleSubmit(onSubmit)` | RHF standard | Validation gates submission automatically |
| Custom error `<p>` elements | `FormMessage` via `FormInput` wrapper | Phase 2 of this project | Consistent error styling, accessible aria attributes |
| `<img>` tags | `next/image` | Next.js 10+ | LCP optimization, lazy loading, blur placeholder |
| Auth page as centered card only | Split-screen brand + form layout | Industry pattern (circa 2020+) | Social proof and product preview increases conversion |

**Deprecated/outdated:**
- **`useState` for form fields:** Being replaced by RHF in this phase — keep only the `loading` boolean state.
- **`<Card>` wrapping the form:** The current pages wrap the form in a shadcn `Card`. The redesigned layout doesn't need this — the form panel provides its own container context via the split-screen layout.

## Open Questions

1. **Screenshot asset: real capture vs placeholder**
   - What we know: No screenshot exists in `public/` yet; `public/` directory is empty
   - What's unclear: Whether a real app screenshot is available or should be created during implementation
   - Recommendation: Make screenshot creation a discrete first task (Step 1 of the plan). Capture the `/chat` or `/profiles` page which is the most representative view. If not available, use a skeleton placeholder that can be swapped later.

2. **Tagline copy**
   - What we know: Existing register page has "Set up your workspace to start generating brand-consistent content" and login has "AI-powered brand voice management". App metadata says "AI-powered brand voice management and content generation". Mobile top bar uses "Gooder" as the product name.
   - What's unclear: Whether the user has a preferred tagline or one should be created from existing copy
   - Recommendation: Since tagline copy is Claude's discretion, use something short and aspirational like "Brand voice that sounds like you — every time." This is distinct from the existing copy (avoids exact repetition) and fits the "aspirational" brief from the context.

3. **Column width split**
   - What we know: User left this as Claude's discretion (45/55 or 50/50 mentioned)
   - What's unclear: Which feels better aesthetically
   - Recommendation: Use 45% brand / 55% form (`md:w-[45%]` for brand panel, `flex-1` for form panel). This gives slightly more breathing room to the form, which is the functional heart of the page, while still giving the brand panel substantial presence.

4. **Screenshot card presentation**
   - What we know: "card with shadow, rounded corners, slight tilt/float treatment" is Claude's discretion
   - Recommendation: Use `shadow-elevation-3` (already defined in tailwind.config.ts), `rounded-xl`, `ring-1 ring-border/50` for the card outline, and a subtle `rotate-[-2deg]` CSS transform for a slight tilt. Avoid framer-motion for the tilt — a static CSS transform is simpler and loads faster.

5. **Logo treatment in brand panel**
   - What we know: Existing codebase uses `<Zap />` icon from lucide-react everywhere as the Gooder mark (sidebar, mobile top bar, auth pages). "Gooder" is the product name (from mobile-top-bar.tsx).
   - Recommendation: Brand panel shows `<Zap />` icon in a primary/10 rounded container + "Gooder" wordmark in bold. Same pattern as the existing sidebar header.

## Sources

### Primary (HIGH confidence)

- Codebase: `src/app/(auth)/login/page.tsx` — Existing auth implementation with Supabase calls, routing, and toast patterns
- Codebase: `src/app/(auth)/register/page.tsx` — Existing register implementation with workspace API call
- Codebase: `src/components/ui/form-field.tsx` — FormInput wrapper interface and usage pattern (comments in file)
- Codebase: `src/components/ui/form.tsx` — Form/FormProvider, FormField, FormItem, FormControl, FormMessage exports
- Codebase: `src/app/globals.css` — All CSS variable tokens (--primary, --muted, --border, --background etc.)
- Codebase: `tailwind.config.ts` — Custom elevation shadows, spacing, border radius, font configuration
- Codebase: `next.config.js` — images.remotePatterns (confirms local /public/ images need no config)
- Codebase: `package.json` — Confirmed versions: react-hook-form ^7.71.1, zod ^4.3.6, @hookform/resolvers ^5.2.2, framer-motion ^12.34.0, next 14.2.35
- Codebase: `src/components/layout/mobile-top-bar.tsx` — Confirms "Gooder" as product name with Zap icon
- [Next.js Image Component Docs](https://nextjs.org/docs/app/api-reference/components/image) — Local image handling, width/height props, blur placeholder
- [React Hook Form useForm API](https://react-hook-form.com/docs/useform) — mode, reValidateMode, resolver options

### Secondary (MEDIUM confidence)

- [Zod v4 Migration Guide](https://zod.dev/changelog) — Confirms `.nonempty()` removed; `.min(1)` replacement
- [shadcn/ui Form Component Docs](https://ui.shadcn.com/docs/components/form) — Form + FormField + FormItem composition pattern

### Tertiary (LOW confidence)

None — all key findings are verified against the actual codebase or official documentation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All libraries verified from package.json; API patterns verified from existing Phase 2 components in codebase
- Architecture: HIGH — Split-screen pattern is pure Tailwind; no new APIs; `(auth)` group confirmed to have no layout.tsx
- Pitfalls: HIGH — Migration pitfalls derived from reading actual existing code; hydration/FormContext issues documented in official RHF docs

**Research date:** 2026-02-19
**Valid until:** ~30 days (stable stack; Next.js 14 + RHF 7 + Zod 4 are all stable releases)
