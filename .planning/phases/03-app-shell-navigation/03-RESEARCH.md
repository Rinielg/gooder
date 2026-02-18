# Phase 3: App Shell & Navigation - Research

**Researched:** 2026-02-18
**Domain:** React/Next.js responsive navigation, sidebar state management, breadcrumb navigation
**Confidence:** HIGH

## Summary

This phase redesigns the app shell with a collapsible sidebar, mobile-responsive drawer navigation, brand profile selector, breadcrumb navigation, and consistent page framing. The implementation leverages existing shadcn/ui components (Sheet, Breadcrumb, Popover) built on Radix UI primitives, all of which are already installed. The core technical challenges are: (1) localStorage state persistence without hydration errors, (2) smooth CSS transitions for sidebar collapse, (3) responsive breakpoint detection for mobile drawer switching, and (4) dynamic breadcrumb generation from Next.js app router paths.

The established patterns from similar implementations consistently recommend: useEffect for localStorage operations to avoid SSR hydration mismatches, transform/opacity CSS properties for performant animations (avoiding width/height), custom useMediaQuery hooks for responsive breakpoint detection, and usePathname for active route detection in Next.js 14 App Router client components.

**Primary recommendation:** Build collapsible sidebar with localStorage persistence using useEffect pattern, leverage Sheet component for mobile drawer at 1024px breakpoint detected via custom useMediaQuery hook, implement dynamic breadcrumbs using usePathname with path segment parsing, and wrap all pages in PageContainer/PageHeader layout components for consistency.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Sidebar behavior:**
- Medium width when expanded (240-260px)
- Collapse/expand toggle is a floating edge handle on the sidebar's right edge
- Smooth slide transition (~200ms) — labels fade out, icons stay
- Collapsed state persists across sessions via localStorage

**Mobile navigation:**
- Sidebar switches to mobile drawer at 1024px (lg breakpoint)
- Hamburger trigger placement: Claude's discretion
- Drawer slide direction: Claude's discretion
- Overlay tap closes the drawer
- Navigating to a page does NOT auto-close the drawer — lets user browse multiple pages
- Same content as desktop sidebar (full parity)
- Mobile top bar shows logo/brand only (not page title)
- Mobile top bar includes a "New Chat" shortcut button alongside the hamburger

**Profile selector:**
- Positioned at the top of the sidebar — first thing visible
- Shows brand name only with a chevron when expanded (no avatar or description)
- Opens as a popover with search/filter input for users with many brands
- When sidebar is collapsed: shows first letter of brand name in a circle avatar — clickable to open popover

**Page framing:**
- PageContainer max-width: 1280px, centered
- PageHeader: title on the left, action buttons on the right (no description line)
- Breadcrumbs: text links with separators (Profiles > Brand Name > Training)
- Breadcrumbs appear above the page title on nested pages — hierarchy flows top-down

### Claude's Discretion

