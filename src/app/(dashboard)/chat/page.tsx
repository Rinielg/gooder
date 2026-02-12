"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/shared";
import {
  Send, Loader2, Bot, User, Save,
  Sparkles, Link2, Zap,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { OutputType } from "@/types";

export default function ChatPage() {
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const stored = localStorage.getItem("bvp_active_profile");
    if (stored) setActiveProfileId(stored);
  }, []);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        profileId: activeProfileId,
      },
    }),
    onError: (err) => {
      toast.error(err.message || "Failed to send message");
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  async function saveOutput(messageContent: string) {
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

      const { error } = await supabase.from("saved_outputs").insert({
        workspace_id: membership.workspace_id,
        brand_profile_id: activeProfileId,
        type: outputType,
        title: `Generated ${outputType.replace("_", " ")} — ${new Date().toLocaleDateString()}`,
        content: { raw: messageContent },
        created_by: user.id,
      });

      if (error) throw error;
      toast.success("Output saved to library");
    } catch {
      toast.error("Failed to save output");
    }
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
              {activeProfileId ? "Profile active" : "No profile selected — using general mode"}
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
                Generate brand-consistent content for UX journeys, emails, SMS, and push notifications.
                {!activeProfileId && " Select a brand profile from the sidebar to get started."}
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

          {displayMessages.map((message) => (
            <div
              key={message.id}
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
                      onClick={() => saveOutput(message.content)}
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
          ))}

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
              placeholder="Describe the content you need..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm focus:outline-none min-h-[40px] max-h-[200px] py-2 px-2"
              disabled={isLoading}
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
                disabled={!input.trim() || isLoading}
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
