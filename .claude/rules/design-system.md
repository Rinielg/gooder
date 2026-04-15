# Design System — Gooder shadcn/ui Figma-to-Code Rules

> This file is the **single source of truth** for translating Figma designs from the
> Gooder-Shadcn-ui library into production React code in this repo. It replaces
> Figma Code Connect for AI-assisted design-to-code workflows.
>
> **Figma library:** [Gooder-Shadcn-ui](https://www.figma.com/design/KzW4GoFpnpPoz8nAvLJr9B/Gooder-Shadcn-ui) (file key: `KzW4GoFpnpPoz8nAvLJr9B`)
> **Code components:** `components/ui/` in this repo (owned here — edit freely)
> **Stack:** Next.js 14, shadcn/ui (new-york style), Tailwind 3.4, HSL CSS variables

---

## How to use this file

When mirroring a Figma design into code:

1. Identify the Figma component(s) used in the design.
2. Find the matching section below — each section lists the import, the Figma → code prop mapping, and a usage example.
3. Apply tokens from the [Token mapping](#token-mapping) and [Typography](#typography) tables.
4. For Figma components that don't have a 1:1 code equivalent (Icon Button, Loading Button, etc.), see [Composition patterns](#composition-patterns).
5. Check [Coverage gaps](#coverage-gaps) for known drift between Figma and code.

---

## Global conventions

- All component imports use the `@/components/ui/{kebab-case-name}` path
- All components use Tailwind CSS utility classes for styling
- Theming is driven by CSS custom properties defined in `app/globals.css`
- Figma variable names map directly to CSS variables (Figma `primary` → CSS `--primary` → Tailwind `bg-primary`)
- Figma "State" properties (Default, Hover, Focused, Pressed, Disabled) are CSS pseudo-states — never pass as props except `disabled`
- Figma "Dark Mode" is handled by the `.dark` class on `<html>` — never pass as a prop
- Use the `cn()` utility from `@/lib/utils` for conditional class merging
- All form components must be paired with `<Label>` for accessibility
- Icons are from `lucide-react`; standard size inside components is `className="h-4 w-4"`

---

## Token mapping

Figma Variables (not legacy color styles) map directly to CSS variables and Tailwind utilities. Colours support Light/Dark mode switching via the `.dark` class.

| Figma Variable | CSS Variable | Tailwind Class |
|---|---|---|
| background | `--background` | `bg-background` |
| foreground | `--foreground` | `text-foreground` |
| primary | `--primary` | `bg-primary` |
| primary-foreground | `--primary-foreground` | `text-primary-foreground` |
| secondary | `--secondary` | `bg-secondary` |
| secondary-foreground | `--secondary-foreground` | `text-secondary-foreground` |
| destructive | `--destructive` | `bg-destructive` |
| destructive-foreground | `--destructive-foreground` | `text-destructive-foreground` |
| muted | `--muted` | `bg-muted` |
| muted-foreground | `--muted-foreground` | `text-muted-foreground` |
| accent | `--accent` | `bg-accent` |
| accent-foreground | `--accent-foreground` | `text-accent-foreground` |
| card | `--card` | `bg-card` |
| card-foreground | `--card-foreground` | `text-card-foreground` |
| popover | `--popover` | `bg-popover` |
| popover-foreground | `--popover-foreground` | `text-popover-foreground` |
| border | `--border` | `border-border` |
| input | `--input` | `border-input` |
| ring | `--ring` | `ring-ring` |
| chart-1 … chart-5 | `--chart-1` … `--chart-5` | `fill-chart-1`, etc. |
| sidebar-* | `--sidebar-*` | `bg-sidebar`, etc. |
| surface / surface-foreground | `--surface` / `--surface-foreground` | `bg-surface` / `text-surface-foreground` |
| radius | `--radius` | `rounded-md` (base) |

> **Colour format:** This repo uses HSL format CSS variables (per current Tailwind 3 setup). The Figma library uses OKLCH internally — values are converted at the variable boundary. To extract exact values from Figma, use the Desktop Bridge plugin's `figma_get_variables`.

---

## Typography

The Figma library defines 18 text styles. Map them to Tailwind utilities as follows:

| Figma Text Style | Tailwind | Use Case |
|---|---|---|
| `heading 1` | `text-4xl font-bold` | Page titles |
| `heading 2` | `text-3xl font-semibold` | Section titles |
| `heading 3` | `text-2xl font-semibold` | Subsection titles |
| `heading 4` | `text-xl font-semibold` | Card titles, dialog titles |
| `paragraph large/regular` | `text-lg` | Lead paragraphs |
| `paragraph large/medium` | `text-lg font-medium` | Emphasised lead text |
| `paragraph large/bold` | `text-lg font-bold` | Strong lead text |
| `paragraph/regular` | `text-base` | Body text (default) |
| `paragraph/medium` | `text-base font-medium` | Emphasised body |
| `paragraph/bold` | `text-base font-bold` | Strong body |
| `paragraph small/regular` | `text-sm` | Secondary text, descriptions |
| `paragraph small/medium` | `text-sm font-medium` | Field labels |
| `paragraph small/bold` | `text-sm font-bold` | Strong small text |
| `paragraph mini/regular` | `text-xs` | Captions, helper text |
| `paragraph mini/medium` | `text-xs font-medium` | Badges, tags |
| `paragraph mini/bold` | `text-xs font-bold` | Strong captions |
| `monospaced` | `font-mono text-sm` | Code, technical content |
| `caption` | `text-xs text-muted-foreground` | Smallest text, field descriptions |

---

## Shadow / elevation

| Figma Effect Style | Tailwind Class |
|---|---|
| `shadow-2xs` | `shadow-2xs` |
| `shadow-xs` | `shadow-xs` |
| `shadow-sm` | `shadow-sm` |
| `shadow-md` | `shadow-md` |
| `shadow-lg` | `shadow-lg` |
| `shadow-xl` | `shadow-xl` |
| `shadow-2xl` | `shadow-2xl` |
| `focus ring` | `ring-ring` (via `focus-visible:ring-2`) |
| `focus ring error` | `ring-destructive` (via `aria-invalid:ring-destructive`) |
| `focus ring sidebar` | `ring-sidebar-ring` |

---

## Component mappings

Components are listed alphabetically. Each section gives the import, the Figma → code prop mapping (where non-trivial), and a usage example.

### Accordion

```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
```

Figma → Code:
- Figma "type" → `type` prop: `"single"` | `"multiple"`
- Figma "collapsible" → `collapsible` prop (boolean, only for `type="single"`)
- Always use composed pattern: `AccordionItem` wrapping `AccordionTrigger` + `AccordionContent`

```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Title</AccordionTrigger>
    <AccordionContent>Content here</AccordionContent>
  </AccordionItem>
</Accordion>
```

### Alert

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
```

| Figma Property | Figma Values | Code Prop | Code Values |
|---|---|---|---|
| Type | Neutral, Error | `variant` | `default`, `destructive` |
| Flip Icon | True, False | — | Icon placement via children order |

- Figma "Title" text → `<AlertTitle>` children
- Figma "Description" text → `<AlertDescription>` children
- Figma icon instance → render icon component as first child of `<Alert>`

```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Your session has expired.</AlertDescription>
</Alert>
```

### Alert Dialog

```tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
```

- Figma "Title" → `<AlertDialogTitle>` children
- Figma "Description" → `<AlertDialogDescription>` children
- Figma "Cancel Label" → `<AlertDialogCancel>` children
- Figma "Action Label" → `<AlertDialogAction>` children
- Always use full composed pattern

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="outline">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Avatar

```tsx
import { Avatar, AvatarFallback, AvatarImage, AvatarBadge, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
```

| Figma Property | Figma Values | Code Equivalent |
|---|---|---|
| Size | Tiny, Small, Regular, Large | `sm`, `default`, `lg` (Tiny → `sm` or extend) |
| Picture | On, Off | `<AvatarImage>` present or just `<AvatarFallback>` |
| Roundness Type | Round, Roundrect | Default round / `className="rounded-md"` |

> **Note:** Figma "Tiny" has no direct code match — maps to `sm` or extend with custom `xs`. Figma "Regular" = code `default`.

```tsx
<Avatar>
  <AvatarImage src="/avatar.jpg" alt="User" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
```

**Avatar Stack** in Figma → `AvatarGroup` in code:

```tsx
<AvatarGroup>
  <Avatar><AvatarImage src="/1.png" /><AvatarFallback>A</AvatarFallback></Avatar>
  <Avatar><AvatarImage src="/2.png" /><AvatarFallback>B</AvatarFallback></Avatar>
  <AvatarGroupCount>+3</AvatarGroupCount>
</AvatarGroup>
```

### Badge

```tsx
import { Badge } from "@/components/ui/badge"
```

| Figma Property | Figma Values | Code Prop | Code Values |
|---|---|---|---|
| Variant | Primary, Secondary, Destructive, Outline | `variant` | `default`, `secondary`, `destructive`, `outline`, `ghost`, `link` |
| Roundness | Default, Round | — | `className="rounded-full"` |
| State | Default, Focus | — | CSS pseudo-classes |

> Figma "Primary" = code `default`. Code has additional `ghost` and `link` variants not in Figma.

```tsx
<Badge variant="secondary">Badge</Badge>
<Badge className="rounded-full">Round badge</Badge>
```

### Breadcrumb

```tsx
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
```

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Current</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### Button

```tsx
import { Button } from "@/components/ui/button"
```

| Figma Property | Figma Values | Code Prop | Code Values |
|---|---|---|---|
| Variant | Primary, Secondary, Destructive, Ghost, Outline | `variant` | `default`, `secondary`, `destructive`, `ghost`, `outline`, `link` |
| Size | Mini, Small, Default, Large, Extra Large | `size` | `xs`, `sm`, `default`, `lg` (Extra Large has no direct equivalent) |
| Roundness | Default, Round | — | `className="rounded-full"` |
| State | Default, Hover, Focus, Disabled | — | CSS pseudo-classes + `disabled` prop |

> Figma "Primary" = code `default`. Figma "Mini" = code `xs`. Figma "Extra Large" has no direct code match — extend `buttonVariants` via CVA if needed.

```tsx
<Button variant="destructive" size="lg">Delete Account</Button>
<Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
<Button asChild><Link href="/login">Login</Link></Button>
```

### Button Group

```tsx
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group"
```

| Figma Property | Figma Values | Code |
|---|---|---|
| Skin | Outlined, Ghost | Children `Button` `variant="outline"` / `"ghost"` |
| Orientation | Horizontal, Vertical | `orientation` prop |
| Position | Left, Middle, Right, Single | Handled automatically by `ButtonGroup` CSS |

### Calendar

```tsx
import { Calendar } from "@/components/ui/calendar"
```

- Figma "mode" → `mode` prop: `"single"` | `"multiple"` | `"range"`
- Controlled via `selected` and `onSelect`

```tsx
<Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
```

### Card

```tsx
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
```

| Figma Property | Figma Values | Code Pattern |
|---|---|---|
| Slot No. | 1 Slot | `Card > CardContent` |
| Slot No. | 2 Slots | `Card > CardHeader + CardContent` |
| Slot No. | 3 Slots | `Card > CardHeader + CardContent + CardFooter` |

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent><p>Content</p></CardContent>
  <CardFooter><Button>Save</Button></CardFooter>
</Card>
```

### Carousel

```tsx
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
```

```tsx
<Carousel>
  <CarouselContent>
    <CarouselItem>Slide 1</CarouselItem>
    <CarouselItem>Slide 2</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
```

### Checkbox

```tsx
import { Checkbox } from "@/components/ui/checkbox"
```

| Figma Property | Figma Values | Code |
|---|---|---|
| Checked? | True, False, Indeterminate | `checked` prop (`true` / `false` / `"indeterminate"`) |
| State | Default, Focus, Error, Disabled | `aria-invalid`, `disabled`, CSS pseudo-classes |

- Always pair with `<Label>` for accessibility.

```tsx
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>
```

### Collapsible

```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
```

```tsx
<Collapsible>
  <CollapsibleTrigger asChild><Button variant="ghost">Toggle</Button></CollapsibleTrigger>
  <CollapsibleContent>Hidden content</CollapsibleContent>
</Collapsible>
```

### Command (Combobox)

```tsx
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
```

For a combobox pattern, wrap `Command` inside a `Popover`:

```tsx
<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger asChild>
    <Button variant="outline" role="combobox" aria-expanded={open}>
      {value || "Select..."}
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <Command>
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup>
          <CommandItem onSelect={handleSelect}>Option 1</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>
```

### Context Menu

```tsx
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu"
```

```tsx
<ContextMenu>
  <ContextMenuTrigger>Right click me</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Edit</ContextMenuItem>
    <ContextMenuItem>Delete</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

### Dialog

```tsx
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
```

| Figma Property | Figma Values | Code Pattern |
|---|---|---|
| Type | Desktop | `DialogContent` (default) |
| Type | Mobile | `DialogContent className="sm:max-w-full h-full"` or use `Drawer` |
| Type | Desktop Scrollable | `DialogContent` with scrollable inner area |
| Type | Mobile Full Screen Scrollable | Use `Drawer` or full-screen `Sheet` |

```tsx
<Dialog>
  <DialogTrigger asChild><Button variant="outline">Edit</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>Make changes to your profile.</DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <Input placeholder="Name" />
    </div>
    <DialogFooter>
      <Button type="submit">Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Drawer

```tsx
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
```

Same composed pattern as Dialog. Drawer slides from bottom on mobile.

```tsx
<Drawer>
  <DrawerTrigger asChild><Button>Open</Button></DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Title</DrawerTitle>
      <DrawerDescription>Description</DrawerDescription>
    </DrawerHeader>
    <div className="p-4">Content</div>
    <DrawerFooter>
      <Button>Submit</Button>
      <DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

### Dropdown Menu

```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
```

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild><Button variant="outline">Menu</Button></DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Log out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Empty

```tsx
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
```

| Figma Variant | Code |
|---|---|
| Default | `Empty` (default border) |
| Outline | `Empty className="border-solid"` |
| Outline dashed | `Empty` (default — uses `border-dashed`) |
| Background | `Empty className="bg-muted border-none"` |

### Field

```tsx
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle } from "@/components/ui/field"
```

Use `Field` to compose form controls with labels, descriptions, and error states.

### Hover Card

```tsx
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
```

### Input

```tsx
import { Input } from "@/components/ui/input"
```

| Figma Property | Figma Values | Code |
|---|---|---|
| Size | Regular, Large | Default `Input` / `Input className="h-12 text-base"` |
| Roundness | Default, Round | Default / `className="rounded-full"` |
| State | Empty, Placeholder, Value, Focus, Disabled, Error, Error Focus | Controlled via `placeholder`, `value`, `disabled`, `aria-invalid` props + CSS |
| Type | text, email, password, etc. | `type` prop |

- Always pair with `<Label>` for accessibility.

```tsx
<div className="grid w-full max-w-sm items-center gap-1.5">
  <Label htmlFor="email">Email</Label>
  <Input type="email" id="email" placeholder="Email" />
</div>
```

**Input File** (Figma has 64-variant component set) — use `<Input type="file" />`. The `input.tsx` component includes built-in file input styling (`file:` variant utilities).

### Input Group

```tsx
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group"
```

### Input OTP

```tsx
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
```

```tsx
<InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>
```

### Item

```tsx
import { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemHeader, ItemMedia, ItemSeparator, ItemTitle } from "@/components/ui/item"
```

### Kbd

```tsx
import { Kbd, KbdGroup } from "@/components/ui/kbd"
```

**Kbd Combo** in Figma → `KbdGroup` in code:

```tsx
<KbdGroup>
  <Kbd>Ctrl</Kbd>
  <Kbd>S</Kbd>
</KbdGroup>
```

### Label

```tsx
import { Label } from "@/components/ui/label"
```

```tsx
<Label htmlFor="name">Name</Label>
```

### Menubar

```tsx
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "@/components/ui/menubar"
```

```tsx
<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New</MenubarItem>
      <MenubarItem>Open</MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Exit</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

### Navigation Menu

```tsx
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
```

```tsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="/docs">Documentation</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

### Pagination

```tsx
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
```

```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
    <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
    <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>
    <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
    <PaginationItem><PaginationEllipsis /></PaginationItem>
    <PaginationItem><PaginationNext href="#" /></PaginationItem>
  </PaginationContent>
</Pagination>
```

### Popover

```tsx
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
```

```tsx
<Popover>
  <PopoverTrigger asChild><Button variant="outline">Open</Button></PopoverTrigger>
  <PopoverContent className="w-80">
    <div className="grid gap-4">
      <h4 className="font-medium leading-none">Dimensions</h4>
      <p className="text-sm text-muted-foreground">Set the dimensions.</p>
    </div>
  </PopoverContent>
</Popover>
```

### Progress

```tsx
import { Progress } from "@/components/ui/progress"
```

- Figma progress value → `value` prop (0–100)

```tsx
<Progress value={60} />
```

### Radio Group

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
```

```tsx
<RadioGroup defaultValue="option-1">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-1" id="r1" />
    <Label htmlFor="r1">Option 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-2" id="r2" />
    <Label htmlFor="r2">Option 2</Label>
  </div>
</RadioGroup>
```

### Resizable

```tsx
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
```

### Scroll Area

```tsx
import { ScrollArea } from "@/components/ui/scroll-area"
```

```tsx
<ScrollArea className="h-72 w-48 rounded-md border">
  <div className="p-4">{/* Long content */}</div>
</ScrollArea>
```

### Select

```tsx
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
```

| Figma Property | Figma Values | Code |
|---|---|---|
| Size | Mini, Small, Default, Large | Size via className or extend `selectVariants` |
| Lines | 1 Line, 2 Lines | Single-line default / two-line via custom content |

```tsx
<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Options</SelectLabel>
      <SelectItem value="a">Option A</SelectItem>
      <SelectItem value="b">Option B</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

### Separator

```tsx
import { Separator } from "@/components/ui/separator"
```

| Figma Property | Figma Values | Code |
|---|---|---|
| Direction | Default, Vertical | `orientation="horizontal"` (default) / `"vertical"` |
| Spacing | None, Regular, Spacious | `className` with margin utilities |

```tsx
<Separator />
<Separator orientation="vertical" />
```

### Sheet

```tsx
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
```

- Figma "side" → `side` prop on `SheetContent`: `"top"` | `"right"` | `"bottom"` | `"left"`

```tsx
<Sheet>
  <SheetTrigger asChild><Button variant="outline">Open</Button></SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Edit profile</SheetTitle>
      <SheetDescription>Make changes here.</SheetDescription>
    </SheetHeader>
    <div className="grid gap-4 py-4">
      <Input placeholder="Name" />
    </div>
  </SheetContent>
</Sheet>
```

### Sidebar

```tsx
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
```

Always wrap in `SidebarProvider` at layout level:

```tsx
<SidebarProvider>
  <Sidebar>
    <SidebarHeader />
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Menu</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/"><Home className="h-4 w-4" /><span>Home</span></a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter />
  </Sidebar>
  <main><SidebarTrigger />{children}</main>
</SidebarProvider>
```

### Skeleton

```tsx
import { Skeleton } from "@/components/ui/skeleton"
```

```tsx
<div className="flex items-center space-x-4">
  <Skeleton className="h-12 w-12 rounded-full" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
  </div>
</div>
```

### Slider

```tsx
import { Slider } from "@/components/ui/slider"
```

- Figma value → `defaultValue` prop (array)
- Figma "max" → `max` prop
- Figma "step" → `step` prop

```tsx
<Slider defaultValue={[50]} max={100} step={1} />
```

### Sonner (Toast)

```tsx
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
```

Add `<Toaster />` to your root layout. Trigger toasts via the `toast()` function:

```tsx
toast("Event created")
toast.success("Success!")
toast.error("Something went wrong")
toast("Event created", { description: "Monday, January 3rd at 6:00pm" })
```

### Spinner

```tsx
import { Spinner } from "@/components/ui/spinner"
```

| Figma "Type" | Code |
|---|---|
| Default | `<Spinner />` |
| Mirrored | `<Spinner className="scale-x-[-1]" />` |

### Switch

```tsx
import { Switch } from "@/components/ui/switch"
```

- Figma "Checked" → `checked` prop
- Figma "Disabled" → `disabled` prop
- Always pair with `<Label>`

```tsx
<div className="flex items-center space-x-2">
  <Switch id="airplane-mode" />
  <Label htmlFor="airplane-mode">Airplane Mode</Label>
</div>
```

### Table

```tsx
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
```

```tsx
<Table>
  <TableCaption>A list of invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>INV001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell className="text-right">$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Tabs

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
```

| Figma Property | Figma Values | Code |
|---|---|---|
| Size | Small, Regular, Large | Size via className on `TabsList` |
| Content | Label, Icon, Icon + Label | `TabsTrigger` children |
| Parts | 2, 3, 4 | Number of `TabsTrigger` components |

```tsx
<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account settings here.</TabsContent>
  <TabsContent value="password">Password settings here.</TabsContent>
</Tabs>
```

### Textarea

```tsx
import { Textarea } from "@/components/ui/textarea"
```

- Figma "Placeholder" → `placeholder` prop
- Figma "Disabled" → `disabled` prop

```tsx
<div className="grid w-full gap-1.5">
  <Label htmlFor="message">Message</Label>
  <Textarea id="message" placeholder="Type your message..." />
</div>
```

### Toggle / Toggle Group

```tsx
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
```

| Figma Property | Figma Values | Code |
|---|---|---|
| Skin | Outlined, Ghost | `variant="outline"` / `"default"` (ghost) |
| Active? | Yes, No | `pressed` / `aria-pressed` boolean |
| Position | Left, Middle, Right, Single | Handled by `ToggleGroup` automatically |

```tsx
<Toggle variant="outline" aria-label="Toggle bold">
  <Bold className="h-4 w-4" />
</Toggle>

<ToggleGroup type="single">
  <ToggleGroupItem value="a">A</ToggleGroupItem>
  <ToggleGroupItem value="b">B</ToggleGroupItem>
  <ToggleGroupItem value="c">C</ToggleGroupItem>
</ToggleGroup>
```

### Tooltip

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
```

Wrap your app or layout in `<TooltipProvider>`, then:

```tsx
<Tooltip>
  <TooltipTrigger asChild><Button variant="outline">Hover me</Button></TooltipTrigger>
  <TooltipContent><p>Tooltip text</p></TooltipContent>
</Tooltip>
```

---

## Composition patterns

These Figma components exist as **standalone component sets** for design clarity, but in code they compose from base primitives. There is no separate code component to import.

### Icon Button (Figma) → `Button size="icon"` (Code)

Figma has a 160-variant Icon Button set. In code, use `Button` with icon size variants:

```tsx
// Figma: Icon Button / Primary / Default
<Button size="icon" variant="default"><PlusIcon /></Button>

// Figma: Icon Button / Ghost / Small / Round
<Button size="icon-sm" variant="ghost" className="rounded-full"><SettingsIcon /></Button>
```

| Figma Icon Button Size | Code `size` prop |
|---|---|
| Small | `icon-sm` |
| Default | `icon` |
| Large | `icon-lg` |

### Link Button (Figma) → `Button variant="link"` (Code)

Figma has a 24-variant Link Button set:

```tsx
<Button variant="link">Learn more</Button>
<Button variant="link" size="xs">Learn more</Button>
```

### Loading Button (Figma) → `Button` + `Spinner` (Code)

Figma has a 24-variant Loading Button set:

```tsx
<Button disabled>
  <Spinner data-icon="inline-start" />
  Saving...
</Button>

<Button disabled size="lg" className="rounded-full">
  <Spinner data-icon="inline-start" />
  Processing...
</Button>
```

### Button Group Icon Button (Figma) → `ButtonGroup` + `Button size="icon-sm"` (Code)

96-variant Figma set. In code:

```tsx
<ButtonGroup>
  <Button size="icon-sm" variant="outline"><BoldIcon /></Button>
  <Button size="icon-sm" variant="outline"><ItalicIcon /></Button>
  <Button size="icon-sm" variant="outline"><UnderlineIcon /></Button>
</ButtonGroup>
```

### Toggle Icon Button (Figma) → `ToggleGroupItem` with icon (Code)

384-variant Figma set:

```tsx
<ToggleGroup type="multiple">
  <ToggleGroupItem value="bold"><BoldIcon /></ToggleGroupItem>
  <ToggleGroupItem value="italic"><ItalicIcon /></ToggleGroupItem>
</ToggleGroup>
```

### Accordion Trigger Bordered (Figma) → `AccordionTrigger` with border styling (Code)

12-variant Figma set with Position: First / Middle / Last / Single. Apply border styling via `className` or a wrapper component.

### RichRadio / RichCheckbox (Obra extension)

If no code component exists, compose from `RadioGroup` / `Checkbox` with `Card` styling:

```tsx
<RadioGroup>
  <Label htmlFor="r1" className="cursor-pointer">
    <Card className="p-4 [&:has(:checked)]:border-primary">
      <RadioGroupItem value="option" id="r1" className="sr-only" />
      <div>Rich radio content</div>
    </Card>
  </Label>
</RadioGroup>
```

---

## Coverage gaps

### In Figma but NOT a separate code file (intentional — composed from primitives)

| Figma Component | Code Equivalent |
|---|---|
| Icon Button (160 variants) | `Button size="icon"` / `"icon-sm"` / `"icon-lg"` |
| Link Button (24 variants) | `Button variant="link"` |
| Loading Button (24 variants) | `Button` + `Spinner` composition |
| Button Group Icon Button (96 variants) | `ButtonGroup` > `Button size="icon-sm"` |
| Toggle Icon Button (384 variants) | `ToggleGroup` > `ToggleGroupItem` with icon child |
| Accordion Trigger Bordered (12 variants) | `AccordionTrigger` with border className |
| Input File (64 variants) | `Input type="file"` |

### In code but NOT in Figma

| Code File | Notes |
|---|---|
| `collapsible.tsx` | Utility component — may not need a Figma representation |
| `context-menu.tsx` | Right-click menu — hard to represent statically in Figma |
| `dropdown-menu.tsx` | Could be added to Figma |
| `form.tsx` | React Hook Form integration — code-only concern |
| `menubar.tsx` | Could be added to Figma |
| `native-select.tsx` | Browser-native select — intentionally not designed in Figma |
| `direction.tsx` | RTL/LTR utility — code-only concern |

### Figma variant values with no exact code match

| Component | Figma Value | Code Gap |
|---|---|---|
| Button size | Extra Large | No `xl` size — extend via CVA if needed |
| Avatar size | Tiny | No `xs` size — extend or use `sm` |
| Input roundness | Round | Apply `className="rounded-full"` |
| Badge roundness | Round | Apply `className="rounded-full"` |
| Button roundness | Round | Apply `className="rounded-full"` |

> **Recommendation:** If round variants are used frequently, add a `roundness` CVA variant to `Button`, `Badge`, and `Input`. This reduces className repetition and makes Figma → code mapping more direct.

---

## Design patterns

### Form layout

Always use Label + control + description/error pattern:

```tsx
<div className="grid gap-2">
  <Label htmlFor="name">Name</Label>
  <Input id="name" placeholder="Enter name" />
  <p className="text-sm text-muted-foreground">Your display name.</p>
</div>
```

### Overlay components

Dialog, Sheet, Drawer, AlertDialog, Popover, Tooltip — always use Trigger + Content composed pattern. Never render content without a trigger unless using controlled open state.

### Lists and menus

DropdownMenu, ContextMenu, Menubar, Command — always wrap items in the Content/List container. Use Separator between groups. Use Label for group headings.

### Responsive patterns

- Use `Sheet` with `side="left"` for mobile navigation, `Sidebar` for desktop
- Use `Drawer` for mobile bottom sheets, `Dialog` for desktop modals
- Use `className="hidden md:block"` / `className="md:hidden"` for responsive component swapping

### Data display

- Use `Table` for structured tabular data
- Use `Card` for grouped content blocks
- Use `Separator` to divide sections
- Use `Skeleton` for loading states matching the final layout shape

### Icons

Use `lucide-react`. Import by name:

```tsx
import { Home, Settings, ChevronRight, Search, Plus, Trash2, Edit, X } from "lucide-react"
```

Standard icon size inside components: `className="h-4 w-4"`.

---

## Component export reference

Quick lookup of all exports per code file, for translating Figma compositions to code imports.

| Code File | Exports |
|---|---|
| `accordion.tsx` | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` |
| `alert.tsx` | `Alert`, `AlertTitle`, `AlertDescription` |
| `alert-dialog.tsx` | `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel` |
| `avatar.tsx` | `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarBadge`, `AvatarGroup`, `AvatarGroupCount` |
| `badge.tsx` | `Badge`, `badgeVariants` |
| `breadcrumb.tsx` | `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis` |
| `button.tsx` | `Button`, `buttonVariants` |
| `button-group.tsx` | `ButtonGroup`, `ButtonGroupSeparator`, `ButtonGroupText`, `buttonGroupVariants` |
| `card.tsx` | `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardAction`, `CardDescription`, `CardContent` |
| `dialog.tsx` | `Dialog`, `DialogClose`, `DialogContent`, `DialogDescription`, `DialogFooter`, `DialogHeader`, `DialogOverlay`, `DialogPortal`, `DialogTitle`, `DialogTrigger` |
| `empty.tsx` | `Empty`, `EmptyHeader`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`, `EmptyMedia` |
| `field.tsx` | `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldLegend`, `FieldSeparator`, `FieldSet`, `FieldContent`, `FieldTitle` |
| `input.tsx` | `Input` |
| `input-group.tsx` | `InputGroup`, `InputGroupAddon`, `InputGroupButton`, `InputGroupText`, `InputGroupInput`, `InputGroupTextarea` |
| `item.tsx` | `Item`, `ItemMedia`, `ItemContent`, `ItemActions`, `ItemGroup`, `ItemSeparator`, `ItemTitle`, `ItemDescription`, `ItemHeader`, `ItemFooter` |
| `kbd.tsx` | `Kbd`, `KbdGroup` |
| `spinner.tsx` | `Spinner` |
