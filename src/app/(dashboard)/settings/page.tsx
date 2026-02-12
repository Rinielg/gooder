"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Separator, Badge } from "@/components/ui/shared";
import { Loader2, Settings, Users, Shield } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [workspaceName, setWorkspaceName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [role, setRole] = useState("");
  const supabase = createClient();

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
      setWorkspaceName((m.workspaces as any)?.name || "");
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function updateWorkspaceName() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: m } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", user.id).limit(1).single();
    if (!m) return;
    const { error } = await supabase.from("workspaces").update({ name: workspaceName }).eq("id", m.workspace_id);
    if (error) { toast.error("Failed to update"); return; }
    toast.success("Workspace name updated");
  }

  async function updatePassword() {
    if (!newPassword || newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    setCurrentPassword(""); setNewPassword("");
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your workspace and account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Settings className="w-5 h-5" /> Workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Workspace Name</Label>
            <div className="flex gap-2">
              <Input value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} disabled={role !== "admin"} />
              {role === "admin" && <Button onClick={updateWorkspaceName}>Save</Button>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{role}</Badge>
            <span className="text-sm text-muted-foreground">{email}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Shield className="w-5 h-5" /> Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" />
          </div>
          <Button onClick={updatePassword} disabled={!newPassword}>Update Password</Button>
        </CardContent>
      </Card>
    </div>
  );
}
