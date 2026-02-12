"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Separator } from "@/components/ui/shared";
import { ArrowLeft, GraduationCap, Loader2, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { BrandProfile } from "@/types";
import { cn } from "@/lib/utils";

export default function ProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadProfile = useCallback(async () => {
    const { data } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("id", params.id)
      .single();

    setProfile(data as BrandProfile | null);
    setLoading(false);
  }, [supabase, params.id]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  async function activateProfile() {
    if (!profile) return;
    const { error } = await supabase
      .from("brand_profiles")
      .update({ status: "active" })
      .eq("id", profile.id);

    if (error) {
      toast.error("Failed to activate profile");
      return;
    }

    toast.success("Profile activated");
    loadProfile();
  }

  async function deleteProfile() {
    if (!profile) return;
    if (!confirm("Delete this profile? This cannot be undone.")) return;

    const { error } = await supabase
      .from("brand_profiles")
      .delete()
      .eq("id", profile.id);

    if (error) {
      toast.error("Failed to delete profile");
      return;
    }

    toast.success("Profile deleted");
    router.push("/profiles");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  const pd = profile.profile_data;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/profiles")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={profile.status === "active" ? "success" : "outline"}>
                {profile.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {profile.completeness}% complete
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {profile.status !== "active" && profile.completeness >= 80 && (
            <Button onClick={activateProfile}>
              <Play className="w-4 h-4 mr-2" />
              Activate
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push(`/profiles/${profile.id}/train`)}>
            <GraduationCap className="w-4 h-4 mr-2" />
            Train Profile
          </Button>
          <Button variant="outline" onClick={() => {
            localStorage.setItem("bvp_active_profile", profile.id);
            router.push("/chat");
            toast.success("Profile selected — start chatting");
          }}>
            Use in Chat
          </Button>
          <Button variant="destructive" size="icon" onClick={deleteProfile}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Voice Pillars */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Voice Pillars</CardTitle>
          <CardDescription>The permanent personality traits of this brand voice</CardDescription>
        </CardHeader>
        <CardContent>
          {pd?.voice_identity?.pillars?.length ? (
            <div className="space-y-4">
              {pd.voice_identity.pillars.map((pillar, i) => (
                <div key={i} className="p-4 rounded-lg border border-border">
                  <h4 className="font-medium text-primary mb-2">{pillar.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{pillar.meaning}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground block mb-1">Sounds like</span>
                      <p className="text-green-600 dark:text-green-400">{pillar.sounds_like}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground block mb-1">Never sounds like</span>
                      <p className="text-destructive">{pillar.anti_pattern}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No voice pillars defined yet. Start training this profile in Chat.</p>
          )}
        </CardContent>
      </Card>

      {/* Voice Spectrum */}
      {pd?.voice_identity?.spectrum && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Voice Spectrum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(pd.voice_identity.spectrum).map(([axis, value]) => (
              <div key={axis} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="capitalize text-muted-foreground">{axis}</span>
                  <span className="font-medium">{value}/10</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(value as number) * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Modules */}
      {profile.active_modules?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.active_modules.map((mod) => (
                <Badge key={mod} variant="secondary">{mod.replace(/_/g, " ")}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Training Sources</CardTitle>
          <CardDescription>Documents and conversations used to train this profile</CardDescription>
        </CardHeader>
        <CardContent>
          {profile.training_sources?.length > 0 ? (
            <div className="space-y-2">
              {profile.training_sources.map((source, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <span className="text-sm font-medium">
                      {source.type === "document" ? source.file_name : "Questionnaire Session"}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {source.fields_populated?.length || 0} fields populated
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">{source.type}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No training sources yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
