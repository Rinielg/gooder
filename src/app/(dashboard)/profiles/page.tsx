"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Mic2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { BrandProfile } from "@/types";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { CardSkeleton } from "@/components/ui/skeletons";
import { EmptyState } from "@/components/ui/empty-state";
import { Form } from "@/components/ui/form";
import { FormInput, FormErrorSummary } from "@/components/ui/form-field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ProfileCard } from "@/components/features/profiles/profile-card";

const createSchema = z.object({
  name: z.string().min(1, "Profile name is required"),
})
type CreateValues = z.infer<typeof createSchema>

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<BrandProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const supabase = createClient();

  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

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

  async function onSubmit(values: CreateValues) {
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
        name: values.name.trim(),
        status: "draft",
        completeness: 0,
        profile_data: {},
        active_modules: [],
        training_sources: [],
        created_by: user.id,
      });

      if (error) throw error;

      toast.success("Profile created");
      form.reset();
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
      <PageContainer>
        <PageHeader title="Brand Profiles" />
        <div className="mt-8">
          <CardSkeleton count={3} className="grid-cols-1" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Brand Profiles"
        actions={
          <Button onClick={() => setShowCreate(true)} disabled={profiles.length >= 4}>
            <Plus className="w-4 h-4 mr-2" />
            New Profile
          </Button>
        }
      />
      <p className="text-sm text-muted-foreground mt-1">Manage your brand voice profiles ({profiles.length}/4)</p>

      {showCreate && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormErrorSummary />
                <FormInput name="name" label="Profile name">
                  <Input placeholder="e.g., My Brand Voice" />
                </FormInput>
                <div className="flex gap-2">
                  <Button type="submit" disabled={creating}>
                    {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create
                  </Button>
                  <Button variant="outline" type="button" onClick={() => { setShowCreate(false); form.reset(); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid gap-4">
        {profiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
        {profiles.length === 0 && (
          <EmptyState
            icon={Mic2}
            heading="No brand profiles yet"
            description="Create your first brand voice profile to start generating on-brand content."
            actionLabel="Create your first profile"
            onAction={() => setShowCreate(true)}
          />
        )}
      </div>
    </PageContainer>
  );
}
