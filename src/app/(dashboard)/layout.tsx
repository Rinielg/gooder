"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppSidebar } from "@/components/layout/app-sidebar";
import type { BrandProfile, Workspace } from "@/types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [profiles, setProfiles] = useState<BrandProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

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
          // Auto-select first active profile
          const active = profileData.find((p: any) => p.status === "active");
          if (active && !activeProfileId) {
            setActiveProfileId(active.id);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load workspace data:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase, activeProfileId]);

  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData]);

  function handleProfileChange(id: string) {
    setActiveProfileId(id || null);
    // Store in localStorage for persistence across page navigations
    if (id) {
      localStorage.setItem("bvp_active_profile", id);
    } else {
      localStorage.removeItem("bvp_active_profile");
    }
    // Notify child pages (e.g., chat) that the profile changed
    window.dispatchEvent(
      new CustomEvent("bvp-profile-change", { detail: { profileId: id || null } })
    );
  }

  // Restore active profile from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("bvp_active_profile");
    if (stored && !activeProfileId) {
      setActiveProfileId(stored);
    }
  }, [activeProfileId]);

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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar
        workspace={workspace}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onProfileChange={handleProfileChange}
      />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
