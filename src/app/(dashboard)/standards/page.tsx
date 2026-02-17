"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Trash2, Loader2, FileText, Check, X,
  Pencil, ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PlatformStandard, StandardCategory } from "@/types";

const CATEGORIES: { value: StandardCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ux_journey", label: "UX Journey" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Push" },
  { value: "general", label: "General" },
];

export default function StandardsPage() {
  const [standards, setStandards] = useState<PlatformStandard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const supabase = createClient();

  // Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<StandardCategory>("general");
  const [formRules, setFormRules] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);

  // Workspace ID cache
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: m } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();
    if (!m) return;
    setWorkspaceId(m.workspace_id);
    const { data } = await supabase
      .from("platform_standards")
      .select("*")
      .eq("workspace_id", m.workspace_id)
      .order("type", { ascending: true })
      .order("name", { ascending: true });
    setStandards((data || []) as PlatformStandard[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function getRules(std: PlatformStandard): string[] {
    const c = std.content as Record<string, unknown>;
    if (c && Array.isArray(c.rules)) return c.rules as string[];
    return [];
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ── Form helpers ────────────────────────────────────────────────────────
  function resetForm() {
    setFormName("");
    setFormCategory("general");
    setFormRules([""]);
    setEditingId(null);
    setShowForm(false);
  }

  function openNewForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(std: PlatformStandard) {
    setFormName(std.name);
    setFormCategory(std.category);
    setFormRules(getRules(std).length > 0 ? getRules(std) : [""]);
    setEditingId(std.id);
    setShowForm(true);
  }

  function updateRule(index: number, value: string) {
    setFormRules((prev) => prev.map((r, i) => (i === index ? value : r)));
  }

  function addRule() {
    setFormRules((prev) => [...prev, ""]);
  }

  function removeRule(index: number) {
    setFormRules((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Save (create or update) ─────────────────────────────────────────────
  async function handleSave() {
    if (!formName.trim()) {
      toast.error("Name is required");
      return;
    }

    const rules = formRules.map((r) => r.trim()).filter(Boolean);
    if (rules.length === 0) {
      toast.error("Add at least one rule");
      return;
    }

    if (!workspaceId) {
      toast.error("No workspace found");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from("platform_standards")
          .update({
            name: formName.trim(),
            category: formCategory,
            content: { rules },
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Standard updated");
      } else {
        // Create new
        const { error } = await supabase
          .from("platform_standards")
          .insert({
            workspace_id: workspaceId,
            name: formName.trim(),
            type: "custom" as const,
            category: formCategory,
            content: { rules },
            is_active: true,
          });

        if (error) throw error;
        toast.success("Standard created");
      }

      resetForm();
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Standard save error:", msg);
      toast.error(editingId ? "Failed to update standard" : "Failed to create standard");
    } finally {
      setSaving(false);
    }
  }

  // ── Toggle active ───────────────────────────────────────────────────────
  async function toggleActive(id: string, currentState: boolean) {
    const { error } = await supabase
      .from("platform_standards")
      .update({ is_active: !currentState })
      .eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    load();
  }

  // ── Delete ──────────────────────────────────────────────────────────────
  async function deleteStandard(id: string) {
    if (!confirm("Delete this custom standard?")) return;
    const { error } = await supabase
      .from("platform_standards")
      .delete()
      .eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Deleted");
    load();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Standards & Rules</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Best practices and rules applied to all content generation
          </p>
        </div>
        {!showForm && (
          <Button onClick={openNewForm}>
            <Plus className="w-4 h-4 mr-2" />
            New Standard
          </Button>
        )}
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="font-semibold text-sm">
              {editingId ? "Edit Standard" : "New Custom Standard"}
            </h2>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <Input
                placeholder="e.g. Error Message Guidelines"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as StandardCategory)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Dynamic Rules */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Rules</label>
              <div className="space-y-2">
                {formRules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-5 text-right flex-shrink-0">
                      {i + 1}.
                    </span>
                    <Input
                      placeholder={`Rule ${i + 1}...`}
                      value={rule}
                      onChange={(e) => updateRule(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addRule();
                        }
                      }}
                    />
                    {formRules.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                        onClick={() => removeRule(i)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="text-xs mt-1" onClick={addRule}>
                <Plus className="w-3 h-3 mr-1" />
                Add rule
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingId ? "Update Standard" : "Create Standard"}
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Standards List */}
      <div className="space-y-3">
        {standards.map((std) => {
          const rules = getRules(std);
          const isExpanded = expandedIds.has(std.id);
          const visibleRules = isExpanded ? rules : rules.slice(0, 3);

          return (
            <Card key={std.id} className={cn(!std.is_active && "opacity-60")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium">{std.name}</h3>
                        <Badge variant={std.type === "predefined" ? "secondary" : "outline"}>
                          {std.type}
                        </Badge>
                        <Badge
                          variant={std.category === "all" ? "default" : std.category === "ux_journey" ? "default" : "outline"}
                          className="text-xs"
                        >
                          {std.category === "all" ? "All Categories" : std.category.replace("_", " ")}
                        </Badge>
                      </div>
                      {rules.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {visibleRules.map((rule, i) => (
                            <li
                              key={i}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <span className="text-primary mt-1">•</span> {rule}
                            </li>
                          ))}
                        </ul>
                      )}
                      {rules.length > 3 && (
                        <button
                          onClick={() => toggleExpand(std.id)}
                          className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-3 h-3" /> Show less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3" /> +{rules.length - 3} more
                              rules
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <Button
                      variant={std.is_active ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleActive(std.id, std.is_active)}
                    >
                      {std.is_active ? (
                        <Check className="w-3 h-3 mr-1" />
                      ) : (
                        <X className="w-3 h-3 mr-1" />
                      )}
                      {std.is_active ? "Active" : "Inactive"}
                    </Button>
                    {std.type === "custom" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditForm(std)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteStandard(std.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {standards.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">
            No standards yet. Create one above.
          </p>
        )}
      </div>
    </div>
  );
}
