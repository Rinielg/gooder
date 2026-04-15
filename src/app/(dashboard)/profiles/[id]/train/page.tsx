"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Send, Loader2, Bot, User, ArrowLeft, Upload, FileText,
  GraduationCap, CheckCircle2, X, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { BrandProfile } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".md", ".txt"];
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/markdown",
  "text/plain",
];

type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error" | "duplicate";

interface DuplicateInfo {
  existingDocId: string;
  existingFileName: string;
  newFields: string[];
  existingFields: string[];
}

interface UploadResult {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  word_count: number;
  char_count: number;
  extraction_method: string;
  preview: string;
}

interface AnalysisResult {
  completeness: number | null;
  fields_populated: string[];
  gaps: string[];
  confidence: string | null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TrainProfilePage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [initialSent, setInitialSent] = useState(false);
  const [activating, setActivating] = useState(false);

  // Upload state
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<DuplicateInfo | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const loadProfile = useCallback(async () => {
    const { data } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("id", profileId)
      .single();
    setProfile(data as BrandProfile | null);
    setLoading(false);
  }, [supabase, profileId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/training",
      body: { profileId },
    }),
    onError: (err) => {
      toast.error(err.message || "Failed to send message");
    },
    onFinish: () => {
      loadProfile();
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Auto-send initial message once profile is loaded
  useEffect(() => {
    if (profile && !initialSent && !loading) {
      setInitialSent(true);
      sendMessage({ text: `Start training for profile: ${profile.name}` });
    }
  }, [profile, initialSent, loading, sendMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- File upload handlers ---

  function isValidFile(file: File): boolean {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    return ACCEPTED_EXTENSIONS.includes(ext) || ACCEPTED_MIME_TYPES.includes(file.type);
  }

  async function handleFileUpload(file: File) {
    if (!isValidFile(file)) {
      toast.error(`Unsupported file type. Accepted: ${ACCEPTED_EXTENSIONS.join(", ")}`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    setUploadStatus("uploading");
    setUploadError(null);
    setUploadResult(null);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("profileId", profileId);

      setUploadStatus("processing");

      const res = await fetch("/api/training/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadResult(data.document as UploadResult);
      if (data.analysis) {
        setAnalysisResult(data.analysis as AnalysisResult);
      }

      // Check if this was a duplicate file
      if (data.duplicate) {
        setDuplicateInfo({
          existingDocId: data.existingDocument.id,
          existingFileName: data.existingDocument.file_name,
          newFields: data.analysis?.fields_populated ?? [],
          existingFields: [],
        });
        setUploadStatus("duplicate");
      } else {
        setUploadStatus("success");
      }

      // Reload profile to reflect updated completeness and profile_data
      await loadProfile();

      const fieldsCount = data.analysis?.fields_populated?.length || 0;
      toast.success(
        fieldsCount > 0
          ? `Document processed — ${fieldsCount} attribute(s) extracted`
          : `Document uploaded and stored`
      );
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
      setUploadStatus("error");
      toast.error(err.message || "Failed to process document");
    }
  }

  async function handleMultipleFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      await handleFileUpload(file);
    }
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleMultipleFiles(files);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) handleMultipleFiles(files);
    e.target.value = "";
  }

  const completeness = profile?.completeness ?? 0;

  // --- Message handling ---

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const target = e.target;
    target.style.height = "auto";
    target.style.height = Math.min(target.scrollHeight, 200) + "px";
  }

  async function activateProfile() {
    if (!profile) return;
    setActivating(true);
    const { error } = await supabase
      .from("brand_profiles")
      .update({ status: "active" })
      .eq("id", profile.id);

    if (error) {
      toast.error("Failed to activate profile");
      setActivating(false);
      return;
    }

    // Auto-select only if this is the first active profile
    const { count } = await supabase
      .from("brand_profiles")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", profile.workspace_id)
      .eq("status", "active");

    if (count === 1) {
      localStorage.setItem("bvp_active_profile", profile.id);
      window.dispatchEvent(
        new CustomEvent("bvp-profile-change", { detail: { profileId: profile.id } })
      );
    }

    toast.success("Profile activated!");
    router.push(`/profiles/${profile.id}`);
  }

  const displayMessages = messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: Array.isArray(m.parts)
      ? m.parts
          .filter((p) => p.type === "text")
          .map((p) => (p as any).text)
          .join("")
      : "",
  }));

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 py-3 border-b border-border">
          <Breadcrumbs />
          <div className="flex items-center justify-between mt-2">
            <div className="h-5 w-48 bg-muted rounded animate-pulse" />
            <div className="h-6 w-24 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-2 mt-3 bg-muted rounded-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-3 border-b border-border space-y-3">
        <Breadcrumbs overrides={{ [profileId]: profile.name }} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/profiles/${profileId}`)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">
                Training: {profile.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                Upload documents or answer questions to build your brand voice
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {completeness >= 80 && (
              <Button onClick={activateProfile} disabled={activating}>
                {activating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                {profile.status === "active" ? "Update & Activate Profile" : "Activate Profile"}
              </Button>
            )}
            <Badge variant="outline" className="text-xs">
              {completeness}% complete
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              completeness >= 80 ? "bg-green-500" : "bg-amber-500"
            )}
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>

      {/* Hidden file input — always in DOM so it can be triggered from any upload state */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_EXTENSIONS.join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

          {/* Chat messages with upload UI inserted after first assistant message */}
          {(() => {
            let uploadInserted = false;
            const hasAssistantMessage = displayMessages.some((m) => m.role === "assistant");

            const uploadUI = (
              <>
                {/* File Drop Zone */}
                {uploadStatus === "idle" && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
                      isDragging
                        ? "border-amber-500 bg-amber-500/5"
                        : "border-border hover:border-amber-500/50 hover:bg-accent/50"
                    )}
                  >
                    <Upload className={cn(
                      "w-8 h-8 mx-auto mb-3",
                      isDragging ? "text-amber-500" : "text-muted-foreground"
                    )} />
                    <p className="text-sm font-medium mb-1">
                      {isDragging ? "Drop file here" : "Upload brand documents"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Drag & drop or click to browse. Supports PDF, DOCX, MD, TXT (max 10MB)
                    </p>
                  </div>
                )}

                {/* Upload Progress */}
                {(uploadStatus === "uploading" || uploadStatus === "processing") && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                        <div>
                          <p className="text-sm font-medium">
                            {uploadStatus === "uploading"
                              ? "Uploading document..."
                              : "Analyzing document for brand voice attributes..."}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {uploadStatus === "processing"
                              ? "Extracting text and identifying voice patterns. This may take a moment."
                              : "Please wait..."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Upload Error */}
                {uploadStatus === "error" && (
                  <Card className="border-destructive/50">
                    <CardContent className="py-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-destructive">Upload failed</p>
                          <p className="text-xs text-muted-foreground mt-1">{uploadError}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUploadStatus("idle")}
                        >
                          Try Again
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Upload Success */}
                {uploadStatus === "success" && uploadResult && (
                  <Card className="border-green-500/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <CardTitle className="text-base">Document Uploaded</CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setUploadStatus("idle");
                            setUploadResult(null);
                            setAnalysisResult(null);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{uploadResult.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(uploadResult.file_size)} &middot;{" "}
                            {uploadResult.word_count.toLocaleString()} words &middot;{" "}
                            {uploadResult.extraction_method}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {uploadResult.file_type.toUpperCase()}
                        </Badge>
                      </div>
                      {analysisResult && analysisResult.fields_populated.length > 0 && (
                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 space-y-2">
                          <p className="text-xs font-medium text-green-700 dark:text-green-300">
                            Extracted {analysisResult.fields_populated.length} attribute(s)
                            {analysisResult.confidence && (
                              <span className="text-green-600/70 dark:text-green-400/70"> · {analysisResult.confidence} confidence</span>
                            )}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {analysisResult.fields_populated.map((field) => (
                              <Badge key={field} variant="outline" className="text-[10px] bg-white dark:bg-transparent">
                                {field.replace(/_/g, " ").replace(/\./g, " > ")}
                              </Badge>
                            ))}
                          </div>
                          {analysisResult.gaps.length > 0 && (
                            <p className="text-[10px] text-muted-foreground">
                              Still needed: {analysisResult.gaps.slice(0, 3).join(", ")}
                            </p>
                          )}
                        </div>
                      )}
                      {uploadResult.preview && !analysisResult?.fields_populated.length && (
                        <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground leading-relaxed max-h-32 overflow-y-auto">
                          {uploadResult.preview}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {analysisResult?.fields_populated.length
                          ? "Brand attributes have been extracted and merged into your profile. Upload more documents or continue the conversation to fill remaining gaps."
                          : "Document text has been extracted and stored. Continue the training conversation below to incorporate this content into your brand voice profile."}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Upload Another Document
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Duplicate File Detected */}
                {uploadStatus === "duplicate" && uploadResult && duplicateInfo && (
                  <Card className="border-amber-500/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          <CardTitle className="text-base">Duplicate File Detected</CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setUploadStatus("idle");
                            setUploadResult(null);
                            setAnalysisResult(null);
                            setDuplicateInfo(null);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{uploadResult.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            This file has been uploaded before. New content was analyzed and the following attributes were extracted.
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs flex-shrink-0 border-amber-300 text-amber-700">
                          Duplicate
                        </Badge>
                      </div>
                      {analysisResult && analysisResult.fields_populated.length > 0 && (
                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 space-y-2">
                          <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                            Attributes to overwrite ({analysisResult.fields_populated.length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {analysisResult.fields_populated.map((field) => (
                              <Badge key={field} variant="outline" className="text-[10px] bg-white dark:bg-transparent">
                                {field.replace(/_/g, " ").replace(/\./g, " > ")}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            // Accept the overwrite — data is already merged by the API
                            setDuplicateInfo(null);
                            setUploadStatus("success");
                            toast.success("Profile updated with new content");
                          }}
                        >
                          Overwrite
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setUploadStatus("idle");
                            setUploadResult(null);
                            setAnalysisResult(null);
                            setDuplicateInfo(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            );

            // If no assistant messages yet, show upload at top as fallback
            if (!hasAssistantMessage) {
              return <>{uploadUI}</>;
            }

            return displayMessages.map((message) => {
              const showUploadAfter = !uploadInserted && message.role === "assistant";
              if (showUploadAfter) uploadInserted = true;

              return (
                <React.Fragment key={message.id}>
                  {/* Chat message */}
                  <div
                    className={cn(
                      "flex gap-3 message-appear",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-4 h-4 text-amber-500" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-xl px-4 py-3 max-w-[85%]",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border"
                      )}
                    >
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Insert upload UI after first assistant message */}
                  {showUploadAfter && uploadUI}
                </React.Fragment>
              );
            });
          })()}

          {isLoading &&
            (displayMessages.length === 0 ||
              displayMessages[displayMessages.length - 1]?.role ===
                "user") && (
              <div className="flex gap-3 message-appear">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-amber-500" />
                </div>
                <div className="bg-card border border-border rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-4">
          <div className="relative flex items-end gap-2 rounded-xl border border-border bg-card p-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Answer the training question..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm focus:outline-none min-h-[40px] max-h-[200px] py-2 px-2"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="h-9 w-9 flex-shrink-0"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Your answers help build a more accurate brand voice profile.
          </p>
        </form>
      </div>
    </div>
  );
}
