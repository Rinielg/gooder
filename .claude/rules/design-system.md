# Design System: Gooder shadcn/ui — Figma-to-Code Mapping Rules

> This file tells Claude Code exactly how to translate Figma designs from
> the Gooder-Shadcn-ui library into production React code using shadcn/ui.
> It replaces Code Connect for AI-assisted design-to-code workflows.

## Global conventions

- All component imports use the `@/components/ui/{kebab-case-name}` path
- All components use Tailwind CSS utility classes for styling
- Theming is driven by CSS custom properties defined in `globals.css`
- Figma variable names map directly to CSS variables (e.g., Figma `primary` → CSS `--primary` → Tailwind `bg-primary`)
- Figma "State" properties (Default, Hover, Focused, Pressed, Disabled) are CSS pseudo-states — never pass as props except `disabled`
- Figma "Dark Mode" is handled by the `.dark` class on `<html>` — never pass as a prop
- Use the `cn()` utility from `@/lib/utils` for conditional class merging
- All form components should be paired with `<Label>` for accessibility

## Token mapping: Figma variables → CSS variables → Tailwind classes

| Figma Variable | CSS Variable | Tailwind Class |
|---|---|---|
| background | --background | bg-background |
| foreground | --foreground | text-foreground |
| primary | --primary | bg-primary |
| primary-foreground | --primary-foreground | text-primary-foreground |
| secondary | --secondary | bg-secondary |
| secondary-foreground | --secondary-foreground | text-secondary-foreground |
| destructive | --destructive | bg-destructive |
| destructive-foreground | --destructive-foreground | text-destructive-foreground |
| muted | --muted | bg-muted |
| muted-foreground | --muted-foreground | text-muted-foreground |
| accent | --accent | bg-accent |
| accent-foreground | --accent-foreground | text-accent-foreground |
| card | --card | bg-card |
| card-foreground | --card-foreground | text-card-foreground |
| popover | --popover | bg-popover |
| popover-foreground | --popover-foreground | text-popover-foreground |
| border | --border | border-border |
| input | --input | border-input |
| ring | --ring | ring-ring |
| chart-1 to chart-5 | --chart-1 to --chart-5 | (custom) |
| radius | --radius | rounded-md (base) |

---

## Component mappings

### Accordion

```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
```

Figma → Code:
- Figma "type" → `type` prop: "single" | "multiple"
- Figma "collapsible" → `collapsible` prop (boolean, only for type="single")
- Always use composed pattern: AccordionItem wrapping AccordionTrigger + AccordionContent

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

Figma → Code:
- Figma "variant" → `variant` prop: "default" | "destructive"
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

Figma → Code:
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
```

Figma → Code:
- Figma image fill → `<AvatarImage src="..." alt="..." />`
- Figma fallback text → `<AvatarFallback>` children (typically initials)
- Figma size → className with w-{n} h-{n}

```tsx
<Avatar>
  <AvatarImage src="/avatar.jpg" alt="User" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
```

### Badge

```tsx
import { Badge } from "@/components/ui/badge"
```

Figma → Code:
- Figma "variant" → `variant` prop: "default" | "secondary" | "destructive" | "outline"
- Figma text → children

```tsx
<Badge variant="secondary">Badge</Badge>
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

Figma → Code:
- Figma "variant" → `variant` prop: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
- Figma "size" → `size` prop: "default" | "sm" | "lg" | "icon"
- Figma "Disabled" → `disabled` prop (boolean)
- Figma "Text Content" → children
- Figma icon instance → render icon as child, use `size="icon"` for icon-only buttons
- Figma "asChild" → `asChild` prop when wrapping a link

```tsx
<Button variant="destructive" size="lg">Delete Account</Button>
<Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
<Button asChild><Link href="/login">Login</Link></Button>
```

### Calendar

```tsx
import { Calendar } from "@/components/ui/calendar"
```

Figma → Code:
- Controlled via `selected` and `onSelect` props
- Figma "mode" → `mode` prop: "single" | "multiple" | "range"

```tsx
<Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
```

### Card

```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
```

Figma → Code:
- Figma "Title" → `<CardTitle>` children
- Figma "Description" → `<CardDescription>` children
- Figma content area → `<CardContent>` children
- Figma footer/actions → `<CardFooter>` children

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

Figma → Code:
- Figma "Checked" → `checked` prop (boolean)
- Figma "Disabled" → `disabled` prop
- Figma label text → separate `<Label>` component, linked by htmlFor/id
- Always pair with Label for accessibility

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

