"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Mic2, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { BrandProfile, ProfileStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusColors: Record<ProfileStatus, string> = {
  draft: "outline",
  training: "warning",
  active: "success",
  archived: "secondary",
};

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<BrandProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const supabase = createClient();

  const loadProfiles = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!membership) return;

    const { data } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("workspace_id", membership.workspace_id)
      .order("created_at", { ascending: false });

    setProfiles((data || []) as BrandProfile[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  async function createProfile() {
    if (!newName.trim()) return;
    setCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: membership } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (!membership) return;

      // Check limit
      if (profiles.length >= 4) {
        toast.error("Maximum 4 profiles per workspace in MVP");
        return;
      }

      const { error } = await supabase.from("brand_profiles").insert({
        workspace_id: membership.workspace_id,
        name: newName.trim(),
        status: "draft",
        completeness: 0,
        profile_data: {},
        active_modules: [],
        training_sources: [],
        created_by: user.id,
      });

      if (error) throw error;

      toast.success("Profile created");
      setNewName("");
      setShowCreate(false);
      loadProfiles();
    } catch {
      toast.error("Failed to create profile");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Brand Profiles</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your brand voice profiles ({profiles.length}/4)
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} disabled={profiles.length >= 4}>
          <Plus className="w-4 h-4 mr-2" />
          New Profile
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="profileName">Profile name</Label>
                <Input
                  id="profileName"
                  placeholder="e.g., My Brand Voice"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createProfile()}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={createProfile} disabled={creating || !newName.trim()}>
                  {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create
                </Button>
                <Button variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {profiles.map((profile) => (
          <Link key={profile.id} href={`/profiles/${profile.id}`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mic2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{profile.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={statusColors[profile.status] as any}>
                        {profile.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {profile.completeness}% complete
                      </span>
                      {profile.active_modules?.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {profile.active_modules.length} modules
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}

        {profiles.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Mic2 className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-1">No brand profiles yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first brand voice profile to start generating on-brand content.
              </p>
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create your first profile
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
