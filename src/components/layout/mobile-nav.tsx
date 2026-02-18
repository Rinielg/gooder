"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProfileSelector } from "@/components/layout/profile-selector";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  MessageSquare,
  Mic2,
  FileText,
  Target,
  BookOpen,
  Archive,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";
import type { BrandProfile, Workspace } from "@/types";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function MobileNav({
  open,
  onOpenChange,
  workspace,
  profiles,
  activeProfileId,
  onProfileChange,
}: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0 bg-sidebar">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation menu</SheetTitle>
        </SheetHeader>

        {/* Workspace header */}
        <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <p className="text-sm font-semibold truncate text-sidebar-foreground">
            {workspace?.name || "Workspace"}
          </p>
        </div>

        {/* Profile selector */}
        <div className="p-3 border-b border-sidebar-border">
          <ProfileSelector
            profiles={profiles}
            activeProfileId={activeProfileId}
            onProfileChange={onProfileChange}
            collapsed={false}
          />
        </div>

        {/* Navigation items */}
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Sign out button */}
        <div className="p-2 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full transition-colors",
              "text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive"
            )}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