For a combobox pattern, wrap Command inside a Popover:

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

Figma → Code:
- Figma "Title" → `<DialogTitle>` children
- Figma "Description" → `<DialogDescription>` children
- Always use full composed pattern with trigger

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

### Input

```tsx
import { Input } from "@/components/ui/input"
```

Figma → Code:
- Figma "Placeholder" → `placeholder` prop
- Figma "Disabled" → `disabled` prop
- Figma "type" → `type` prop: "text" | "email" | "password" | "number" | "search" | "tel" | "url"
- Always pair with `<Label>` for accessibility

```tsx
<div className="grid w-full max-w-sm items-center gap-1.5">
  <Label htmlFor="email">Email</Label>
  <Input type="email" id="email" placeholder="Email" />
</div>
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination"
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

Figma → Code:
- Figma progress value → `value` prop (0-100)

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

Figma → Code:
- Figma "Placeholder" → `<SelectValue placeholder="..." />`
- Figma options → `<SelectItem value="...">` children

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

Figma → Code:
- Figma orientation → `orientation` prop: "horizontal" (default) | "vertical"

```tsx
<Separator />
<Separator orientation="vertical" />
```

### Sheet

```tsx
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
```

Figma → Code:
- Figma "side" → `side` prop on SheetContent: "top" | "right" | "bottom" | "left"

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

Always wrap in SidebarProvider at layout level:

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

Figma → Code:
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

### Switch

```tsx
import { Switch } from "@/components/ui/switch"
```

Figma → Code:
- Figma "Checked" → `checked` prop
- Figma "Disabled" → `disabled` prop
- Always pair with Label

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

Figma → Code:
- Figma "Placeholder" → `placeholder` prop
- Figma "Disabled" → `disabled` prop

```tsx
<div className="grid w-full gap-1.5">
  <Label htmlFor="message">Message</Label>
  <Textarea id="message" placeholder="Type your message..." />
</div>
```

### Toggle

```tsx
import { Toggle } from "@/components/ui/toggle"
```

Figma → Code:
- Figma "variant" → `variant` prop: "default" | "outline"
- Figma "size" → `size` prop: "default" | "sm" | "lg"
- Figma "pressed" → `pressed` / `defaultPressed` prop

```tsx
<Toggle variant="outline" aria-label="Toggle bold">
  <Bold className="h-4 w-4" />
</Toggle>
```

### Toggle Group

```tsx
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
```

Figma → Code:
- Figma "type" → `type` prop: "single" | "multiple"
- Figma "variant" → `variant` prop: "default" | "outline"

```tsx
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

## Obra kit extended components

These exist in the Figma kit but may not be in the standard shadcn/ui registry. If they exist in your codebase, use them. If not, compose them from base components.

### IconButton (Figma-only convenience)

Map to `<Button size="icon">` with an icon child:
```tsx
<Button size="icon" variant="outline"><Settings className="h-4 w-4" /></Button>
```

### LoadingButton (Figma-only convenience)

Map to `<Button disabled>` with a Loader icon:
```tsx
<Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Please wait</Button>
```

### RichRadio / RichCheckbox (Obra extension)

If no code component exists, compose from RadioGroup/Checkbox with Card styling:
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

## Design patterns to follow

### Form layout
Always use Label + control + description/error pattern:
```tsx
<div className="grid gap-2">
  <Label htmlFor="name">Name</Label>
  <Input id="name" placeholder="Enter name" />
  <p className="text-sm text-muted-foreground">Your display name.</p>
</div>
```

### Overlay components (Dialog, Sheet, Drawer, AlertDialog, Popover, Tooltip)
Always use Trigger + Content composed pattern. Never render content without a trigger unless using controlled open state.

### Lists and menus (DropdownMenu, ContextMenu, Menubar, Command)
Always wrap items in the Content/List container. Use Separator between groups. Use Label for group headings.

### Responsive patterns
- Use Sheet with `side="left"` for mobile navigation, Sidebar for desktop
- Use Drawer for mobile bottom sheets, Dialog for desktop modals
- Use `className="hidden md:block"` / `className="md:hidden"` for responsive component swapping

### Data display
- Use Table for structured tabular data
- Use Card for grouped content blocks  
- Use Separator to divide sections
- Use Skeleton for loading states matching the final layout shape

### Icons
The kit uses Lucide icons. Import from `lucide-react`:
```tsx
import { Home, Settings, ChevronRight, Search, Plus, Trash2, Edit, X } from "lucide-react"
```
Standard icon size inside components: `className="h-4 w-4"`