- Hamburger trigger placement on mobile
- Mobile drawer slide direction (left or bottom)
- Exact spacing and padding within sidebar items
- Active navigation indicator style (background, border-left, color change)
- Collapsed sidebar width (typically 64-80px)
- PageContainer horizontal padding amount

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SHELL-01 | Redesigned sidebar with collapse/expand toggle (icons-only when collapsed) | CSS transitions with transform/opacity for performance; localStorage persistence via useEffect pattern to avoid hydration errors; floating edge handle implemented as positioned button |
| SHELL-02 | Mobile-responsive sidebar using Sheet component as slide-out drawer | Sheet component (already installed) provides Radix Dialog with built-in overlay, focus trap, and keyboard navigation; useMediaQuery hook detects 1024px breakpoint for conditional rendering |
| SHELL-03 | Profile selector in sidebar restyled with new components | Popover component (already installed) provides accessible dropdown with search/filter; Avatar component for collapsed state; Combobox pattern for searchable selection |
| SHELL-04 | Active navigation state indicators on current page | usePathname hook from Next.js provides current route; compare pathname with href to apply active styles; support prefix matching for nested routes |
| SHELL-05 | Breadcrumb navigation on nested pages | Breadcrumb component (already installed) with Next.js Link integration via asChild prop; dynamic generation from usePathname path segments |
| SHELL-06 | Consistent page header pattern across all dashboard pages | Reusable PageHeader component with flex layout: title on left, actions on right; no description line per user constraint |
| SHELL-07 | PageContainer wrapper enforcing consistent padding and max-width | Wrapper component with max-w-[1280px] Tailwind class, mx-auto for centering, and configurable horizontal padding |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @radix-ui/react-dialog | ^1.1.15 | Sheet/Drawer foundation | Industry standard accessible primitives, powers shadcn Sheet component, built-in focus trap and overlay |
| @radix-ui/react-popover | ^1.1.15 | Profile selector dropdown | Accessible popover with positioning, keyboard navigation, already installed |
| next/navigation | 14.2.35 | usePathname, useRouter hooks | Next.js 14 App Router official navigation API |
| React (useState, useEffect) | ^18 | State and lifecycle management | Core React hooks for sidebar state and localStorage sync |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^0.563.0 | Icons for navigation | Already installed, consistent with Phase 1-2 |
| clsx / tailwind-merge | Installed | Conditional class names | Combining active states and responsive classes |
| tailwindcss-animate | ^1.0.7 | CSS transitions | Already installed, provides animation utilities |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom useMediaQuery | react-responsive library | Custom hook is lighter and sufficient for single breakpoint detection; library adds 4KB for features we don't need |
| localStorage directly | Zustand/Redux with persistence | State management library overkill for single boolean flag; adds complexity and bundle size |
| Custom breadcrumb logic | nextjs-breadcrumbs package | Package provides conveniences but adds dependency; simple path parsing is 20 lines and more maintainable |

**Installation:**
```bash
# All required libraries already installed
# No additional npm packages needed
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── app-sidebar.tsx           # Desktop sidebar (refactored)
│   │   ├── mobile-nav.tsx            # Mobile drawer with Sheet
│   │   ├── profile-selector.tsx      # Popover with search
│   │   ├── page-container.tsx        # Layout wrapper
│   │   └── page-header.tsx           # Header with breadcrumbs
│   └── ui/                           # Existing shadcn components
├── hooks/
│   ├── use-media-query.ts            # Breakpoint detection
│   └── use-sidebar-state.ts          # localStorage persistence
└── app/
    └── (dashboard)/
        └── layout.tsx                # Updated to handle responsive nav
```

### Pattern 1: localStorage Persistence Without Hydration Errors

**What:** Store sidebar collapsed state in localStorage while avoiding React hydration mismatches during SSR.

**When to use:** Any client-side state that needs to persist across sessions in Next.js App Router.

**Example:**
```typescript
// hooks/use-sidebar-state.ts
import { useState, useEffect } from 'react'

export function useSidebarState() {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Load from localStorage only after client-side mount
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed')
    if (stored) {
      setCollapsed(stored === 'true')
    }
    setMounted(true)
  }, [])

  // Persist changes to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebar-collapsed', String(collapsed))
    }
  }, [collapsed, mounted])

  return { collapsed, setCollapsed, mounted }
}
```

