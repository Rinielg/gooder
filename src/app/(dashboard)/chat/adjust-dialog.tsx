"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AdjustTarget, OUTPUT_TYPE_CONFIG } from "./output-card";

// ── AdjustDialog ──────────────────────────────────────────────────────────────
//
// Floating panel that appears above the chat input when the user clicks Adjust
// on an output card section. Manages its own textarea text state so per-keystroke
// value changes do NOT reach page.tsx — preventing message list re-renders.
//
// Critical: text state lives here (not in page.tsx). page.tsx only holds the
// open/closed AdjustTarget. See research pitfall 5.

interface AdjustDialogProps {
  target: AdjustTarget;
  onSubmit: (text: string) => void;
  onClose: () => void;
}

export function AdjustDialog({ target, onSubmit, onClose }: AdjustDialogProps) {
  // Internal state — per-keystroke value STAYS INSIDE this component.
  // Do NOT expose as a controlled prop. This prevents message list re-renders.
  const [text, setText] = useState("");

  // Autofocus on mount only (empty deps array)
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const config = OUTPUT_TYPE_CONFIG[target.outputType];

  function handleSubmit() {
    const trimmed = text.trim();
    if (trimmed) {
      onSubmit(trimmed);
      setText("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    // Shift+Enter falls through — browser inserts newline naturally
  }

  return (
    <div className="w-[50vw] bg-background border border-border rounded-2xl shadow-elevation-3 px-4 py-3 space-y-3">
      {/* Header row — shows which output type and section title is being adjusted */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium text-muted-foreground flex-shrink-0">
            Adjusting:
          </span>
          <Badge className={cn("text-xs border flex-shrink-0", config.badgeClass)}>
            {config.label}
          </Badge>
          <span className="text-xs text-muted-foreground truncate">
            {target.sectionTitle}
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors ml-2"
          aria-label="Close adjust panel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Input row — textarea + Send button side by side */}
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What changes do you want? (Enter to send, Shift+Enter for newline)"
          rows={2}
          className="flex-1 resize-none bg-transparent text-sm focus:outline-none border border-border rounded-lg px-3 py-2 leading-relaxed"
        />
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="h-9 flex-shrink-0"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
