import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { analyzeDocument } from "@/lib/training/analyze";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES: Record<string, string[]> = {
  "text/plain": [".txt"],
  "text/markdown": [".md"],
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  // Some browsers send these MIME types for .md files
  "text/x-markdown": [".md"],
};

// Also check by extension as a fallback (browsers are inconsistent with MIME types)
const ALLOWED_EXTENSIONS = [".txt", ".md", ".pdf", ".docx"];

function getFileExtension(filename: string): string {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  return ext;
}

async function extractText(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ text: string; method: string }> {
  const ext = getFileExtension(fileName);

  // ── Plain text / Markdown ─────────────────────────────────────────
  if (ext === ".txt" || ext === ".md" || mimeType.startsWith("text/")) {
    return {
      text: buffer.toString("utf-8"),
      method: "direct_read",
    };
  }

  // ── PDF ───────────────────────────────────────────────────────────
  if (ext === ".pdf" || mimeType === "application/pdf") {
    try {
      const { getDocumentProxy, extractText: extractPdfText } = await import("unpdf");
      const uint8 = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      const pdf = await getDocumentProxy(uint8);
      const result = await extractPdfText(pdf, { mergePages: true });
      await pdf.destroy();

      const text = result.text;
      if (text.trim().length === 0) {
        throw new Error(
          "PDF appears to be image-based (scanned). Text extraction returned empty. Please upload a text-based PDF or convert to .txt first."
        );
      }

      return {
        text,
        method: "unpdf",
      };
    } catch (err: any) {
      if (err.message?.includes("image-based")) throw err;
      throw new Error(
        `Failed to extract text from PDF: ${err.message}. The file may be corrupted or password-protected.`
      );
    }
  }

  // ── DOCX ──────────────────────────────────────────────────────────
  if (
    ext === ".docx" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    try {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });

      if (!result.value || result.value.trim().length === 0) {
        throw new Error(
          "DOCX appears to be empty or contains only images/tables without text content."
        );
      }

      // Log any conversion warnings for debugging
      if (result.messages && result.messages.length > 0) {
        console.warn(
          "Mammoth warnings:",
          result.messages.map((m: any) => m.message)
        );
      }

      return {
        text: result.value,
        method: "mammoth",
      };
    } catch (err: any) {
      if (err.message?.includes("empty")) throw err;
      throw new Error(
        `Failed to extract text from DOCX: ${err.message}. The file may be corrupted or in an older .doc format (only .docx is supported).`
      );
    }
  }

  throw new Error(
    `Unsupported file type: ${ext} (${mimeType}). Supported: .txt, .md, .pdf, .docx`
  );
}

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

    // ── Parse form data ───────────────────────────────────────────
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const profileId = formData.get("profileId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!profileId) {
      return NextResponse.json(
        { error: "No profileId provided" },
        { status: 400 }
      );
    }

    // ── Validate profile belongs to workspace ─────────────────────
    const { data: profile } = await supabase
      .from("brand_profiles")
      .select("id, workspace_id")
      .eq("id", profileId)
      .eq("workspace_id", membership.workspace_id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found in your workspace" },
        { status: 404 }
      );
    }

    // ── Validate file ─────────────────────────────────────────────
    const ext = getFileExtension(file.name);

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${ext}. Supported formats: .txt, .md, .pdf, .docx`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "File is empty." },
        { status: 400 }
      );
    }

    // ── Read file into buffer ─────────────────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ── Upload to Supabase Storage ────────────────────────────────
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${membership.workspace_id}/${profileId}/${timestamp}-${sanitizedName}`;

    const serviceClient = await createServiceClient();
    const { error: uploadError } = await serviceClient.storage
      .from("training-documents")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    // ── Create training_documents record (pending) ────────────────
    const { data: docRecord, error: docError } = await serviceClient
      .from("training_documents")
      .insert({
        brand_profile_id: profileId,
        workspace_id: membership.workspace_id,
        file_name: file.name,
        file_type: ext.replace(".", ""),
        file_size: file.size,
        storage_path: storagePath,
        processing_status: "processing",
        created_by: user.id,
      })
      .select()
      .single();

    if (docError) {
      console.error("Document record error:", docError);
      // Clean up uploaded file
      await serviceClient.storage
        .from("training-documents")
        .remove([storagePath]);
      return NextResponse.json(
        { error: "Failed to create document record" },
        { status: 500 }
      );
    }

    // ── Extract text ──────────────────────────────────────────────
    let extractedText: string;
    let extractionMethod: string;

    try {
      const result = await extractText(buffer, file.name, file.type);
      extractedText = result.text;
      extractionMethod = result.method;
    } catch (err: any) {
      // Update status to error
      await serviceClient
        .from("training_documents")
        .update({
          processing_status: "error",
          extracted_content: { error: err.message },
        })
        .eq("id", docRecord.id);

      return NextResponse.json(
        { error: err.message },
        { status: 422 }
      );
    }

    // ── Update record with extracted content ──────────────────────
    const wordCount = extractedText.split(/\s+/).filter(Boolean).length;

    // Truncate to a reasonable size for storage (keep full text but
    // limit what we send to Claude later)
    const truncatedForStorage =
      extractedText.length > 500000
        ? extractedText.slice(0, 500000) + "\n\n[Truncated at 500,000 characters]"
        : extractedText;

    await serviceClient
      .from("training_documents")
      .update({
        processing_status: "complete",
        extracted_content: {
          text: truncatedForStorage,
          method: extractionMethod,
          word_count: wordCount,
          char_count: extractedText.length,
          extracted_at: new Date().toISOString(),
        },
      })
      .eq("id", docRecord.id);

    // ── AI Analysis — extract brand attributes ────────────────────
    let analysisResult: {
      completeness?: number;
      fields_populated?: string[];
      gaps?: string[];
      confidence?: string;
    } = {};

    try {
      analysisResult = await analyzeDocument({
        documentId: docRecord.id,
        profileId,
        workspaceId: membership.workspace_id,
        extractedText: truncatedForStorage,
        fileName: file.name,
        serviceClient,
      });
    } catch (err: any) {
      // Analysis failure is non-fatal — the document is already saved
      console.error("Post-upload analysis error:", err.message);
    }

    return NextResponse.json({
      success: true,
      document: {
        id: docRecord.id,
        file_name: file.name,
        file_type: ext.replace(".", ""),
        file_size: file.size,
        word_count: wordCount,
        char_count: extractedText.length,
        extraction_method: extractionMethod,
        preview: extractedText.slice(0, 500) + (extractedText.length > 500 ? "..." : ""),
      },
      analysis: {
        completeness: analysisResult.completeness ?? null,
        fields_populated: analysisResult.fields_populated ?? [],
        gaps: analysisResult.gaps ?? [],
        confidence: analysisResult.confidence ?? null,
      },
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred processing your file" },
      { status: 500 }
    );
  }
}
