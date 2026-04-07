import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import {
  Home,
  Settings,
  Users,
  FileText,
  BarChart3,
  HelpCircle,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "./sidebar"

const menuItems = [
  { title: "Home", icon: Home, href: "/" },
  { title: "Users", icon: Users, href: "/users" },
  { title: "Documents", icon: FileText, href: "/documents" },
  { title: "Analytics", icon: BarChart3, href: "/analytics" },
  { title: "Settings", icon: Settings, href: "/settings" },
]

const meta: Meta = {
  title: "UI/Sidebar",
  tags: ['autodocs'],
  parameters: {
    layout: "fullscreen",
  },
}

export default meta

type Story = StoryObj

export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              G
            </div>
            <span className="font-semibold">Gooder</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/help">
                  <HelpCircle className="h-4 w-4" />
                  <span>Help</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <main className="flex flex-1 flex-col p-4">
        <SidebarTrigger />
        <div className="mt-4">
          <h1 className="text-2xl font-bold">Main Content</h1>
          <p className="mt-2 text-muted-foreground">
            This area represents the main content of the page. Use the trigger
            button to toggle the sidebar.
          </p>
        </div>
      </main>
    </SidebarProvider>
  ),
}

export const WithActiveItem: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              G
            </div>
            <span className="font-semibold">Gooder</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.title === "Analytics"}>
                      <a href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/help">
                  <HelpCircle className="h-4 w-4" />
                  <span>Help</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <main className="flex flex-1 flex-col p-4">
        <SidebarTrigger />
        <div className="mt-4">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="mt-2 text-muted-foreground">
            The Analytics menu item is highlighted as active.
          </p>
        </div>
      </main>
    </SidebarProvider>
  ),
}

export const MultipleGroups: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              G
            </div>
            <span className="font-semibold">Gooder</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive>
                    <a href="/">
                      <Home className="h-4 w-4" />
                      <span>Home</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/analytics">
                      <BarChart3 className="h-4 w-4" />
                      <span>Analytics</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/users">
                      <Users className="h-4 w-4" />
                      <span>Users</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/documents">
                      <FileText className="h-4 w-4" />
                      <span>Documents</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/settings">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/help">
                  <HelpCircle className="h-4 w-4" />
                  <span>Help</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <main className="flex flex-1 flex-col p-4">
        <SidebarTrigger />
        <div className="mt-4">
          <h1 className="text-2xl font-bold">Multiple Groups</h1>
          <p className="mt-2 text-muted-foreground">
            Sidebar with items organized into multiple labeled groups.
          </p>
        </div>
      </main>
    </SidebarProvider>
  ),
}
