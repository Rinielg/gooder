"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileTopBar } from "@/components/layout/mobile-top-bar";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { BrandProfile, Workspace } from "@/types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [profiles, setProfiles] = useState<BrandProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const supabase = createClient();
  const isMobile = useMediaQuery("(max-width: 1023px)");

  function handleProfileChange(id: string) {
    const profileId = id || null;
    setActiveProfileId(profileId);
    // Store in localStorage for persistence across page navigations
    if (profileId) {
      localStorage.setItem("bvp_active_profile", profileId);
    } else {
      localStorage.removeItem("bvp_active_profile");
    }
    // Notify child pages (e.g., chat) that the profile changed
    window.dispatchEvent(
      new CustomEvent("bvp-profile-change", { detail: { profileId } })
    );
  }

  const loadWorkspaceData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get workspace via membership
      const { data: membership } = await supabase
        .from("workspace_members")
        .select("workspace_id, role, workspaces(*)")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (membership?.workspaces) {
        const ws = membership.workspaces as unknown as Workspace;
        setWorkspace(ws);

        // Load profiles
        const { data: profileData } = await supabase
          .from("brand_profiles")
          .select("*")
          .eq("workspace_id", ws.id)
          .order("created_at", { ascending: false });

        if (profileData) {
          setProfiles(profileData as BrandProfile[]);

          // Restore from localStorage, or auto-select first active profile
          const stored = localStorage.getItem("bvp_active_profile");
          const storedProfile = stored && profileData.find((p: any) => p.id === stored);
          const firstActive = profileData.find((p: any) => p.status === "active" || p.status === "training");

          if (storedProfile) {
            handleProfileChange(stored);
          } else if (firstActive) {
            handleProfileChange(firstActive.id);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load workspace data:", err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Unified layout — single JSX tree keeps {children} stable across breakpoint changes.
  // Splitting into two separate returns would unmount/remount children on resize, resetting all page state.
  return (
    <div className={`h-screen bg-background overflow-hidden ${isMobile ? "flex flex-col" : "flex"}`}>
      {isMobile ? (
        <>
          <MobileTopBar onMenuClick={() => setMobileNavOpen(true)} />
          <MobileNav
            open={mobileNavOpen}
            onOpenChange={setMobileNavOpen}
            workspace={workspace}
            profiles={profiles}
            activeProfileId={activeProfileId}
            onProfileChange={handleProfileChange}
          />
        </>
      ) : (
        <AppSidebar
          workspace={workspace}
          profiles={profiles}
          activeProfileId={activeProfileId}
          onProfileChange={handleProfileChange}
        />
      )}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
