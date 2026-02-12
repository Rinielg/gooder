"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shared";
import {
  Send, Loader2, Bot, User, ArrowLeft, Upload, FileText,
  GraduationCap, CheckCircle2, X, Check, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { BrandProfile, BrandProfileData } from "@/types";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".md", ".txt"];
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/markdown",
  "text/plain",
];

type UploadStatus = "idle" | "uploading" | "processing" | "review" | "error";

interface ExtractedField {
  key: string;
  label: string;
  confidence: string;
  accepted: boolean | null; // null = pending review
  preview: string;
}

interface UploadResult {
  documentId: string;
  summary: string;
  confidence: Record<string, string>;
  fieldsPopulated: string[];
  completeness: number;
}

const FIELD_LABELS: Record<string, string> = {
  voice_identity: "Voice Identity",
  "voice_identity.pillars": "Voice Pillars",
  "voice_identity.archetype": "Brand Archetype",
  "voice_identity.spectrum": "Voice Spectrum",
  tone_architecture: "Tone Architecture",
  grammar_style: "Grammar & Style",
  content_patterns: "Content Patterns",
  lifecycle_language: "Lifecycle Language",
  channel_adaptation: "Channel Adaptation",
  governance: "Governance",
};

function fieldLabel(key: string): string {
  return FIELD_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function previewValue(data: BrandProfileData, key: string): string {
  const val = (data as any)[key];
  if (!val) return "No data";
  if (key === "voice_identity") {
    const parts: string[] = [];
    if (val.pillars?.length) parts.push(`${val.pillars.length} pillar(s)`);
    if (val.archetype?.primary) parts.push(`Archetype: ${val.archetype.primary}`);
    if (val.spectrum) parts.push("Spectrum defined");
    return parts.join(", ") || "Partial data";
  }
  if (key === "tone_architecture") {
    const tones = val.situational_tone_map?.length ?? 0;
    return tones > 0 ? `${tones} situational tone(s)` : "Tone rules defined";
  }
  if (key === "grammar_style") {
    const entries = Object.entries(val)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`);
    return entries.slice(0, 3).join(", ") || "Style rules defined";
  }
  if (typeof val === "object") {
    const count = Array.isArray(val) ? val.length : Object.keys(val).length;
    return `${count} item(s)`;
  }
  return String(val);
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
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([]);
  const [extractedData, setExtractedData] = useState<Partial<BrandProfileData> | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [savingReview, setSavingReview] = useState(false);

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
    setExtractedFields([]);
    setExtractedData(null);

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

      const result = data as UploadResult;
      setUploadResult(result);

      // Reload profile to get the merged data from the server
      const { data: freshProfile } = await supabase
        .from("brand_profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (freshProfile) {
        const prev = profile?.profile_data || {};
        const merged = (freshProfile as BrandProfile).profile_data || {};

        // Build extractedData by diffing what's new
        const newData: Partial<BrandProfileData> = {};
        for (const key of result.fieldsPopulated) {
          (newData as any)[key] = (merged as any)[key];
        }
        setExtractedData(newData);

        // Build review fields
        const fields: ExtractedField[] = result.fieldsPopulated.map((key) => ({
          key,
          label: fieldLabel(key),
          confidence: result.confidence?.[key] || result.confidence?.[`voice_identity.${key}`] || "medium",
          accepted: null,
          preview: previewValue(merged as BrandProfileData, key),
        }));

        setExtractedFields(fields);
        setProfile(freshProfile as BrandProfile);
        setUploadStatus("review");
      }
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
      setUploadStatus("error");
      toast.error(err.message || "Failed to process document");
    }
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = "";
  }

  function setFieldAccepted(key: string, accepted: boolean) {
    setExtractedFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, accepted } : f))
    );
  }

  function acceptAll() {
    setExtractedFields((prev) => prev.map((f) => ({ ...f, accepted: true })));
  }

  function rejectAll() {
    setExtractedFields((prev) => prev.map((f) => ({ ...f, accepted: false })));
  }

  async function saveReview() {
    if (!profile || !extractedData) return;
    setSavingReview(true);

    const accepted = extractedFields.filter((f) => f.accepted === true);
    const rejected = extractedFields.filter((f) => f.accepted === false);

    if (accepted.length === 0 && rejected.length > 0) {
      // All rejected — revert to pre-upload profile_data
      // The upload already merged data, so we need to remove rejected fields
      const revertedData = { ...(profile.profile_data || {}) } as Record<string, any>;
      for (const field of rejected) {
        delete revertedData[field.key];
      }

      const { error } = await supabase
        .from("brand_profiles")
        .update({
          profile_data: revertedData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileId);

      if (error) {
        toast.error("Failed to save changes");
        setSavingReview(false);
        return;
      }

      toast.success("All extracted attributes rejected");
    } else if (rejected.length > 0) {
      // Partial accept — remove only rejected fields from merged data
      const currentData = { ...(profile.profile_data || {}) } as Record<string, any>;
      for (const field of rejected) {
        delete currentData[field.key];
      }

      const { error } = await supabase
        .from("brand_profiles")
        .update({
          profile_data: currentData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileId);

      if (error) {
        toast.error("Failed to save changes");
        setSavingReview(false);
        return;
      }

      toast.success(
        `Accepted ${accepted.length} attribute(s), rejected ${rejected.length}`
      );
    } else {
      // All accepted — data already merged by the upload API
      toast.success(`Accepted all ${accepted.length} extracted attribute(s)`);
    }

    await loadProfile();
    setUploadStatus("idle");
    setExtractedFields([]);
    setExtractedData(null);
    setUploadResult(null);
    setSavingReview(false);
  }

  const allReviewed = extractedFields.length > 0 && extractedFields.every((f) => f.accepted !== null);
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
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-3 border-b border-border space-y-3">
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
                Activate Profile
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

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

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
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS.join(",")}
                onChange={handleFileSelect}
                className="hidden"
              />
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

          {/* Review Extracted Fields */}
          {uploadStatus === "review" && uploadResult && (
            <Card className="border-amber-500/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <CardTitle className="text-base">Extracted Attributes</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      setUploadStatus("idle");
                      setExtractedFields([]);
                      setExtractedData(null);
                      setUploadResult(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {uploadResult.summary && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {uploadResult.summary}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Bulk actions */}
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-xs text-muted-foreground">
                    {extractedFields.filter((f) => f.accepted === true).length} accepted,{" "}
                    {extractedFields.filter((f) => f.accepted === false).length} rejected,{" "}
                    {extractedFields.filter((f) => f.accepted === null).length} pending
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={acceptAll}>
                      Accept All
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={rejectAll}>
                      Reject All
                    </Button>
                  </div>
                </div>

                {/* Individual fields */}
                {extractedFields.map((field) => (
                  <div
                    key={field.key}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                      field.accepted === true
                        ? "border-green-500/30 bg-green-500/5"
                        : field.accepted === false
                          ? "border-destructive/30 bg-destructive/5"
                          : "border-border"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium">{field.label}</span>
                        <Badge
                          variant={
                            field.confidence === "high"
                              ? "success"
                              : field.confidence === "low"
                                ? "warning"
                                : "outline"
                          }
                          className="text-[10px] px-1.5 py-0"
                        >
                          {field.confidence}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {field.preview}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant={field.accepted === true ? "default" : "outline"}
                        size="icon"
                        className={cn(
                          "h-7 w-7",
                          field.accepted === true && "bg-green-600 hover:bg-green-700"
                        )}
                        onClick={() => setFieldAccepted(field.key, true)}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant={field.accepted === false ? "destructive" : "outline"}
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setFieldAccepted(field.key, false)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Save button */}
                <div className="pt-2">
                  <Button
                    className="w-full"
                    disabled={!allReviewed || savingReview}
                    onClick={saveReview}
                  >
                    {savingReview ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    {allReviewed
                      ? `Save (${extractedFields.filter((f) => f.accepted).length} accepted)`
                      : "Review all attributes to continue"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat messages */}
          {displayMessages.map((message) => (
            <div
              key={message.id}
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
          ))}

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
