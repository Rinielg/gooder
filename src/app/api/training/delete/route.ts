import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // ── Auth ───────────────────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Workspace ─────────────────────────────────────────────────
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id, role")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "No workspace found" },
        { status: 403 }
      );
    }

    // ── Parse request ─────────────────────────────────────────────
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "No documentId provided" },
        { status: 400 }
      );
    }

    // ── Fetch the document record ─────────────────────────────────
    const serviceClient = await createServiceClient();
    const { data: doc, error: fetchError } = await serviceClient
      .from("training_documents")
      .select("id, storage_path, workspace_id, created_by")
      .eq("id", documentId)
      .eq("workspace_id", membership.workspace_id)
      .single();

    if (fetchError || !doc) {
      return NextResponse.json(
        { error: "Document not found in your workspace" },
        { status: 404 }
      );
    }

    // ── Permission check: admins can delete any, users their own ──
    if (membership.role !== "admin" && doc.created_by !== user.id) {
      return NextResponse.json(
        { error: "You can only delete documents you uploaded" },
        { status: 403 }
      );
    }

    // ── Delete from Storage ───────────────────────────────────────
    if (doc.storage_path) {
      const { error: storageError } = await serviceClient.storage
        .from("training-documents")
        .remove([doc.storage_path]);

      if (storageError) {
        console.error("Storage deletion error:", storageError);
        // Continue with DB deletion even if storage fails
        // The file is orphaned but the record is cleaned up
      }
    }

    // ── Delete from Database ──────────────────────────────────────
    const { error: deleteError } = await serviceClient
      .from("training_documents")
      .delete()
      .eq("id", documentId);

    if (deleteError) {
      console.error("Database deletion error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete document record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted: documentId,
    });
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
