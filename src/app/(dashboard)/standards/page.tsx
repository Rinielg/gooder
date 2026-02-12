"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, Badge } from "@/components/ui/shared";
import { Trash2, Loader2, FileText, Check, X } from "lucide-react";
import { toast } from "sonner";
import type { PlatformStandard } from "@/types";

export default function StandardsPage() {
  const [standards, setStandards] = useState<PlatformStandard[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: m } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", user.id).limit(1).single();
    if (!m) return;
    const { data } = await supabase.from("platform_standards").select("*").eq("workspace_id", m.workspace_id).order("type", { ascending: true });
    setStandards((data || []) as PlatformStandard[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function toggleActive(id: string, currentState: boolean) {
    const { error } = await supabase.from("platform_standards").update({ is_active: !currentState }).eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    load();
  }

  async function deleteStandard(id: string) {
    if (!confirm("Delete this custom standard?")) return;
    const { error } = await supabase.from("platform_standards").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Deleted");
    load();
  }

  function getRules(std: PlatformStandard): string[] {
    const c = std.content as Record<string, unknown>;
    if (c && Array.isArray(c.rules)) return c.rules as string[];
    return [];
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-2xl font-bold">Platform Standards</h1>
        <p className="text-muted-foreground text-sm mt-1">Best practices applied to all content generation</p>
      </div>

      <div className="space-y-3">
        {standards.map((std) => {
          const rules = getRules(std);
          return (
            <Card key={std.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{std.name}</h3>
                        <Badge variant={std.type === "predefined" ? "secondary" : "outline"}>{std.type}</Badge>
                        <Badge variant={std.category === "ux_journey" ? "default" : "outline"} className="text-xs">{std.category.replace("_", " ")}</Badge>
                      </div>
                      {rules.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {rules.slice(0, 3).map((rule, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-1">•</span> {rule}
                            </li>
                          ))}
                          {rules.length > 3 && (
                            <li className="text-xs text-muted-foreground">+{rules.length - 3} more rules</li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant={std.is_active ? "default" : "outline"} size="sm" onClick={() => toggleActive(std.id, std.is_active)}>
                      {std.is_active ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                      {std.is_active ? "Active" : "Inactive"}
                    </Button>
                    {std.type === "custom" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteStandard(std.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
