"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import type { Definition } from "@/types";

export default function DefinitionsPage() {
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTerm, setNewTerm] = useState("");
  const [newDef, setNewDef] = useState("");
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: m } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", user.id).limit(1).single();
    if (!m) return;
    const { data } = await supabase.from("definitions").select("*").eq("workspace_id", m.workspace_id).order("term");
    setDefinitions((data || []) as Definition[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function addDefinition() {
    if (!newTerm.trim() || !newDef.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: m } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", user.id).limit(1).single();
    if (!m) return;

    const { error } = await supabase.from("definitions").insert({
      workspace_id: m.workspace_id,
      term: newTerm.trim(),
      definition: newDef.trim(),
    });

    if (error) { toast.error("Failed to add"); return; }
    toast.success("Definition added");
    setNewTerm(""); setNewDef("");
    load();
  }

  async function deleteDefinition(id: string) {
    const { error } = await supabase.from("definitions").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Deleted");
    load();
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-2xl font-bold">Definitions Glossary</h1>
        <p className="text-muted-foreground text-sm mt-1">Define terms and features for consistent AI-generated content</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Term" value={newTerm} onChange={(e) => setNewTerm(e.target.value)} />
            <Input placeholder="Definition" value={newDef} onChange={(e) => setNewDef(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addDefinition()} />
          </div>
          <Button onClick={addDefinition} disabled={!newTerm.trim() || !newDef.trim()}><Plus className="w-4 h-4 mr-2" />Add Definition</Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {definitions.map((d) => (
          <Card key={d.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 min-w-0">
                <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <span className="font-medium text-sm">{d.term}</span>
                  <span className="text-muted-foreground text-sm ml-2">— {d.definition}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8 flex-shrink-0" onClick={() => deleteDefinition(d.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {definitions.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">No definitions yet. Add terms above.</p>
        )}
      </div>
    </div>
  );
}
