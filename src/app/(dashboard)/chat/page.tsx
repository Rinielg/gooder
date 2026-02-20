"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Send, Square, Loader2, Bot, User, Save, Copy,
  Sparkles, Link2, Zap, ChevronDown, ChevronUp,
  AlertTriangle, RefreshCw, ShieldCheck, ShieldX,
  Layout, Type, Component, Check, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MemoizedMarkdown } from "./markdown-message";
import { toast } from "sonner";
import type { OutputType, AdherenceScore } from "@/types";

// ── Figma extraction types ──────────────────────────────────────────────
interface FigmaComponent {
  id: string;
  name: string;
  type: string;
  width?: number;
  height?: number;
}

interface FigmaText {
  id: string;
  name: string;
  characters: string;
  fontSize?: number;
  fontFamily?: string;
}

interface FigmaLayout {
  name: string;
  type: string;
  width: number;
  height: number;
  layoutMode?: string;
  itemSpacing?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  children: number;
}

interface FigmaExtraction {
  frameName: string;
  components: FigmaComponent[];
  texts: FigmaText[];
  layout: FigmaLayout;
}

const DIMENSION_LABELS: Record<string, string> = {
  voice_consistency: "Voice Consistency",
  tone_accuracy: "Tone Accuracy",
  compliance: "Compliance",
  terminology: "Terminology",
  platform_optimization: "Platform Optimization",
  objective_alignment: "Objective Alignment",
  pattern_adherence: "Pattern Adherence",
  overall_quality: "Overall Quality",
};

