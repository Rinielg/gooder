"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/shared";
import {
  Send, Loader2, Bot, User, Save,
  Sparkles, Link2, Zap, ChevronDown, ChevronUp,
  AlertTriangle, RefreshCw, ShieldCheck, ShieldX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { OutputType, AdherenceScore } from "@/types";

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

export default function ChatPage() {
  const [activeProfileId, setActiveProfileId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("bvp_active_profile");
    }
    return null;
  });
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

  // Keep a ref so the transport body function always reads the latest value
  const profileIdRef = useRef<string | null>(activeProfileId);
  profileIdRef.current = activeProfileId;

  // Listen for profile changes from the sidebar (layout dispatches this event)
  useEffect(() => {
    function onProfileChange(e: Event) {
      const detail = (e as CustomEvent).detail as { profileId: string | null };
      setActiveProfileId(detail.profileId);
    }
    window.addEventListener("bvp-profile-change", onProfileChange);
    return () => window.removeEventListener("bvp-profile-change", onProfileChange);
  }, []);

  // Stable transport — body is a function so it always reads the latest profileId from the ref
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ profileId: profileIdRef.current }),
      }),
    []
  );

  const { messages, sendMessage, status } = useChat({
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, adherenceScores]);

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

  // ── Input handling ──────────────────────────────────────────────────
  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    if (!activeProfileId) {
      toast.error("Please select a brand profile from the sidebar before generating content.");
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
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {displayMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Bot className="w-8 h-8 text-primary" />
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
                {/* Message bubble */}
                <div
                  className={cn(
                    "flex gap-3 message-appear",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-primary" />
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
                    {message.role === "assistant" && message.content && (
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => saveOutput(message.id, message.content)}
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(message.content);
                            toast.success("Copied to clipboard");
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Adherence score card (assistant messages only) */}
                {message.role === "assistant" && message.content && (
                  <div className="ml-11">
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
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3">
                              {(Object.entries(score.scores) as [string, { score: number; weight: number; notes: string; flags: any[] }][]).map(
                                ([key, dim]) => (
                                  <div key={key} className="flex items-center gap-2">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-[11px] text-muted-foreground truncate">
                                          {DIMENSION_LABELS[key] || key}
                                        </span>
                                        <span className={cn("text-[11px] font-semibold tabular-nums", scoreColor(dim.score))}>
                                          {dim.score.toFixed(1)}
                                        </span>
                                      </div>
                                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                                        <div
                                          className={cn("h-full rounded-full transition-all", scoreBarColor(dim.score))}
                                          style={{ width: `${dim.score * 10}%` }}
                                        />
                                      </div>
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

          {isLoading && (displayMessages.length === 0 || displayMessages[displayMessages.length - 1]?.role === "user") && (
            <div className="flex gap-3 message-appear">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-card border border-border rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
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
              placeholder={activeProfileId ? "Describe the content you need..." : "Select a brand profile to start..."}
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm focus:outline-none min-h-[40px] max-h-[200px] py-2 px-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading || !activeProfileId}
            />
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                title="Attach Figma URL"
                onClick={() => {
                  const url = prompt("Paste a Figma frame URL:");
                  if (url) setInput(input + (input ? "\n" : "") + `[Figma: ${url}]`);
                }}
              >
                <Link2 className="h-4 w-4" />
              </Button>
              <Button
                type="submit"
                size="icon"
                className="h-9 w-9"
                disabled={!input.trim() || isLoading || !activeProfileId}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Content generated by AI. Always review before publishing.
          </p>
        </form>
      </div>
    </div>
  );
}
