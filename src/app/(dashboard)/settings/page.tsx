"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form } from "@/components/ui/form";
import { FormInput, FormErrorSummary } from "@/components/ui/form-field";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { FormSkeleton } from "@/components/ui/skeletons";
import { toast } from "sonner";

const workspaceSchema = z.object({
  workspaceName: z.string().min(1, "Workspace name is required"),
});
type WorkspaceValues = z.infer<typeof workspaceSchema>;

const passwordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});
type PasswordValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const supabase = createClient();

  const workspaceForm = useForm<WorkspaceValues>({
    resolver: zodResolver(workspaceSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { workspaceName: "" },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { newPassword: "" },
  });

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setEmail(user.email || "");

    const { data: m } = await supabase
      .from("workspace_members")
      .select("workspace_id, role, workspaces(name)")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (m) {
      setRole(m.role);
      workspaceForm.reset({ workspaceName: (m.workspaces as any)?.name || "" });
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function onWorkspaceSubmit(values: WorkspaceValues) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: m } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", user.id).limit(1).single();
    if (!m) return;
    const { error } = await supabase.from("workspaces").update({ name: values.workspaceName }).eq("id", m.workspace_id);
    if (error) { toast.error("Failed to update"); return; }
    toast.success("Workspace name updated");
  }

  async function onPasswordSubmit(values: PasswordValues) {
    const { error } = await supabase.auth.updateUser({ password: values.newPassword });
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    passwordForm.reset();
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Settings" />
        <div className="mt-8 max-w-xl">
          <FormSkeleton fields={3} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Settings" />
      <p className="text-sm text-muted-foreground mt-1 mb-6">Manage your workspace and account</p>

      <Tabs defaultValue="workspace" className="max-w-xl">
        <TabsList className="mb-6">
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="workspace" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Workspace Settings</CardTitle>
              <CardDescription>Manage your workspace name and member information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...workspaceForm}>
                <form onSubmit={workspaceForm.handleSubmit(onWorkspaceSubmit)} className="space-y-4">
                  <FormErrorSummary />
                  <FormInput name="workspaceName" label="Workspace Name">
                    <Input disabled={role !== "admin"} />
                  </FormInput>
                  {role === "admin" && (
                    <Button type="submit">Save</Button>
                  )}
                </form>
              </Form>
              <div className="flex items-center gap-2 pt-2 border-t">
                <Badge variant="outline">{role}</Badge>
                <span className="text-sm text-muted-foreground">{email}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormErrorSummary />
                  <FormInput name="newPassword" label="New Password">
                    <Input type="password" placeholder="Min 8 characters" />
                  </FormInput>
                  <Button type="submit">Update Password</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
