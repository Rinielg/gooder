"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { FormInput, FormErrorSummary } from "@/components/ui/form-field";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { TableSkeleton } from "@/components/ui/skeletons";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import type { Definition } from "@/types";

const definitionSchema = z.object({
  term: z.string().min(1, "Term is required"),
  definition: z.string().min(1, "Definition is required"),
});
type DefinitionValues = z.infer<typeof definitionSchema>;

export default function DefinitionsPage() {
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const supabase = createClient();

  const form = useForm<DefinitionValues>({
    resolver: zodResolver(definitionSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { term: "", definition: "" },
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
      .from("definitions")
      .select("*")
      .eq("workspace_id", m.workspace_id)
      .order("term");
    setDefinitions((data || []) as Definition[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function onSubmit(values: DefinitionValues) {
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

    const { error } = await supabase.from("definitions").insert({
      workspace_id: m.workspace_id,
      term: values.term.trim(),
      definition: values.definition.trim(),
    });

    if (error) {
      toast.error("Failed to add");
      return;
    }
    toast.success("Definition added");
    form.reset();
    load();
  }

  async function confirmDelete(id: string) {
    const { error } = await supabase.from("definitions").delete().eq("id", id);
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
        <PageHeader title="Definitions Glossary" />
        <div className="mt-8">
          <TableSkeleton rows={5} columns={3} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Definitions Glossary" />
      <p className="text-sm text-muted-foreground mt-1 mb-6">
        Define terms and features for consistent AI-generated content
      </p>

      {/* Add form */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormErrorSummary />
              <div className="grid grid-cols-2 gap-4">
                <FormInput name="term" label="Term">
                  <Input placeholder="Term" />
                </FormInput>
                <FormInput name="definition" label="Definition">
                  <Input placeholder="Definition" />
                </FormInput>
              </div>
              <Button type="submit">
                <Plus className="w-4 h-4 mr-2" />
                Add Definition
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Table list */}
      {definitions.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          heading="No definitions yet"
          description="Define brand terms and product features for consistent AI-generated content."
          actionLabel="Add your first definition"
          onAction={() =>
            document
              .querySelector<HTMLInputElement>('input[name="term"]')
              ?.focus()
          }
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Term</TableHead>
                <TableHead>Definition</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {definitions.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.term}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {d.definition}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8"
                      onClick={() => setDeleteTarget(d.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this definition?</AlertDialogTitle>
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