function scoreColor(score: number): string {
  if (score >= 8) return "text-green-600 dark:text-green-400";
  if (score >= 6) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function scoreBadgeVariant(score: number): "success" | "warning" | "destructive" {
  if (score >= 8) return "success";
  if (score >= 6) return "warning";
  return "destructive";
}

function scoreBarColor(score: number): string {
  if (score >= 8) return "bg-green-500";
  if (score >= 6) return "bg-yellow-500";
  return "bg-red-500";
}

interface ContentSection {
  title: string;
  body: string;
  raw: string;
}

/** Remove --- horizontal rules and the blank line above them */
function cleanHorizontalRules(text: string): string {
  return text.replace(/\n?\s*^---+\s*$/gm, "").replace(/\n{3,}/g, "\n\n");
}


function splitIntoSections(content: string): ContentSection[] {
  // Clean --- rules from the entire content first
  const cleaned = cleanHorizontalRules(content);

  // Split on ### headings (the AI output format uses ### for section headers)
  const parts = cleaned.split(/^###\s+/m);
  const sections: ContentSection[] = [];
  let hasGeneratedContent = false;

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // First line is the heading, rest is body
    const newlineIdx = trimmed.indexOf("\n");
    if (newlineIdx === -1) {
      const title = trimmed.replace(/\*+/g, "").trim();
      if (title === "Generated Content") hasGeneratedContent = true;
      sections.push({ title, body: "", raw: trimmed });
    } else {
      const title = trimmed.slice(0, newlineIdx).replace(/\*+/g, "").trim();
      const body = trimmed.slice(newlineIdx + 1).trim();
      if (title === "Generated Content") hasGeneratedContent = true;
      sections.push({ title, body, raw: `### ${trimmed}` });
    }
  }

  // If there's text before the first ###, include it as intro
  // But only if there's no explicit "Generated Content" section (avoid duplication — change 5)
  const beforeFirst = cleaned.split(/^###\s+/m)[0].trim();
  if (beforeFirst && sections.length > 0 && !hasGeneratedContent) {
    sections.unshift({ title: "", body: beforeFirst, raw: beforeFirst });
  }

  // If no sections were found, return whole content as one section
  if (sections.length === 0) {
    sections.push({ title: "", body: content, raw: content });
  }

  return sections;
}

/** Render text with **bold** support (change 2) */
function renderFormattedText(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function ChatPage() {
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  // Adherence scores keyed by message ID
  const [adherenceScores, setAdherenceScores] = useState<Record<string, AdherenceScore>>({});
  const [scoringIds, setScoringIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  // Track which message IDs we've already started scoring
  const scoredRef = useRef<Set<string>>(new Set());

  // Scroll lock detection
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Completion flash
  const [justCompletedId, setJustCompletedId] = useState<string | null>(null);
  const prevStatusRef = useRef<string>("idle");

  // Figma extraction state
  const [figmaExtraction, setFigmaExtraction] = useState<FigmaExtraction | null>(null);
  const [figmaLoading, setFigmaLoading] = useState(false);
  const [figmaError, setFigmaError] = useState<string | null>(null);
  // Confirmed Figma context to include in the next message
  const confirmedFigmaRef = useRef<string | null>(null);

  // Keep a ref so the transport body function always reads the latest value
  const profileIdRef = useRef<string | null>(null);
  profileIdRef.current = activeProfileId;

  // Read profile from localStorage on mount (SSR-safe — runs after hydration)
  useEffect(() => {
    const stored = localStorage.getItem("bvp_active_profile");
    if (stored) setActiveProfileId(stored);
  }, []);

  // Listen for profile changes from the sidebar (layout dispatches this event)
  useEffect(() => {
    function onProfileChange(e: Event) {
      const detail = (e as CustomEvent).detail as { profileId: string | null };
      setActiveProfileId(detail.profileId);
    }
    window.addEventListener("bvp-profile-change", onProfileChange);
    return () => window.removeEventListener("bvp-profile-change", onProfileChange);
  }, []);

  // Stable transport — body is a function so it always reads the latest values from refs
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => {
          const b: Record<string, unknown> = { profileId: profileIdRef.current };
          if (confirmedFigmaRef.current) {
            b.figmaContext = confirmedFigmaRef.current;
            confirmedFigmaRef.current = null; // Clear after sending
          }
          return b;
        },
      }),
    []
  );

  const { messages, sendMessage, status, stop } = useChat({
    transport,
    onError: (err) => {
      toast.error(err.message || "Failed to send message");
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Build display messages
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

  // ── Auto-score assistant messages once streaming finishes ────────────
  const scoreMessage = useCallback(
    async (messageId: string, content: string) => {
      if (!activeProfileId || !content.trim()) return;

      setScoringIds((prev) => new Set(prev).add(messageId));

      try {
        const res = await fetch("/api/adherence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            profileId: activeProfileId,
            contentType: "chat",
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("Adherence scoring failed:", err);
          return;
        }

        const score: AdherenceScore = await res.json();
        setAdherenceScores((prev) => ({ ...prev, [messageId]: score }));
      } catch (err) {
        console.error("Adherence scoring error:", err);
      } finally {
        setScoringIds((prev) => {
          const next = new Set(prev);
          next.delete(messageId);
          return next;
        });
      }
    },
    [activeProfileId]
  );

  useEffect(() => {
    // When not loading, check for assistant messages that haven't been scored yet
    if (isLoading) return;

    for (const msg of displayMessages) {
      if (
        msg.role === "assistant" &&
        msg.content &&
        !scoredRef.current.has(msg.id) &&
        !adherenceScores[msg.id] &&
        !scoringIds.has(msg.id)
      ) {
        scoredRef.current.add(msg.id);
        scoreMessage(msg.id, msg.content);
      }
    }
  }, [isLoading, displayMessages, adherenceScores, scoringIds, scoreMessage]);

  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, adherenceScores, isAtBottom]);

  // ── Toggle details expansion ────────────────────────────────────────
  function toggleExpand(messageId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) next.delete(messageId);
      else next.add(messageId);
      return next;
    });
  }

  // ── Regenerate with adherence feedback ──────────────────────────────
  function handleRegenerate(score: AdherenceScore) {
    const issues = score.flags
      .filter((f) => f.severity === "fail" || f.severity === "automatic_fail")
      .map((f) => f.issue)
      .join("; ");

    const allIssues = issues || score.suggestions.join("; ") || "low adherence scores";

    const prompt = `The previous output scored ${score.overall_score}/10. Issues: ${allIssues}. Please regenerate addressing these specific issues.`;
    sendMessage({ text: prompt });
  }

  // ── Figma extraction ───────────────────────────────────────────────
  async function extractFigma(url: string) {
    setFigmaLoading(true);
    setFigmaError(null);
    setFigmaExtraction(null);

    try {
      const res = await fetch("/api/figma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ figmaUrl: url }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        setFigmaError(err.error || `Failed (${res.status})`);
        return;
      }

      const data: FigmaExtraction = await res.json();
      setFigmaExtraction(data);
    } catch {
      setFigmaError("Failed to connect to Figma extraction service");
    } finally {
      setFigmaLoading(false);
    }
  }

  function confirmFigma() {
    if (!figmaExtraction) return;

    // Build a structured text representation for the system prompt
    const lines: string[] = [];
    lines.push(`Frame: ${figmaExtraction.frameName}`);
    lines.push(`Dimensions: ${figmaExtraction.layout.width}×${figmaExtraction.layout.height}`);
    if (figmaExtraction.layout.layoutMode) {
      lines.push(`Auto-layout: ${figmaExtraction.layout.layoutMode}, spacing: ${figmaExtraction.layout.itemSpacing ?? 0}px`);
      const pad = figmaExtraction.layout;
      if (pad.paddingTop || pad.paddingRight || pad.paddingBottom || pad.paddingLeft) {
        lines.push(`Padding: ${pad.paddingTop ?? 0} ${pad.paddingRight ?? 0} ${pad.paddingBottom ?? 0} ${pad.paddingLeft ?? 0}`);
      }
    }
    lines.push(`Direct children: ${figmaExtraction.layout.children}`);

    if (figmaExtraction.components.length > 0) {
      lines.push("\nComponents:");
      figmaExtraction.components.forEach((c) => {
        lines.push(`  - ${c.name} (${c.type}${c.width ? `, ${c.width}×${c.height}` : ""})`);
      });
    }

    if (figmaExtraction.texts.length > 0) {
      lines.push("\nText nodes:");
      figmaExtraction.texts.forEach((t) => {
        const meta = [t.fontFamily, t.fontSize ? `${t.fontSize}px` : null].filter(Boolean).join(", ");
        lines.push(`  - "${t.characters}"${meta ? ` (${meta})` : ""}`);
      });
    }

    confirmedFigmaRef.current = lines.join("\n");
    setFigmaExtraction(null);
    toast.success("Figma data attached — it will be included with your next message");
  }

  function dismissFigma() {
    setFigmaExtraction(null);
    setFigmaError(null);
  }

  // ── Input handling ──────────────────────────────────────────────────
  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    if (!activeProfileId) {
      toast.error("Please select a brand profile from the sidebar before generating content.");
      return;
    }

    // Detect [Figma: URL] pattern and auto-extract
    const figmaMatch = input.match(/\[Figma:\s*(https:\/\/[^\]]+)\]/);
    if (figmaMatch && !confirmedFigmaRef.current && !figmaExtraction) {
      extractFigma(figmaMatch[1]);
      // Don't send yet — wait for user to confirm/dismiss the extraction
      return;
    }

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

  function handleScroll() {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setIsAtBottom(scrollHeight - clientHeight - scrollTop < 50);
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsAtBottom(true);
  }

  useEffect(() => {
    if (prevStatusRef.current === "streaming" && status === "ready") {
      const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
      if (lastAssistant) {
        setJustCompletedId(lastAssistant.id);
        setTimeout(() => setJustCompletedId(null), 1000);
      }
    }
    prevStatusRef.current = status;
  }, [status, messages]);

  // ── Save output with adherence score ────────────────────────────────
  async function saveOutput(messageId: string, messageContent: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: membership } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (!membership) return;

      let outputType: OutputType = "ux_journey";
      const lower = messageContent.toLowerCase();
      if (lower.includes("subject line") || lower.includes("email")) outputType = "email";
      else if (lower.includes("sms") || lower.includes("160")) outputType = "sms";
      else if (lower.includes("push notification") || lower.includes("push copy")) outputType = "push";

      const score = adherenceScores[messageId] ?? null;

      const { error } = await supabase.from("saved_outputs").insert({
        workspace_id: membership.workspace_id,
        brand_profile_id: activeProfileId,
        type: outputType,
        title: `Generated ${outputType.replace("_", " ")} — ${new Date().toLocaleDateString()}`,
        content: { raw: messageContent },
        adherence_score: score,
        created_by: user.id,
      });

      if (error) throw error;
      toast.success("Output saved to library");
    } catch {
      toast.error("Failed to save output");
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">Brand Voice Assistant</h1>
            <p className="text-xs text-muted-foreground">
              {activeProfileId ? "Profile active" : "No profile selected — select one to start"}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          <Zap className="w-3 h-3 mr-1" />
          Auto Model
        </Badge>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto relative"
      >
        <div className="w-[70vw] mx-auto py-8 space-y-8">
          {displayMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Brand Voice Assistant</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                {activeProfileId
                  ? "Generate brand-consistent content for UX journeys, emails, SMS, and push notifications."
                  : "Select a brand profile from the sidebar to start generating brand-consistent content."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  "Write onboarding flow copy for a new user",
                  "Create a tier upgrade email for VIP members",
                  "Generate error messages for payment failures",
                  "Write push notifications for a flash sale",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="text-left p-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {displayMessages.map((message) => {
            const score = adherenceScores[message.id];
            const isScoring = scoringIds.has(message.id);
            const isExpanded = expandedIds.has(message.id);

            return (
              <div key={message.id} className="space-y-2">
                {/* Message bubble — Phase 6 redesign */}
                <div
                  className={cn(
                    "flex flex-col gap-1 message-appear",
                    message.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  {/* Sender label */}
                  <span className="text-xs font-medium text-muted-foreground px-1">
                    {message.role === "user" ? "You" : "Gooder"}
                  </span>

                  {/* Message card */}
                  <div
                    className={cn(
                      "rounded-xl px-4 py-3 max-w-[80%]",
                      message.role === "user"
                        ? "bg-zinc-100 text-foreground"
                        : cn(
                            "bg-white border border-border shadow-elevation-1",
                            justCompletedId === message.id && "animate-message-flash"
                          )
                    )}
                  >
                    {message.role === "user" ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <MemoizedMarkdown content={message.content} id={message.id} />
                    )}
                  </div>

                  {/* Save + Copy buttons — always visible below AI card, left-aligned */}
                  {message.role === "assistant" && message.content && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => saveOutput(message.id, message.content)}
                        className="flex items-center gap-1 px-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Save response"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(message.content);
                          toast.success("Copied to clipboard");
                        }}
                        className="flex items-center gap-1 px-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Copy response"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </button>
                    </div>
                  )}
                </div>

                {/* PHASE 7: Adherence score card (assistant messages only) */}
                {message.role === "assistant" && message.content && (
                  <div className="ml-0">
                    {isScoring && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Scoring adherence...
                      </div>
                    )}

                    {score && (
                      <div className="rounded-lg border border-border bg-card/50 overflow-hidden">
                        {/* Compact header row */}
                        <button
                          onClick={() => toggleExpand(message.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-accent/50 transition-colors"
                        >
                          {score.pass ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          ) : (
                            <ShieldX className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                          )}
                          <Badge
                            variant={scoreBadgeVariant(score.overall_score)}
                            className="text-[10px] px-1.5 py-0"
                          >
                            {score.overall_score.toFixed(1)}
                          </Badge>
                          <span className={cn("font-medium", score.pass ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                            {score.pass ? "Pass" : "Fail"}
                          </span>
                          {score.flags.filter((f) => f.severity === "automatic_fail" || f.severity === "fail").length > 0 && (
                            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                              <AlertTriangle className="w-3 h-3" />
                              {score.flags.filter((f) => f.severity === "automatic_fail" || f.severity === "fail").length} issue(s)
                            </span>
                          )}
                          <span className="ml-auto text-muted-foreground">
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </span>
                        </button>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="px-3 pb-3 space-y-3 border-t border-border">
                            {/* Dimension scores */}
                            <div className="grid grid-cols-2 gap-3 pt-3">
                              {(Object.entries(score.scores) as [string, { score: number; weight: number; notes: string; flags: any[] }][]).map(
                                ([key, dim]) => (
                                  <div key={key} className="group/dim rounded-lg border border-border bg-card p-3">
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-[11px] font-medium text-foreground">
                                        {DIMENSION_LABELS[key] || key}
                                      </span>
                                      <span className={cn("text-[11px] font-semibold tabular-nums", scoreColor(dim.score))}>
                                        {dim.score.toFixed(1)}
                                      </span>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                                      <div
                                        className={cn("h-full rounded-full transition-all", scoreBarColor(dim.score))}
                                        style={{ width: `${dim.score * 10}%` }}
                                      />
                                    </div>
                                    {dim.notes && (
                                      <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">{dim.notes}</p>
                                    )}
                                    <div className="flex items-center gap-1 opacity-0 group-hover/dim:opacity-100 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-[10px] px-2"
                                        onClick={() => saveOutput(message.id, `${DIMENSION_LABELS[key] || key}: ${dim.score.toFixed(1)}/10\n${dim.notes || ""}`)}
                                      >
                                        <Save className="w-2.5 h-2.5 mr-1" />
                                        Save
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-[10px] px-2"
                                        onClick={() => {
                                          const text = `${DIMENSION_LABELS[key] || key}: ${dim.score.toFixed(1)}/10${dim.notes ? `\n${dim.notes}` : ""}${dim.flags?.length ? `\nFlags: ${dim.flags.map((f: any) => f.issue).join("; ")}` : ""}`;
                                          navigator.clipboard.writeText(text);
                                          toast.success(`${DIMENSION_LABELS[key] || key} copied`);
                                        }}
                                      >
                                        <Copy className="w-2.5 h-2.5 mr-1" />
                                        Copy
                                      </Button>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>

                            {/* Compliance flags */}
                            {score.flags.filter((f) => f.severity === "automatic_fail" || f.severity === "fail").length > 0 && (
                              <div className="space-y-1.5">
                                <p className="text-[11px] font-medium text-red-600 dark:text-red-400">Compliance Issues</p>
                                {score.flags
                                  .filter((f) => f.severity === "automatic_fail" || f.severity === "fail")
                                  .map((flag, i) => (
                                    <div
                                      key={i}
                                      className="flex items-start gap-2 p-2 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900"
                                    >
                                      <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                                      <div className="min-w-0">
                                        <p className="text-[11px] font-medium text-red-700 dark:text-red-300">
                                          {flag.issue}
                                        </p>
                                        {flag.suggestion && (
                                          <p className="text-[10px] text-red-600/70 dark:text-red-400/70 mt-0.5">
                                            {flag.suggestion}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}

                            {/* Warnings */}
                            {score.flags.filter((f) => f.severity === "warning").length > 0 && (
                              <div className="space-y-1">
                                {score.flags
                                  .filter((f) => f.severity === "warning")
                                  .map((flag, i) => (
                                    <div
                                      key={i}
                                      className="flex items-start gap-2 p-2 rounded bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900"
                                    >
                                      <AlertTriangle className="w-3 h-3 text-yellow-500 flex-shrink-0 mt-0.5" />
                                      <p className="text-[11px] text-yellow-700 dark:text-yellow-300">{flag.issue}</p>
                                    </div>
                                  ))}
                              </div>
                            )}

                            {/* Suggestions */}
                            {score.suggestions.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-[11px] font-medium text-muted-foreground">Suggestions</p>
                                <ul className="space-y-0.5">
                                  {score.suggestions.map((s, i) => (
                                    <li key={i} className="text-[11px] text-muted-foreground pl-3 relative before:content-['•'] before:absolute before:left-0">
                                      {s}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Regenerate button on fail */}
                            {!score.pass && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full h-7 text-xs border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                                onClick={() => handleRegenerate(score)}
                                disabled={isLoading}
                              >
                                <RefreshCw className="w-3 h-3 mr-1.5" />
                                Regenerate with feedback
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {status === "submitted" && (
            displayMessages.length === 0 || displayMessages[displayMessages.length - 1]?.role !== "assistant"
          ) && (
            <div className="flex flex-col items-start gap-1 message-appear">
              <span className="text-xs font-medium text-muted-foreground px-1">Gooder</span>
              <div className="bg-white border border-border rounded-xl shadow-elevation-1 px-4 py-3">
                <div
                  className="flex items-center gap-1.5"
                  aria-label="Gooder is typing"
                  role="status"
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-muted-foreground/50 typing-dot"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

      </div>

      {/* Jump to bottom — fixed, centered, 10px above input box */}
      {!isAtBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-[148px] left-0 right-0 mx-auto w-fit z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border shadow-elevation-2 text-xs text-muted-foreground hover:text-foreground hover:shadow-elevation-3 transition-all animate-fade-in"
          aria-label="Jump to bottom"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          Jump to bottom
        </button>
      )}

      {/* Figma extraction preview */}
      {(figmaLoading || figmaExtraction || figmaError) && (
        <div className="border-t border-border bg-background">
          <div className="max-w-3xl mx-auto px-4 py-3">
            {figmaLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting Figma frame data...
              </div>
            )}

            {figmaError && (
              <div className="flex items-center justify-between rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-3">
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {figmaError}
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={dismissFigma}>
                  Dismiss
                </Button>
              </div>
            )}

            {figmaExtraction && (
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layout className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{figmaExtraction.frameName}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {figmaExtraction.layout.width}×{figmaExtraction.layout.height}
                      </Badge>
                      {figmaExtraction.layout.layoutMode && (
                        <Badge variant="secondary" className="text-[10px]">
                          {figmaExtraction.layout.layoutMode}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="default"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={confirmFigma}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Use this data
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={dismissFigma}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Components */}
                  {figmaExtraction.components.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5 text-muted-foreground font-medium">
                        <Component className="w-3 h-3" />
                        Components ({figmaExtraction.components.length})
                      </div>
                      <ul className="space-y-0.5">
                        {figmaExtraction.components.slice(0, 8).map((c) => (
                          <li key={c.id} className="text-muted-foreground truncate">
                            {c.name} <span className="opacity-60">({c.type})</span>
                          </li>
                        ))}
                        {figmaExtraction.components.length > 8 && (
                          <li className="text-muted-foreground/60">
                            +{figmaExtraction.components.length - 8} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Text nodes */}
                  {figmaExtraction.texts.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5 text-muted-foreground font-medium">
                        <Type className="w-3 h-3" />
                        Text nodes ({figmaExtraction.texts.length})
                      </div>
                      <ul className="space-y-0.5">
                        {figmaExtraction.texts.slice(0, 8).map((t) => (
                          <li key={t.id} className="text-muted-foreground truncate">
                            &quot;{t.characters}&quot;
                            {t.fontSize && <span className="opacity-60"> ({t.fontSize}px)</span>}
                          </li>
                        ))}
                        {figmaExtraction.texts.length > 8 && (
                          <li className="text-muted-foreground/60">
                            +{figmaExtraction.texts.length - 8} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {figmaExtraction.components.length === 0 && figmaExtraction.texts.length === 0 && (
                    <p className="text-muted-foreground col-span-2">
                      No components or text nodes found in this frame.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input — sticky floating at bottom */}
      <div className="sticky bottom-0 z-10 flex justify-center pointer-events-none pb-4">
        <form onSubmit={handleSubmit} className="w-[50vw] pointer-events-auto bg-background rounded-2xl border border-border shadow-elevation-4 px-6 py-4">
          {/* Textarea container with send button inside */}
          <div className="relative rounded-xl border border-border bg-card focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background transition-shadow">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={
                activeProfileId
                  ? "Describe the content you need..."
                  : "Select a brand profile to start..."
              }
              rows={1}
              className="w-full resize-none bg-transparent text-sm focus:outline-none min-h-[44px] max-h-[200px] py-3 pl-4 pr-14 leading-relaxed"
            />
            {/* Send / Stop button — anchored inside textarea, bottom-right */}
            <div className="absolute bottom-2 right-2">
              <Button
                type={isLoading ? "button" : "submit"}
                size="icon"
                onClick={isLoading ? stop : undefined}
                className={cn(
                  "h-8 w-8 flex-shrink-0 transition-colors",
                  isLoading
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : !input.trim() || !activeProfileId
                    ? "opacity-40"
                    : ""
                )}
                disabled={!isLoading && (!input.trim() || !activeProfileId)}
                aria-label={isLoading ? "Stop generation" : "Send message"}
              >
                {isLoading ? (
                  <Square className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Accessory row: Figma button left, hint text right */}
          <div className="flex items-center justify-between mt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              title="Attach Figma URL"
              onClick={() => {
                const url = prompt("Paste a Figma frame URL:");
                if (url) setInput(input + (input ? "\n" : "") + `[Figma: ${url}]`);
              }}
            >
              <Link2 className="h-3.5 w-3.5 mr-1" />
              Figma
            </Button>
            <p className="text-xs text-muted-foreground">
              <kbd className="font-sans">⌘</kbd>+<kbd className="font-sans">↵</kbd> to send
              <span className="mx-1.5 opacity-40">·</span>
              AI-generated content — review before publishing
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
