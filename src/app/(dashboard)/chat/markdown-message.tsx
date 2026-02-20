"use client";

import { memo, useMemo, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ShikiHighlighter, { isInlineCode } from "react-shiki";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CodeBlock({
  className,
  children,
  node,
  ...props
}: React.ComponentPropsWithoutRef<"code"> & { node?: unknown }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match?.[1];
  const inline = node ? isInlineCode(node as Parameters<typeof isInlineCode>[0]) : !match;

  if (inline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-[0.85em] font-mono"
        {...props}
      >
        {children}
      </code>
    );
  }

  const code = String(children).trim();

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative my-3 rounded-lg border border-zinc-200 bg-zinc-50 overflow-hidden">
      {/* Code block chrome: language label top-left, copy button top-right */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-100/80 border-b border-zinc-200">
        <span className="text-xs font-mono text-zinc-500">{language ?? "text"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
          aria-label="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <ShikiHighlighter
        language={language ?? "text"}
        theme="github-light"
        className={cn("text-sm !bg-zinc-50")}
      >
        {code}
      </ShikiHighlighter>
    </div>
  );
}
