"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/shared";
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
  { href: "/standards", icon: FileText, label: "Standards" },
  { href: "/objectives", icon: Target, label: "Objectives" },
  { href: "/definitions", icon: BookOpen, label: "Definitions" },
  { href: "/outputs", icon: Archive, label: "Output Library" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function AppSidebar({ workspace, profiles, activeProfileId, onProfileChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className={cn(
      "flex flex-col h-screen border-r border-sidebar-border bg-sidebar transition-all duration-200",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm font-semibold truncate text-sidebar-foreground">
              {workspace?.name || "Workspace"}
            </p>
          </div>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
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
                  {!collapsed && <span>{item.label}</span>}
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
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
