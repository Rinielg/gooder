"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import {
  MessageSquare, Mic2, FileText, Target, BookOpen,
  Archive, Settings, LogOut, ChevronLeft, ChevronRight, Zap,
} from "lucide-react";
import type { BrandProfile, Workspace } from "@/types";

interface SidebarProps {
  workspace: Workspace | null;
  profiles: BrandProfile[];
  activeProfileId: string | null;
  onProfileChange: (id: string) => void;
}

const navItems = [
  { href: "/chat", icon: MessageSquare, label: "Chat" },
  { href: "/profiles", icon: Mic2, label: "Brand Profiles" },
  { href: "/standards", icon: FileText, label: "Standards & Rules" },
  { href: "/objectives", icon: Target, label: "Objectives" },
  { href: "/definitions", icon: BookOpen, label: "Definitions" },
  { href: "/outputs", icon: Archive, label: "Output Library" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function AppSidebar({ workspace, profiles, activeProfileId, onProfileChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { collapsed, setCollapsed, mounted } = useSidebarState();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  // Loading state placeholder to prevent layout shift
  if (!mounted) {
    return (
      <aside className="flex flex-col h-screen border-r border-sidebar-border bg-sidebar w-[256px] animate-pulse" />
    );
  }

  return (
    <aside className={cn(
      "relative flex flex-col h-screen border-r border-sidebar-border bg-sidebar transition-all duration-200 ease-in-out",
      collapsed ? "w-16" : "w-[256px]"
    )}>
      {/* Floating edge toggle handle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-background shadow-md"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      {/* Workspace header */}
      <div className="flex items-center gap-2 p-4 border-b border-sidebar-border min-w-0">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <p className={cn(
          "text-sm font-semibold truncate text-sidebar-foreground transition-opacity duration-200",
          collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
        )}>
          {workspace?.name || "Workspace"}
        </p>
      </div>

      {!collapsed && (
        <div className="p-3 border-b border-sidebar-border">
          <p className="text-xs font-medium text-muted-foreground mb-2 px-1">Active Profile</p>
          <select
            value={activeProfileId || ""}
            onChange={(e) => onProfileChange(e.target.value)}
            className="w-full text-sm bg-sidebar-accent text-sidebar-foreground rounded-md px-2 py-1.5 border border-sidebar-border focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">No profile selected</option>
            {profiles.filter((p) => p.status === "active" || p.status === "training").map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.completeness}%)</option>
            ))}
          </select>
        </div>
      )}

      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}>
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className={cn(
                    "transition-opacity duration-200",
                    collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                  )}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full transition-colors",
            "text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive"
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span className={cn(
            "transition-opacity duration-200",
            collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          )}>
            Sign out
          </span>
        </button>
      </div>
    </aside>
  );
}