**Source:** [Next.js Hydration Error Docs](https://nextjs.org/docs/messages/react-hydration-error), [localStorage Hydration Discussion](https://github.com/vercel/next.js/discussions/54350)

**Key insight:** The `mounted` flag prevents localStorage operations during SSR. The component renders a loading state until `mounted` is true, ensuring server and client render the same initial HTML.

### Pattern 2: Responsive Breakpoint Detection Hook

**What:** Custom hook that uses window.matchMedia to detect responsive breakpoints in React components.

**When to use:** When you need to conditionally render components or change behavior based on viewport width (e.g., desktop sidebar vs mobile drawer).

**Example:**
```typescript
// hooks/use-media-query.ts
import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const media = window.matchMedia(query)

    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return mounted ? matches : false
}

// Usage in layout
const isMobile = useMediaQuery('(max-width: 1023px)') // Below lg breakpoint
```

**Source:** [useHooks useMediaQuery](https://usehooks.com/usemediaquery), [Material UI useMediaQuery](https://mui.com/material-ui/react-use-media-query/)

**Key insight:** Returns `false` during SSR (before mounted), preventing hydration mismatches. The max-width of 1023px targets viewports below the 1024px lg breakpoint.

### Pattern 3: Active Route Detection with usePathname

**What:** Detect the current active route in Next.js App Router client components to highlight navigation items.

**When to use:** Navigation components that need to show active state for the current page.

**Example:**
```typescript
// components/layout/app-sidebar.tsx
'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/profiles', label: 'Profiles', icon: Mic2 },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <nav>
      {navItems.map((item) => {
        // Exact match for root routes, prefix match for nested routes
        const isActive = pathname === item.href ||
                        pathname.startsWith(item.href + '/')

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent"
            )}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
```

**Source:** [Next.js usePathname API](https://nextjs.org/docs/app/api-reference/functions/use-pathname), [Styling Active Links Guide](https://spacejelly.dev/posts/how-to-style-active-links-in-next-js-app-router)

**Key insight:** Use `startsWith()` for prefix matching to highlight parent routes when on nested pages (e.g., `/profiles` active when on `/profiles/[id]`).

### Pattern 4: Dynamic Breadcrumb Generation

**What:** Generate breadcrumbs automatically from the current URL path segments using Next.js App Router.

**When to use:** Nested pages that need hierarchical navigation context.

**Example:**
```typescript
// components/layout/page-header.tsx
'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export function DynamicBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  // Optional: Map segments to display names
  const segmentLabels: Record<string, string> = {
    profiles: 'Profiles',
    train: 'Training',
    settings: 'Settings',
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const href = '/' + segments.slice(0, index + 1).join('/')
          const isLast = index === segments.length - 1
          const label = segmentLabels[segment] || segment

          return (
            <div key={href} className="flex items-center gap-2">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
```

**Source:** [Building Dynamic Breadcrumbs in Next.js App Router](https://jeremykreutzbender.com/blog/app-router-dynamic-breadcrumbs), [shadcn Breadcrumb Docs](https://ui.shadcn.com/docs/components/breadcrumb)

**Key insight:** For dynamic segments like `/profiles/[id]`, you'll need to fetch the entity name (e.g., brand profile name) and pass it as a prop or use React Context to avoid additional fetches.

### Pattern 5: Sheet Component for Mobile Drawer

**What:** Use Radix Dialog-based Sheet component for mobile navigation drawer with proper accessibility.

**When to use:** Mobile responsive navigation that needs overlay, focus trapping, and smooth slide animations.

**Example:**
```typescript
// components/layout/mobile-nav.tsx
'use client'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export function MobileNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="w-5 h-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation menu</SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  )
}
```

**Source:** [shadcn Sheet Docs](https://ui.shadcn.com/docs/components/sheet), [Radix Dialog Primitives](https://www.radix-ui.com/primitives/docs/components/dialog)

**Key insight:** Sheet manages open state internally via controlled mode. Navigation links should NOT close the drawer automatically (per user requirements) — let users browse multiple pages.

### Pattern 6: Searchable Popover for Profile Selector

**What:** Implement searchable dropdown using Popover with filter input for brand profile selection.

**When to use:** Selection from potentially long lists where search/filter improves usability.

**Example:**
```typescript
// components/layout/profile-selector.tsx
'use client'
import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function ProfileSelector({
  profiles,
  activeId,
  onSelect
}: {
  profiles: Array<{ id: string; name: string }>
  activeId: string | null
  onSelect: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const activeProfile = profiles.find(p => p.id === activeId)
  const filtered = profiles.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="w-full justify-between">
          <span className="truncate">{activeProfile?.name || 'Select profile'}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Search profiles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="max-h-64 overflow-y-auto">
          {filtered.map((profile) => (
            <button
              key={profile.id}
              onClick={() => {
                onSelect(profile.id)
                setOpen(false)
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent",
                activeId === profile.id && "bg-accent"
              )}
            >
              <Check className={cn(
                "h-4 w-4",
                activeId === profile.id ? "opacity-100" : "opacity-0"
              )} />
              <span className="truncate">{profile.name}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

**Source:** [shadcn Combobox Pattern](https://ui.shadcn.com/docs/components/combobox), [Accessible Autocomplete Guide](https://react-spectrum.adobe.com/blog/building-a-combobox.html)

**Key insight:** For better accessibility, consider using Combobox component from shadcn instead of Popover + Input. Combobox provides proper ARIA attributes and keyboard navigation for autocomplete scenarios.

### Anti-Patterns to Avoid

- **Animating width/height directly:** Causes layout thrashing and poor performance. Use `transform: scaleX()` or `max-width` with `overflow: hidden` instead.
- **Reading localStorage in render:** Causes hydration mismatches in Next.js. Always use `useEffect` for browser-only APIs.
- **Auto-closing mobile drawer on navigation:** Breaks user expectation for browsing multiple pages. Let users explicitly close the drawer.
- **Nesting breadcrumbs inside PageHeader:** Breadcrumbs should appear above the PageHeader title, not inside it, to maintain proper visual hierarchy.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessible overlay/modal | Custom z-index stacking with focus management | Radix Dialog (via Sheet component) | Handles focus trap, Esc key, scroll locking, portal rendering, screen reader announcements, and keyboard navigation automatically |
| Media query detection | Custom window resize listeners with debouncing | window.matchMedia with event listeners | Native browser API is more efficient, fires only on actual breakpoint changes, not every pixel resize |
| Breadcrumb generation | Complex recursive route tree traversal | Simple path.split('/') with segment mapping | Next.js App Router uses flat file system; path segments directly map to routes |
| Popover positioning | Custom CSS absolute positioning with collision detection | Radix Popover primitive | Handles viewport boundaries, collision detection, scroll behavior, and arrow positioning automatically |

**Key insight:** Radix UI primitives handle edge cases like nested modals, focus restoration, screen reader announcements, and mobile viewport quirks that take weeks to implement correctly from scratch.

## Common Pitfalls

### Pitfall 1: localStorage Hydration Mismatch

**What goes wrong:** Reading `localStorage` during component render causes "Text content does not match server-rendered HTML" errors in Next.js.

**Why it happens:** Server-side rendering runs in Node.js where `window` and `localStorage` don't exist. The server renders one thing (default state), but the client immediately renders something different (loaded state).

**How to avoid:**
1. Use `useEffect` to read from localStorage after mount
2. Add a `mounted` flag to prevent flash of default state
3. Render a neutral loading state until mounted

**Warning signs:**
- Hydration error in browser console
- Flash of incorrect state before correct state appears
- "window is not defined" errors in server logs

**Source:** [Next.js Hydration Error Docs](https://nextjs.org/docs/messages/react-hydration-error), [LogRocket Hydration Guide](https://blog.logrocket.com/resolving-hydration-mismatch-errors-next-js/)

### Pitfall 2: Poor Animation Performance

**What goes wrong:** Sidebar collapse animation is janky or causes layout shift on other page elements.

**Why it happens:** Animating `width` property triggers layout recalculation (reflow) on every frame. Browser must recalculate positions of all following elements.

**How to avoid:**
1. Use `transform: translateX()` instead of width when possible
2. If width must change, use `max-width` with `transition` and `overflow: hidden`
3. Animate `opacity` for labels fading out (GPU-accelerated)
4. Use `transition-duration: 200ms` with `ease-in-out` easing
5. Apply `will-change: transform` only during active transition

**Warning signs:**
- Stuttery animation on slower devices
- Layout shift in main content area during collapse
- High CPU usage during animation

**Source:** [Sidebar Animation Performance](https://www.joshuawootonn.com/sidebar-animation-performance), [MDN CSS Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Transitions/Using)

### Pitfall 3: Inconsistent Active State Matching

**What goes wrong:** Navigation item shows as active on wrong pages, or doesn't show active on nested routes.

**Why it happens:** Using strict equality (`pathname === href`) fails for nested routes. For example, `/profiles/123` won't match `/profiles`.

**How to avoid:**
1. Use `pathname.startsWith(href + '/')` for parent routes with nested children
2. Add exact match for root paths: `pathname === href`
3. Combine both: `pathname === href || pathname.startsWith(href + '/')`
4. Order matters: check exact match first, then prefix

**Warning signs:**
- Multiple nav items highlighted simultaneously
- Parent route not highlighted when on child page
- Root route (/) highlighted on all pages

**Source:** [Next.js Active Links Guide](https://spacejelly.dev/posts/how-to-style-active-links-in-next-js-app-router)

### Pitfall 4: Missing Accessibility in Custom Components

**What goes wrong:** Screen readers can't navigate properly, keyboard users get trapped, or focus management breaks.

**Why it happens:** Custom drawer/modal implementations miss ARIA attributes, focus trapping, Esc key handling, or return focus to trigger.

**How to avoid:**
1. Always use Radix UI primitives for overlays (Dialog, Popover)
2. Include visually-hidden labels for icon-only buttons
3. Test with keyboard only (Tab, Esc, Enter)
4. Test with screen reader (VoiceOver on Mac, NVDA on Windows)
5. Ensure focus returns to trigger element on close

**Warning signs:**
- Can't close overlay with Esc key
- Tab moves focus outside open modal
- Screen reader doesn't announce modal opening
- Focus lost after closing overlay

**Source:** [Radix Accessibility Docs](https://www.radix-ui.com/primitives/docs/overview/accessibility), [WAI-ARIA Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

### Pitfall 5: Responsive Breakpoint Race Condition

**What goes wrong:** Sidebar and mobile drawer both render or neither renders during breakpoint transition.

**Why it happens:** useMediaQuery hook updates asynchronously while React is already rendering, causing intermediate states.

**How to avoid:**
1. Use conditional rendering with ternary: `isMobile ? <Drawer /> : <Sidebar />`
2. Apply `hidden` class instead of conditional render: `className={isMobile ? 'hidden' : ''}`
3. Add `mounted` flag from useMediaQuery to prevent SSR/client mismatch
4. Use Tailwind responsive utilities for pure CSS solution: `<div className="lg:block hidden">Sidebar</div>`

**Warning signs:**
- Both sidebar and drawer visible briefly during resize
- Layout jump when crossing breakpoint
- Hydration error related to conditional rendering

**Source:** [useMediaQuery Implementation](https://usehooks.com/usemediaquery), [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)

## Code Examples

### Example 1: Complete Collapsible Sidebar with Persistence

```typescript
// components/layout/app-sidebar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronLeft, ChevronRight, MessageSquare, Mic2, Settings } from 'lucide-react'
import { useSidebarState } from '@/hooks/use-sidebar-state'

const navItems = [
  { href: '/chat', icon: MessageSquare, label: 'Chat' },
  { href: '/profiles', icon: Mic2, label: 'Profiles' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { collapsed, setCollapsed, mounted } = useSidebarState()

  // Prevent flash of unstyled content during SSR
  if (!mounted) {
    return (
      <aside className="w-64 border-r bg-sidebar animate-pulse" />
    )
  }

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen border-r bg-sidebar transition-all duration-200 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Floating collapse toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-background shadow-md"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span
                    className={cn(
                      'transition-opacity duration-200',
                      collapsed ? 'opacity-0 w-0' : 'opacity-100'
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </aside>
  )
}
```

**Source:** Research synthesis from multiple patterns

### Example 2: Responsive Layout with Mobile Drawer

```typescript
// app/(dashboard)/layout.tsx
'use client'

import { useMediaQuery } from '@/hooks/use-media-query'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { MobileTopBar } from '@/components/layout/mobile-top-bar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width: 1023px)')

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <MobileTopBar />
        <main className="flex-1 overflow-y-auto">{children}</main>
        <MobileNav />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
```

**Source:** Research synthesis

### Example 3: PageContainer and PageHeader Components

```typescript
// components/layout/page-container.tsx
import { cn } from '@/lib/utils'

export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('w-full max-w-[1280px] mx-auto px-6 py-8', className)}>
      {children}
    </div>
  )
}

// components/layout/page-header.tsx
import { cn } from '@/lib/utils'
import { DynamicBreadcrumbs } from './dynamic-breadcrumbs'

export function PageHeader({
  title,
  actions,
  showBreadcrumbs = false,
  className,
}: {
  title: string
  actions?: React.ReactNode
  showBreadcrumbs?: boolean
  className?: string
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {showBreadcrumbs && <DynamicBreadcrumbs />}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

// Usage in page
export default function ProfilesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Brand Profiles"
        actions={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Profile
          </Button>
        }
      />

      {/* Page content */}
    </PageContainer>
  )
}
```

**Source:** Research synthesis from Material UI Container and React best practices

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS media queries in JS | window.matchMedia API | 2020+ | More efficient, fires only on breakpoint changes, not every resize event |
| useState for all state | localStorage with useEffect pattern | Next.js 13+ App Router | Prevents hydration mismatches in SSR environments |
| Custom modal implementations | Radix UI Dialog primitives | 2022+ | Accessibility-first, handles focus trapping, keyboard nav, screen readers automatically |
| Animating width/height | transform and opacity | Ongoing best practice | GPU-accelerated, avoids layout thrashing, 60fps animations |
| Redux for simple persistence | Direct localStorage with hooks | React 18+ | Lighter bundle, simpler code for single-value persistence |

**Deprecated/outdated:**
- **react-responsive library:** Replaced by custom useMediaQuery hooks with window.matchMedia (lighter, more flexible)
- **CSS transition on width property:** Replaced by transform or max-width transitions (better performance)
- **Class-based components for navigation:** Replaced by functional components with hooks (Next.js 14 App Router requires "use client" for hooks)

## Open Questions

1. **Dynamic segment handling in breadcrumbs**
   - What we know: Can parse `/profiles/[id]` from path segments
   - What's unclear: Should we fetch entity names (brand profile name) per breadcrumb, or pass via props/context?
   - Recommendation: Use React Context to provide entity names from page component to breadcrumbs, avoiding duplicate fetches

2. **Collapsed sidebar width preference**
   - What we know: User specified "typically 64-80px" range
   - What's unclear: Exact pixel value preference
   - Recommendation: Use 64px (w-16) for tighter layout, matches common icon button size (40px + 12px padding each side)

3. **Mobile drawer slide direction**
   - What we know: User left choice open between "left or bottom"
   - What's unclear: Which provides better UX for this specific app
   - Recommendation: Slide from left — consistent with desktop sidebar position, bottom drawers typically used for action sheets, not navigation

4. **Profile selector in collapsed state interaction**
   - What we know: Show first letter avatar, clickable to open popover
   - What's unclear: How to handle long profile lists in popover when sidebar is collapsed (limited space)
   - Recommendation: Popover should always open at full width (w-64) regardless of sidebar state, positioned to the right of collapsed sidebar

## Sources

### Primary (HIGH confidence)

- [Next.js 14 usePathname API Documentation](https://nextjs.org/docs/app/api-reference/functions/use-pathname) - Official Next.js API for route detection
- [Radix UI Dialog Primitives](https://www.radix-ui.com/primitives/docs/components/dialog) - Official Radix Dialog documentation (powers Sheet)
- [shadcn/ui Breadcrumb Component](https://ui.shadcn.com/docs/components/breadcrumb) - Official shadcn breadcrumb implementation guide
- [shadcn/ui Sheet Component](https://ui.shadcn.com/docs/components/sheet) - Official shadcn Sheet/drawer component docs
- [Next.js Hydration Error Documentation](https://nextjs.org/docs/messages/react-hydration-error) - Official guide to fixing hydration mismatches
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design) - Official Tailwind breakpoint documentation
- [MDN Using CSS Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Transitions/Using) - Authoritative CSS transition reference

### Secondary (MEDIUM confidence)

- [Building Dynamic Breadcrumbs in Next.js App Router](https://jeremykreutzbender.com/blog/app-router-dynamic-breadcrumbs) - Detailed implementation guide for App Router breadcrumbs
- [Sidebar Animation Performance Analysis](https://www.joshuawootonn.com/sidebar-animation-performance) - Performance comparison of different animation approaches
- [useMediaQuery Hook Implementation](https://usehooks.com/usemediaquery) - Standard pattern for responsive breakpoint detection
- [React Admin Sidebar Design Patterns](https://kitemetric.com/blogs/react-admin-sidebar-uselocation-collapsible-design) - Common patterns for admin sidebar navigation
- [Styling Active Links in Next.js App Router](https://spacejelly.dev/posts/how-to-style-active-links-in-next-js-app-router) - Active route detection patterns
- [LogRocket: Resolving Hydration Errors](https://blog.logrocket.com/resolving-hydration-mismatch-errors-next-js/) - Comprehensive guide to localStorage and hydration
- [Material UI useMediaQuery](https://mui.com/material-ui/react-use-media-query/) - Reference implementation of media query hook
- [React Spectrum Building a Combobox](https://react-spectrum.adobe.com/blog/building-a-combobox.html) - Accessible autocomplete pattern guide

### Tertiary (LOW confidence)

None — all key findings verified with official documentation or multiple authoritative sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed, official documentation reviewed
- Architecture: HIGH - Patterns verified against multiple implementations and official docs
- Pitfalls: HIGH - Common issues documented in official Next.js and Radix UI docs with clear solutions

**Research date:** 2026-02-18
**Valid until:** ~30 days (stable stack with mature libraries)
