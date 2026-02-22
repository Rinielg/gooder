"use client";

import { memo, useMemo, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ShikiHighlighter, { isInlineCode } from "react-shiki";
import { Copy, Check, ChevronDown } from "lucide-react";
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

// ── parseMarkdownBlocks ─────────────────────────────────────────────────────
// Splits markdown content into paragraph-level blocks for memoization.
// Each empty line creates a new block boundary.

function parseMarkdownBlocks(content: string): string[] {
  const lines = content.split("\n");
  const blocks: string[] = [];
  let current = "";

  for (const line of lines) {
    current += line + "\n";
    if (line === "") {
      blocks.push(current);
      current = "";
    }
  }
  if (current.trim()) blocks.push(current);
  return blocks;
}

// ── MARKDOWN_COMPONENTS ─────────────────────────────────────────────────────
// Defined at module scope to prevent new object reference on every render.

const MARKDOWN_COMPONENTS = {
  code: CodeBlock,
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
  ),
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-xl font-semibold mb-3 mt-4 first:mt-0">{children}</h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h3>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground mb-3">
      {children}
    </blockquote>
  ),
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
    <a
      href={href}
      className="text-primary underline underline-offset-2 hover:no-underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold">{children}</strong>
  ),
} as Parameters<typeof Markdown>[0]["components"];

// ── MarkdownBlock ───────────────────────────────────────────────────────────
// Memoized single block — custom equality prevents re-render when content
// is unchanged (critical for streaming performance).

const MarkdownBlock = memo(
  function MarkdownBlock({ content }: { content: string }) {
    return (
      <Markdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
        {content}
      </Markdown>
    );
  },
  (prev, next) => prev.content === next.content
);

// ── MemoizedMarkdown ────────────────────────────────────────────────────────
// Exported container that splits content into blocks and memoizes each one.
// The id prop is used in block keys to prevent stale key issues across messages.

export const MemoizedMarkdown = memo(
  function MemoizedMarkdown({ content, id }: { content: string; id: string }) {
    const blocks = useMemo(() => parseMarkdownBlocks(content), [content]);

    return (
      <div className="text-sm">
        {blocks.map((block, i) => (
          <MarkdownBlock key={`${id}-block-${i}`} content={block} />
        ))}
      </div>
    );
  }
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";

// ── Section splitter ─────────────────────────────────────────────────────────
// Splits AI response by ### headings into titled sections.

interface MessageSection {
  title: string;
  body: string;
}

function splitSections(content: string): MessageSection[] {
  const cleaned = content.replace(/\n?\s*^---+\s*$/gm, "").replace(/\n{3,}/g, "\n\n");
  const parts = cleaned.split(/^###\s+/m);
  const sections: MessageSection[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const nl = trimmed.indexOf("\n");
    if (nl === -1) {
      sections.push({ title: trimmed.replace(/\*+/g, "").trim(), body: "" });
    } else {
      sections.push({
        title: trimmed.slice(0, nl).replace(/\*+/g, "").trim(),
        body: trimmed.slice(nl + 1).trim(),
      });
    }
  }

  const beforeFirst = cleaned.split(/^###\s+/m)[0].trim();
  if (beforeFirst && sections.length > 0) {
    sections.unshift({ title: "", body: beforeFirst });
  }

  return sections.length ? sections : [{ title: "", body: content }];
}

// Section type detection — analysis sections get accordion treatment
const ANALYSIS_RE = /^(tone|adherence|compliance|objective|suggestion|score|note|summary|brand\s+voice|voice|quality)/i;

// ── ContentSection ───────────────────────────────────────────────────────────
// Visual card for UX journey screens, steps, and platforms.

function ContentSection({ title, body, id }: { title: string; body: string; id: string }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {title && (
        <div className="px-3 py-2 bg-accent/40 border-b border-border">
          <span className="text-xs font-semibold text-foreground">{title}</span>
        </div>
      )}
      {body && (
        <div className="px-3 py-3">
          <MemoizedMarkdown content={body} id={id} />
        </div>
      )}
    </div>
  );
}

// ── AnalysisSection ──────────────────────────────────────────────────────────
// Accordion card for Tone, Adherence, Compliance, Objectives, Suggestions, etc.

function AnalysisSection({ title, body, id }: { title: string; body: string; id: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 bg-primary/5 hover:bg-primary/10 transition-colors text-left"
      >
        <span className="text-xs font-semibold text-foreground">{title}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 flex-shrink-0",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          {body && (
            <div className="px-3 py-3 border-t border-border">
              <MemoizedMarkdown content={body} id={id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SectionedMessage ─────────────────────────────────────────────────────────
// Renders AI responses with ### headings as individual containers.
// Content sections (Screen, Step, Platform) → visual card.
// Analysis sections (Tone, Adherence, Compliance, etc.) → collapsible accordion.
// Responses with no ### headings fall back to plain MemoizedMarkdown.

export function SectionedMessage({ content, id }: { content: string; id: string }) {
  const sections = useMemo(() => splitSections(content), [content]);

  const titledCount = sections.filter((s) => s.title).length;

  // Single block or no titled sections — plain rendering
  if (titledCount < 2) {
    return <MemoizedMarkdown content={content} id={id} />;
  }

  return (
    <div className="space-y-2">
      {sections.map((section, i) => {
        // Untitled intro block — render inline
        if (!section.title) {
          return section.body ? (
            <div key={`${id}-intro`} className="text-sm">
              <MemoizedMarkdown content={section.body} id={`${id}-intro`} />
            </div>
          ) : null;
        }

        const sectionId = `${id}-s${i}`;
        return ANALYSIS_RE.test(section.title) ? (
          <AnalysisSection key={sectionId} title={section.title} body={section.body} id={sectionId} />
        ) : (
          <ContentSection key={sectionId} title={section.title} body={section.body} id={sectionId} />
        );
      })}
    </div>
  );
}
