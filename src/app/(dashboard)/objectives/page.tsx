"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, Badge, Textarea } from "@/components/ui/shared";
import { Plus, Trash2, Loader2, Target } from "lucide-react";
import { toast } from "sonner";
import type { Objective } from "@/types";

export default function ObjectivesPage() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: m } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", user.id).limit(1).single();
    if (!m) return;
    const { data } = await supabase.from("objectives").select("*").eq("workspace_id", m.workspace_id).order("priority");
    setObjectives((data || []) as Objective[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function addObjective() {
    if (!newTitle.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: m } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", user.id).limit(1).single();
    if (!m) return;

    const { error } = await supabase.from("objectives").insert({
      workspace_id: m.workspace_id,
      title: newTitle.trim(),
      description: newDesc.trim(),
      priority: objectives.length,
      is_active: true,
    });

    if (error) { toast.error("Failed to add objective"); return; }
    toast.success("Objective added");
    setNewTitle(""); setNewDesc("");
    load();
  }

  async function deleteObjective(id: string) {
    const { error } = await supabase.from("objectives").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Deleted");
    load();
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-2xl font-bold">Business Objectives</h1>
        <p className="text-muted-foreground text-sm mt-1">Define goals to score generated content against</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <Input placeholder="Objective title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <Textarea placeholder="Describe the objective..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={2} />
          <Button onClick={addObjective} disabled={!newTitle.trim()}><Plus className="w-4 h-4 mr-2" />Add Objective</Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {objectives.map((obj) => (
          <Card key={obj.id}>
            <CardContent className="flex items-start justify-between p-4">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">{obj.title}</h3>
                  {obj.description && <p className="text-sm text-muted-foreground mt-1">{obj.description}</p>}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => deleteObjective(obj.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {objectives.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">No objectives yet. Add one above.</p>
        )}
      </div>
    </div>
  );
}
