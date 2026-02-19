"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Archive, Copy } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { CardSkeleton } from "@/components/ui/skeletons";
import { EmptyState } from "@/components/ui/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { SavedOutput, OutputType } from "@/types";

const typeLabels: Record<OutputType, string> = {
  ux_journey: "UX Journey",
  email: "Email",
  sms: "SMS",
  push: "Push",
};

export default function OutputsPage() {
  const [outputs, setOutputs] = useState<SavedOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OutputType | "all">("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const supabase = createClient();

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: m } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();
    if (!m) return;

    let query = supabase
      .from("saved_outputs")
      .select("*")
      .eq("workspace_id", m.workspace_id)
      .order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("type", filter);

    const { data } = await query;
    setOutputs((data || []) as SavedOutput[]);
    setLoading(false);
  }, [supabase, filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmDelete(id: string) {
    const { error } = await supabase
      .from("saved_outputs")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Deleted");
    setDeleteTarget(null);
    load();
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Output Library" />
        <div className="mt-8">
          <CardSkeleton count={3} className="grid-cols-1" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Output Library" />
      <p className="text-sm text-muted-foreground mt-1 mb-6">
        Saved generated content
      </p>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-6">
        {(["all", "ux_journey", "email", "sms", "push"] as const).map((t) => (
          <Button
            key={t}
            variant={filter === t ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(t)}
          >
            {t === "all" ? "All" : typeLabels[t as OutputType]}
          </Button>
        ))}
      </div>

      {/* List or EmptyState */}
      <div className="space-y-3">
        {outputs.map((output) => (
          <Card key={output.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium">{output.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{typeLabels[output.type]}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(output.created_at)}
                    </span>
                    {output.adherence_score && (
                      <Badge
                        variant={
                          output.adherence_score.pass ? "success" : "warning"
                        }
                      >
                        Score: {output.adherence_score.overall_score}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      navigator.clipboard.writeText(output.content.raw);
                      toast.success("Copied");
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setDeleteTarget(output.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 rounded-lg p-3 max-h-40 overflow-y-auto">
                {output.content.raw.slice(0, 500)}
                {output.content.raw.length > 500 ? "..." : ""}
              </pre>
            </CardContent>
          </Card>
        ))}
        {outputs.length === 0 && (
          <EmptyState
            icon={Archive}
            heading="No saved outputs"
            description="Generate content in Chat and save outputs here."
            actionLabel="Go to Chat"
            onAction={() => (window.location.href = "/chat")}
          />
        )}
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this output?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && confirmDelete(deleteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
