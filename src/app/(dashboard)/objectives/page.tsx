"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Target } from "lucide-react";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { FormInput, FormErrorSummary } from "@/components/ui/form-field";
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
import type { Objective } from "@/types";

const objectiveSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});
type ObjectiveValues = z.infer<typeof objectiveSchema>;

export default function ObjectivesPage() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const supabase = createClient();

  const form = useForm<ObjectiveValues>({
    resolver: zodResolver(objectiveSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { title: "", description: "" },
  });

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
    const { data } = await supabase
      .from("objectives")
      .select("*")
      .eq("workspace_id", m.workspace_id)
      .order("priority");
    setObjectives((data || []) as Objective[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function onSubmit(values: ObjectiveValues) {
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

    const { error } = await supabase.from("objectives").insert({
      workspace_id: m.workspace_id,
      title: values.title.trim(),
      description: values.description?.trim() ?? "",
      priority: objectives.length,
      is_active: true,
    });

    if (error) {
      toast.error("Failed to add objective");
      return;
    }
    toast.success("Objective added");
    form.reset();
    load();
  }

  async function confirmDelete(id: string) {
    const { error } = await supabase.from("objectives").delete().eq("id", id);
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
        <PageHeader title="Business Objectives" />
        <div className="mt-8">
          <CardSkeleton count={3} className="grid-cols-1" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Business Objectives" />
      <p className="text-sm text-muted-foreground mt-1 mb-6">
        Define goals to score generated content against
      </p>

      {/* Add form */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormErrorSummary />
              <FormInput name="title" label="Objective title">
                <Input placeholder="Objective title" />
              </FormInput>
              <FormInput name="description" label="Description">
                <Textarea placeholder="Describe the objective..." rows={2} />
              </FormInput>
              <Button type="submit">
                <Plus className="w-4 h-4 mr-2" />
                Add Objective
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-3">
        {objectives.map((obj) => (
          <Card key={obj.id}>
            <CardContent className="flex items-start justify-between p-4">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">{obj.title}</h3>
                  {obj.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {obj.description}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive h-8 w-8"
                onClick={() => setDeleteTarget(obj.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {objectives.length === 0 && (
          <EmptyState
            icon={Target}
            heading="No objectives yet"
            description="Add business goals to score generated content against your objectives."
            actionLabel="Add your first objective"
            onAction={() =>
              document
                .querySelector<HTMLInputElement>('input[name="title"]')
                ?.focus()
            }
          />
        )}
      </div>

      {/* Delete AlertDialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this objective?</AlertDialogTitle>
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
