import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { analyzeDocument } from "@/lib/training/analyze";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, profileId } = body as {
      documentId: string;
      profileId: string;
    };

    if (!documentId || !profileId) {
      return NextResponse.json(
        { error: "documentId and profileId are required" },
        { status: 400 }
      );
    }

    // ── Auth ───────────────────────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Workspace ─────────────────────────────────────────────────────
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "No workspace found" },
        { status: 403 }
      );
    }

    // ── Load document ─────────────────────────────────────────────────
    const serviceClient = await createServiceClient();

    const { data: docData } = await serviceClient
      .from("training_documents")
      .select("*")
      .eq("id", documentId)
      .eq("brand_profile_id", profileId)
      .single();

    if (!docData) {
      return NextResponse.json(
        { error: "Document not found for this profile" },
        { status: 404 }
      );
    }

    const extractedText = (docData.extracted_content as any)?.text;
    if (!extractedText || typeof extractedText !== "string" || !extractedText.trim()) {
      return NextResponse.json(
        { error: "Document has no extracted text content" },
        { status: 422 }
      );
    }

    // ── Run analysis ──────────────────────────────────────────────────
    const result = await analyzeDocument({
      documentId,
      profileId,
      workspaceId: membership.workspace_id,
      extractedText,
      fileName: docData.file_name,
      serviceClient,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during document analysis" },
      { status: 500 }
    );
  }
}
