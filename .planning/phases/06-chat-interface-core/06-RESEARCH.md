# Phase 6: Chat Interface Core - Research

**Researched:** 2026-02-20
**Domain:** React chat UI — streaming markdown, scroll behavior, input design, animation
**Confidence:** HIGH (codebase verified + official SDK types + official docs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Phase Boundary:** Redesign the chat page's visual layer only. Streaming logic (`useChat()`, `sendMessage`, `DefaultChatTransport`), data fetching, and business behavior are untouched. Phase 7 handles scoring cards and Figma extraction UI.

**Message Layout & Visual Distinction:**
- Opposite-side alignment: user messages right-aligned, AI responses left-aligned
- Both sides use a subtle card/surface with moderate border-radius and a light background fill — not pill bubbles
- User message surface: zinc/neutral (light gray card)
- AI response surface: white card with a soft shadow — elevated feel, AI responses as primary content
- Sender label only — "You" above user turns, "Gooder" above AI turns — no avatar images
- Generous spacing between turns: 32px+ between message groups
- Max width for both sides: ~80% of the chat content area

**Streaming & Scroll Behavior:**
- Pre-first-token indicator: typing indicator — animated bouncing dots inside an AI card (iMessage-style)
- Streaming cursor: pulsing ellipsis (...) appended after the last token during generation
- After streaming: brief highlight flash on the completed message card to signal completion, then copy button fades in
- Chat area width: full width of the content area (no max-width column constraint on the chat container itself)
- Auto-scroll during streaming; when user scrolls up, pause auto-scroll and show a "Jump to bottom" button anchored to the bottom-right corner of the message list
- During streaming: send button transforms into a stop/cancel button to cancel generation mid-stream
- Input area and the stop button are not disabled during streaming — user can cancel

**Markdown & Code Rendering:**
- Markdown renders live during streaming (not deferred to completion)
- Code blocks: light-themed (no dark background) with syntax highlighting
- Code block chrome: language label in the top-left, copy button in the top-right (GitHub/VS Code style)
- Message-level copy button: positioned below the message, left-aligned with the card — always visible, no hover required

**Input Area Design:**
- Textarea auto-resizes as user types — starts as single line, grows to a max height then scrolls internally
- Send button sits inside the textarea, anchored to the bottom-right corner (compact, like ChatGPT)
- Subtle "Cmd+Enter to send" hint displayed below the textarea in small gray text — always visible
- Input area is sticky — always visible at the bottom of the viewport regardless of scroll position

### Claude's Discretion
- Exact timing and easing of the typing indicator animation
- Specific shadow values for AI response cards (should align to existing elevation tokens)
- Max height before textarea scrolls internally
- Exact color of the completion highlight flash (should be brief and subtle)
- Spacing tokens used between sender label and message card
- Exact border-radius values (should align to established card patterns)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope. Scoring cards and Figma extraction UI are Phase 7 per the roadmap.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CHAT-01 | Chat message layout redesigned with new card/typography components | Message card architecture pattern; sender label + card surface; opposite-side alignment with `justify-end`/`justify-start` |
| CHAT-02 | Streaming text rendering preserved with smooth token-by-token display | `react-markdown` with memoization pattern; existing `useChat()` / `sendMessage` preserved; `status` === 'streaming' detection |
| CHAT-03 | Streaming cursor animation preserved or improved | CSS `::after` pulsing ellipsis replacing current `▋` cursor; keyframe animation in globals.css already exists as baseline |
| CHAT-04 | Auto-scroll behavior maintained during streaming | `scrollIntoView` ref pattern already in page + IntersectionObserver for "user scrolled up" detection; `isAtBottom` state + `messagesEndRef` anchor |
| CHAT-05 | Markdown rendering in AI responses with proper heading, list, and code formatting | `react-markdown` + `remark-gfm` + `react-shiki` for light-themed syntax highlighting; custom `components` map |
| CHAT-06 | Copy-to-clipboard button on AI-generated messages | `navigator.clipboard.writeText()` already used; new: always-visible placement below message card; `sonner` toast already installed |
| CHAT-11 | Chat input area restyled with new components (textarea, send button) | Auto-resize textarea pattern from existing page; send-inside-textarea layout; stop button as transform of send button during streaming |
</phase_requirements>

---

## Summary

Phase 6 is a visual-layer replacement of `src/app/(dashboard)/chat/page.tsx` (1012 lines). The file is large because it contains two conceptually separate concerns: (1) the chat UI core covered in Phase 6, and (2) scoring cards and Figma extraction UI deferred to Phase 7. The implementation approach is to surgically extract all non-visual logic into clean state/hooks, then rebuild the render output using the existing design system tokens and two new libraries.

The two critical library additions are `react-markdown` + `remark-gfm` for markdown rendering, and `react-shiki` for streaming-safe syntax highlighting. Both must be installed — neither is currently in `package.json`. The existing page already has the right hooks (`useChat`, `sendMessage`, `status`) and the SDK version (`ai@6.0.81`, `@ai-sdk/react@3.0.83`) exposes `stop()` directly on the `useChat` return value via `AbstractChat`. All streaming logic is preserved verbatim; only the JSX render tree changes.

The key architectural risk is the scroll system. The current page uses a simple `messagesEndRef.scrollIntoView` pattern that scrolls unconditionally. Phase 6 requires pausing auto-scroll when the user scrolls up — which requires an `isAtBottom` state + `onScroll` handler + IntersectionObserver-or-threshold detection on the scroll container. The chat container is `flex-1 overflow-y-auto` inside a layout where `main` is also `overflow-y-auto` — the scroll target is the inner container, not the window.

**Primary recommendation:** Install `react-markdown@^10` + `remark-gfm@^4` + `react-shiki@^0.9` and rebuild the page JSX using the existing shadcn Card system and design tokens. Preserve all hooks/callbacks verbatim. Extract scoring card and Figma extraction JSX into commented-out or placeholder blocks for Phase 7.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react-markdown` | `^10.1.0` | Render markdown string to React elements during streaming | Safe (no `dangerouslySetInnerHTML`), ESM, unified plugin ecosystem, standard for AI chat UIs |
| `remark-gfm` | `^4.0.1` | GitHub Flavored Markdown: tables, strikethrough, tasklists | Required plugin for GFM; without it, tables and tasklists don't render |
| `react-shiki` | `^0.9.1` | Client-side syntax highlighting with streaming support | Shiki-powered, designed for streaming LLM output, supports `github-light` theme, shows language label built-in |

### Already Installed (use these, don't add)
| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `@ai-sdk/react` | `3.0.83` | `useChat()` hook with `stop()` | `stop()` is on `UseChatHelpers` via `AbstractChat` pick |
| `ai` | `6.0.81` | `ChatStatus` type, `DefaultChatTransport` | `ChatStatus = 'submitted' \| 'streaming' \| 'ready' \| 'error'` |
| `framer-motion` | `12.34.0` | Available for animations (typing dots, fade-in) | Already in package.json; not currently used in chat — use CSS keyframes for perf |
| `tailwindcss-animate` | `1.0.7` | Tailwind animation utilities | Already in tailwind.config.ts as plugin |
| `lucide-react` | `0.563.0` | Icons: `Square` for stop, `Copy`, `ChevronDown` for jump-to-bottom | Already imported in the page |
| `sonner` | `2.0.7` | Toast for copy confirmation | Already imported |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `react-shiki` | `react-syntax-highlighter` (Prism) | Legacy, large bundle, no streaming support — avoid |
| `react-shiki` | `@shikijs/rehype` | Pipeline-only, no streaming support — avoid |
| `react-markdown` | `streamdown` (Vercel) | Vercel-built, streaming-optimized, but low adoption (launched ~2025) and overkill given memoization solves the same problem |
| CSS keyframes (typing dots) | `framer-motion` | framer-motion is available but adds overhead for 3 bouncing dots; pure CSS is sufficient and already used in the codebase (`message-appear`) |

**Installation:**
```bash
npm install react-markdown remark-gfm react-shiki
```

---

## Architecture Patterns

### Recommended File Structure

The current chat page is 1012 lines and will remain a single file for Phase 6 (per precedent of other pages in this project). However, markdown rendering should be extracted to a sibling component file to enable memoization.

```
src/app/(dashboard)/chat/
├── page.tsx                    # Main page (trimmed to ~600 lines after Phase 6)
└── markdown-message.tsx        # MemoizedMarkdown + CodeBlock component (new)

src/components/ui/
└── textarea.tsx                # Already exists — use as-is for base, override inline
```

### Pattern 1: Streaming Markdown with Memoization

**What:** Parse markdown into blocks, memoize each block so completed blocks don't re-render on each new token.
**When to use:** For every AI assistant message — apply to all `role === 'assistant'` content.

```typescript
// src/app/(dashboard)/chat/markdown-message.tsx
// Source: https://ai-sdk.dev/cookbook/next/markdown-chatbot-with-memoization
"use client";

import { memo, useMemo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block"; // see Pattern 2

// Parse markdown into discrete blocks (paragraphs, code fences, headings, etc.)
function parseMarkdownBlocks(content: string) {
  // Split on double newlines to identify block boundaries
  // The `marked` tokenizer approach or simple split both work
  const lines = content.split("\n");
  const blocks: string[] = [];
  let current = "";

  for (const line of lines) {
    current += line + "\n";
    // Flush on blank line (block boundary)
    if (line === "") {
      blocks.push(current);
      current = "";
    }
  }
  if (current.trim()) blocks.push(current);
  return blocks;
}

// Memoized single block — only re-renders when its content changes
const MarkdownBlock = memo(
  function MarkdownBlock({ content }: { content: string }) {
    return (
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          // Typography normalization
          p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
          h1: ({ children }) => <h1 className="text-xl font-semibold mb-3 mt-4 first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground mb-3">{children}</blockquote>
          ),
          a: ({ href, children }) => (
            <a href={href} className="text-primary underline underline-offset-2 hover:no-underline" target="_blank" rel="noopener noreferrer">{children}</a>
          ),
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          // Inline code (not fenced)
          // CodeBlock handles both; isInlineCode detection happens inside CodeBlock
        }}
      >
        {content}
      </Markdown>
    );
  },
  (prev, next) => prev.content === next.content
);

// Container that splits content into blocks and renders each memoized
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
```

### Pattern 2: Code Block with react-shiki

**What:** Custom `code` renderer for `react-markdown` that uses `react-shiki` for fenced blocks and styled inline code for inline.
**When to use:** As the `code` entry in `react-markdown`'s `components` map.

```typescript
// Source: https://github.com/AVGVSTVS96/react-shiki + react-markdown docs
import ShikiHighlighter, { isInlineCode } from "react-shiki";
import { useState } from "react";
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
  const inline = node ? isInlineCode(node as any) : !match;

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
      {/* Code block chrome: language top-left, copy top-right */}
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
        className="text-sm !bg-zinc-50"
      >
        {code}
      </ShikiHighlighter>
    </div>
  );
}
```

### Pattern 3: Scroll Lock Detection (isAtBottom)

**What:** Track whether the user is at the bottom of the chat scroll container. Pause auto-scroll when they scroll up. Resume when they scroll back to bottom.
**When to use:** On the messages scroll container's `onScroll` handler.

```typescript
// Source: pattern verified across multiple chat UI implementations
// https://tuffstuff9.hashnode.dev/intuitive-scrolling-for-chatbot-message-streaming

const scrollContainerRef = useRef<HTMLDivElement>(null);
const messagesEndRef = useRef<HTMLDivElement>(null);
const [isAtBottom, setIsAtBottom] = useState(true);

function handleScroll() {
  const el = scrollContainerRef.current;
  if (!el) return;
  const { scrollTop, scrollHeight, clientHeight } = el;
  // 50px threshold: small scroll doesn't trigger
  setIsAtBottom(scrollHeight - clientHeight - scrollTop < 50);
}

// Auto-scroll effect — only runs when at bottom
useEffect(() => {
  if (isAtBottom) {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }
}, [messages, isAtBottom]);

// JSX:
// <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
//   ...messages...
//   <div ref={messagesEndRef} />
// </div>
// {!isAtBottom && <JumpToBottomButton onClick={scrollToBottom} />}
```

**Critical layout note:** The dashboard layout (`layout.tsx`) has `main` with `overflow-y-auto`. The chat page's outermost div is `flex flex-col h-full` — this means `flex-1 overflow-y-auto` on the messages area scrolls the INNER div, not `main`. The `onScroll` handler must be on the inner messages container div, not `window`.

### Pattern 4: Stop Button as Send Button Transform

**What:** The send button visually transforms to a stop/cancel button during `status === 'streaming' || status === 'submitted'`. Not just an icon swap — uses distinct iconography.
**When to use:** Phase 6 wires `stop()` from `useChat()` to a square-stop icon button.

```typescript
// Source: ai-sdk.dev/docs/advanced/stopping-streams (adapted for SDK 6 API)
// stop() is confirmed on UseChatHelpers via AbstractChat pick in @ai-sdk/react@3.0.83

const { messages, sendMessage, status, stop } = useChat({ transport });
const isStreaming = status === "streaming" || status === "submitted";

// Inside the input form:
<Button
  type={isStreaming ? "button" : "submit"}
  size="icon"
  onClick={isStreaming ? stop : undefined}
  className={cn(
    "h-9 w-9 flex-shrink-0",
    isStreaming && "bg-red-500 hover:bg-red-600 text-white"
  )}
  aria-label={isStreaming ? "Stop generation" : "Send message"}
>
  {isStreaming ? (
    <Square className="h-3.5 w-3.5 fill-current" />
  ) : (
    <Send className="h-4 w-4" />
  )}
</Button>
```

**Important:** The `Square` icon from lucide-react visually communicates "stop" far better than a spinner or color change alone. Use `fill-current` to make it solid.

### Pattern 5: Typing Indicator (Pre-First-Token)

**What:** Show animated bouncing dots in an AI card surface while `status === 'submitted'` and no assistant message exists yet.
**When to use:** Condition: `isLoading && lastMessage?.role !== 'assistant'` (matches current page logic).

```typescript
// Pure CSS approach — no framer-motion needed
// Add to globals.css:
// @keyframes typing-dot {
//   0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
//   30% { transform: translateY(-6px); opacity: 1; }
// }

// In JSX — rendered inside an AI message card surface:
{status === "submitted" && (
  displayMessages[displayMessages.length - 1]?.role !== "assistant"
) && (
  <div className="flex items-start gap-3 animate-fade-in">
    <span className="text-xs font-medium text-muted-foreground pt-0.5">Gooder</span>
    <div className="bg-white border border-border rounded-xl shadow-elevation-1 px-4 py-3">
      <div className="flex items-center gap-1.5" aria-label="Gooder is typing">
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
```

### Pattern 6: Message Completion Flash

**What:** A brief CSS keyframe highlight on the AI card when streaming completes. The copy button fades in after.
**When to use:** Detect transition from `status === 'streaming'` to `status === 'ready'` by tracking previous status.

```typescript
// Track previous status to detect completion
const prevStatusRef = useRef(status);
const [justCompletedId, setJustCompletedId] = useState<string | null>(null);

useEffect(() => {
  if (prevStatusRef.current === "streaming" && status === "ready") {
    const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
    if (lastAssistant) {
      setJustCompletedId(lastAssistant.id);
      setTimeout(() => setJustCompletedId(null), 1000); // clear after animation
    }
  }
  prevStatusRef.current = status;
}, [status, messages]);

// On the AI card:
// className={cn("...", justCompletedId === message.id && "animate-message-flash")}
// Add to globals.css:
// @keyframes message-flash { 0%,100% { background-color: inherit; } 40% { background-color: hsl(var(--primary)/0.06); } }
```

### Anti-Patterns to Avoid

- **Disabling input during streaming:** The user decision explicitly allows the input to remain active for cancel. Do NOT `disabled={isLoading}` the textarea.
- **Using `overflow-y-auto` on `main` for scroll detection:** The layout's `main` element already has `overflow-y-auto`. The chat needs its own inner `overflow-y-auto` container and must track scroll on that container, not `window`.
- **Rendering `react-markdown` without memoization during streaming:** Each new token triggers a re-render. Without memoization, a 100-block response re-parses all 100 blocks on every token. Apply the MemoizedMarkdown pattern.
- **Using `@tailwindcss/typography` prose classes:** Not installed and not needed — define typography styles inline via `components` prop in `react-markdown`.
- **Using `ScrollArea` component for the message container:** The existing `ScrollArea` shadcn component wraps Radix's scroll area which uses a viewport trick incompatible with `onScroll` detection. Use a plain `<div className="overflow-y-auto">` with an `onScroll` handler.
- **Removing `splitIntoSections` / scoring card code:** Phase 6 boundary is the message display and input. Scoring UI and Figma extraction belong to Phase 7 — keep those sections intact but clearly marked.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown to React elements | Custom regex/replace renderer | `react-markdown` | Edge cases: nested formatting, links in code, escaped chars, XSS safety |
| GFM tables and tasklists | Custom table parser | `remark-gfm` plugin | Spec-compliant; handles alignment, escaping, complex cells |
| Syntax highlighting | Manual token regex coloring | `react-shiki` (Shiki) | 200+ languages, TextMate grammars, VS Code-quality; streaming-safe |
| Inline vs block code detection | `children` newline count | `isInlineCode(node)` from `react-shiki` | Handles edge cases in the hast AST that newline count misses |
| Scroll bottom detection | Scroll event math from scratch | Threshold pattern (scrollHeight - clientHeight - scrollTop < N) | Already battle-tested; see Pattern 3 above |
| Typing animation | JS setInterval timers | CSS keyframe `typing-dot` with `animation-delay` | Zero JS, respects `prefers-reduced-motion`, no cleanup needed |

**Key insight:** Markdown has dozens of edge cases (escaped brackets, nested emphasis, code spans, hard line breaks) that regex-based renderers routinely break. `react-markdown` processes the entire CommonMark spec correctly. Never hand-roll markdown rendering for an AI output surface.

---

## Common Pitfalls

### Pitfall 1: `react-markdown` ESM-Only in Next.js 14
**What goes wrong:** `Error: require() of ES Module ... react-markdown ... not supported`
**Why it happens:** `react-markdown@10` is ESM-only. Next.js 14 uses CJS by default for server components; if the import is in a server context or the transpilePackages config is missing, it throws.
**How to avoid:** Mark the component `"use client"` (already correct since chat page is client-side). Additionally, add to `next.config.js`:
```js
const nextConfig = {
  transpilePackages: ['react-markdown', 'remark-gfm'],
};
```
**Warning signs:** Import error on startup; error only in production build not dev.

### Pitfall 2: Scroll Container on Wrong Element
**What goes wrong:** `onScroll` fires on the wrong element; `isAtBottom` is always true or always false.
**Why it happens:** The dashboard layout wraps `{children}` in a `<main className="flex-1 overflow-y-auto">`. If the chat page's outer div is `h-full` but doesn't have its own `overflow-y-auto`, the scroll container is `main`. Putting `ref` and `onScroll` on the inner messages div only works if that div independently overflows.
**How to avoid:** Ensure the messages div has explicit `overflow-y-auto` AND the ref + onScroll are on that same element. Test by physically scrolling up mid-stream to verify `isAtBottom` transitions to false.
**Warning signs:** "Jump to bottom" button never appears, or appears immediately on page load.

### Pitfall 3: Stop Button Race Condition
**What goes wrong:** User clicks stop, `stop()` is called, but `status` briefly stays `'streaming'` then flips to `'ready'` — causing a double-render flash or incorrect UI state.
**Why it happens:** `stop()` is client-side only — it aborts the fetch. The SDK updates `status` asynchronously after the abort resolves. Reported issue: `stop()` may not fully abort server-side generation in all deployment environments (known bug in SDK as of late 2025).
**How to avoid:** Use `status` from `useChat` as the source of truth for UI state — not local loading state. Accept that server may continue briefly after client stop; this is a known limitation. Do not add local `isLoading` state that contradicts `status`.
**Warning signs:** Button flickers between send/stop states rapidly after clicking stop.

### Pitfall 4: Memoized Markdown Stale Keys
**What goes wrong:** As new blocks appear during streaming, React reuses keys from a previous render, causing visible content jumps or blocks rendering out of order.
**Why it happens:** If `parseMarkdownBlocks` splits differently as content grows (a partial code fence becomes a complete one), the block array length changes and key indexes shift.
**How to avoid:** Key blocks with `${messageId}-block-${index}` not just `index`. Accept that blocks near the stream cursor will re-render — only completed blocks behind the cursor benefit from memoization.
**Warning signs:** Completed text earlier in the message re-renders visibly (flicker) when new tokens arrive.

### Pitfall 5: `react-shiki` Dynamic Language Imports
**What goes wrong:** Unknown language warning in console; highlighting falls back to plaintext silently.
**Why it happens:** `react-shiki` dynamically imports language grammars. If the language string from the code fence doesn't match a Shiki language ID, it fails silently.
**How to avoid:** Pass `language ?? "text"` — always fall back to `"text"` when no language is detected. Do not pass `undefined` to the `language` prop.
**Warning signs:** Code blocks render with no coloring even when language is specified in the fence.

### Pitfall 6: Copy Button Always Visible Breaks Hover-Only Pattern
**What goes wrong:** The existing code uses `opacity-0 group-hover:opacity-100` for copy buttons. The user decision is "always visible, no hover required."
**Why it happens:** Copy-pasting existing patterns from the current page without reading the requirements.
**How to avoid:** For Phase 6 message-level copy buttons: remove `opacity-0` and `group-hover:opacity-100`. The button should be visible at all times below the AI card. Completion flash drives the "feel" of completion — the button being statically visible is intentional.

---

## Code Examples

Verified patterns from official sources:

### useChat() Return Values — Phase 6 Relevant (VERIFIED)
```typescript
// Source: /node_modules/@ai-sdk/react/dist/index.d.ts (read directly)
// @ai-sdk/react@3.0.83 / ai@6.0.81

const {
  messages,          // UI_MESSAGE[]
  sendMessage,       // (options: { text: string }) => void
  status,            // 'submitted' | 'streaming' | 'ready' | 'error'
  stop,              // () => void — aborts current stream
} = useChat({ transport });

// Status values:
// 'ready'     — idle, waiting for user
// 'submitted' — request sent, waiting for first token
// 'streaming' — tokens arriving
// 'error'     — request failed
```

### Auto-Resize Textarea (Already in Page — Preserve)
```typescript
// Source: existing chat/page.tsx lines 414-419 (preserve this logic)
function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
  setInput(e.target.value);
  const target = e.target;
  target.style.height = "auto";
  target.style.height = Math.min(target.scrollHeight, MAX_TEXTAREA_HEIGHT) + "px";
}
// MAX_TEXTAREA_HEIGHT: 180-220px is appropriate (Claude's discretion range)
```

### Typing Indicator Keyframe (globals.css addition)
```css
/* Source: CSS bounce pattern verified across multiple sources */
@keyframes typing-dot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-5px); opacity: 1; }
}

.typing-dot {
  animation: typing-dot 1s ease-in-out infinite;
}

/* Completion flash */
@keyframes message-flash {
  0%, 100% { background-color: transparent; }
  40% { background-color: hsl(var(--primary) / 0.06); }
}

.animate-message-flash {
  animation: message-flash 0.8s ease-out;
}

/* Streaming ellipsis cursor */
.streaming-cursor::after {
  content: " ...";
  animation: blink 0.8s step-end infinite;
  color: hsl(var(--muted-foreground));
}
/* Note: replaces existing .streaming-cursor which uses ▋ block cursor */
```

### react-markdown + remark-gfm Minimal Setup
```typescript
// Source: https://github.com/remarkjs/react-markdown (official README)
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Basic usage — must be in a 'use client' component
<Markdown remarkPlugins={[remarkGfm]}>
  {content}
</Markdown>
```

---

## State of the Art

| Old Approach (Current Page) | Phase 6 Approach | Impact |
|------------------------------|-------------------|--------|
| `whitespace-pre-wrap` + `renderFormattedText()` custom bold parser | `react-markdown` + `remark-gfm` | Full CommonMark + GFM support; no custom parsers |
| `Loader2` spinner in AI card during generation | Animated bouncing dots (iMessage-style) | Matches user decision; more polished feel |
| `▋` block cursor via `streaming-cursor::after` | Pulsing `...` ellipsis via updated CSS | Cohesive with typing dots; ellipsis signals "more coming" |
| `messagesEndRef.scrollIntoView` (always) | `isAtBottom` gated scroll + "Jump to bottom" button | User can read history without losing place |
| Send button `disabled` during loading | Send transforms to stop button (active, not disabled) | User can cancel; matches user decision |
| Avatar icon div for sender identity | Sender label text ("You" / "Gooder") above card | Matches user decision — no avatar images |
| `bg-primary text-primary-foreground` for user bubble | Zinc/neutral card surface | Matches user decision — not primary color pill |
| Hover-only copy (`opacity-0 group-hover:opacity-100`) | Always-visible copy below card | Matches user decision |
| `max-w-3xl mx-auto` constraint on chat container | Full-width chat container | Matches user decision — no max-width column |

**Deprecated/outdated in this page:**
- `splitIntoSections()` + `renderFormattedText()`: Custom markdown processing. Replaced by `react-markdown`. These functions are Phase 7 territory (they drive section-level save/copy for scoring cards) — do NOT remove; mark as Phase 7.
- `Loader2 animate-spin` in the typing indicator card: Replaced by bouncing dots.
- Avatar icon divs (`Bot`, `User` icons in circle containers): Replaced by sender text labels.

---

## Codebase Inventory: What Stays vs Changes

This is the most important section for planning — Phase 6 is surgical on a 1012-line file.

### Stays Unchanged (Phase 6 must NOT touch)
| Block | Lines (approx) | Reason |
|-------|-----------------|--------|
| All type definitions (FigmaComponent, FigmaText, etc.) | 1-66 | Phase 7 |
| `scoreColor`, `scoreBadgeVariant`, `scoreBarColor` helpers | 68-84 | Phase 7 |
| `splitIntoSections()` function | 98-138 | Phase 7 (section-level copy/save) |
| `renderFormattedText()` function | 141-149 | Phase 7 |
| All `useChat` hook usage (`transport`, `useChat`, `status`, `displayMessages`) | 192-228 | Core logic — preserved verbatim |
| `scoreMessage()` callback | 231-267 | Phase 7 |
| Adherence score effect | 269-285 | Phase 7 |
| `toggleExpand()` | 291-299 | Phase 7 |
| `handleRegenerate()` | 302-312 | Phase 7 |
| All Figma extraction functions | 314-381 | Phase 7 |
| `handleSubmit()` | 384-405 | Core logic — preserved |
| `handleKeyDown()` | 407-413 | Core logic — preserved |
| `handleTextareaChange()` | 414-419 | Core logic — preserved |
| `saveOutput()` | 422-459 | Phase 7 |
| Scoring card JSX (lines 644-820) | 644-820 | Phase 7 |
| Figma extraction preview JSX | 844-961 | Phase 7 |

### Changed by Phase 6
| Block | Lines (approx) | What Changes |
|-------|-----------------|--------------|
| Message scroll container | 483 | Add `ref`, `onScroll`, `isAtBottom` state; remove `max-w-3xl mx-auto` |
| Empty state | 485-513 | Update to use new card surface, typography |
| Message bubble render | 521-641 | Full replacement: sender label, card surfaces, zinc user / white AI, MemoizedMarkdown |
| Typing indicator | 825-837 | Replace `Loader2` with bouncing dots |
| "Jump to bottom" button | New | Added to scroll container when `!isAtBottom` |
| Input form | 963-1008 | Send→Stop transform, sticky positioning, Cmd+Enter hint, remove `disabled` from streaming |
| `stop` destructured from `useChat` | 209 | Add `stop` to the destructure |
| globals.css | N/A | Add `typing-dot` keyframe, update `streaming-cursor`, add `message-flash` |
| `isAtBottom` state + `scrollContainerRef` | New | Scroll lock detection |
| `justCompletedId` state | New | Completion flash trigger |

---

## Open Questions

1. **`react-markdown` and Next.js 14 transpilePackages requirement**
   - What we know: `react-markdown@10` is ESM-only; the chat page is `"use client"` which should handle this
   - What's unclear: Whether Next.js 14.2.x needs explicit `transpilePackages` or if `"use client"` is sufficient
   - Recommendation: Add `transpilePackages: ['react-markdown', 'remark-gfm']` to `next.config.js` preemptively; test on first build

2. **`stop()` reliability on non-edge runtime**
   - What we know: `stop()` has known bugs in edge runtime and resumable streams (GitHub issue #6502, #10719); this app uses `api: "/api/chat"` with `DefaultChatTransport` — standard Node.js runtime, NOT edge
   - What's unclear: Whether the non-edge Node.js runtime is affected by the same bug
   - Recommendation: Implement the stop button; if it doesn't fully cancel server generation, the UX still works (client stops showing tokens). Document as known limitation.

3. **Phase 7 scoring card JSX preservation**
   - What we know: Lines 644-820 (scoring cards) and 844-961 (Figma extraction) must be preserved for Phase 7
   - What's unclear: Whether the planner should leave them in place (invisible during Phase 6 work) or comment them out
   - Recommendation: Leave in place but clearly mark with `{/* PHASE 7: scoring card */}` comments; do not restructure

---

## Sources

### Primary (HIGH confidence)
- `/node_modules/@ai-sdk/react/dist/index.d.ts` — `UseChatHelpers`, `stop()` signature, `status` type confirmed directly from installed package
- `/node_modules/ai/dist/index.d.ts` — `ChatStatus = 'submitted' | 'streaming' | 'ready' | 'error'` confirmed
- `src/app/(dashboard)/chat/page.tsx` — Full 1012-line file read; all existing patterns documented
- `src/app/globals.css` — Existing CSS keyframes (`message-appear`, `streaming-cursor`, `blink`, `fade-in`)
- `src/components/ui/textarea.tsx`, `button.tsx`, `card.tsx` — Existing component APIs
- `tailwind.config.ts` — `elevation-1` through `elevation-4` shadow tokens confirmed; `--radius` confirmed
- `package.json` — Confirmed: no markdown or syntax highlight libraries installed; `framer-motion@12.34.0` available
- https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat — `stop()` signature: `() => void`, "abort current streaming response"
- https://ai-sdk.dev/docs/advanced/stopping-streams — Official stop button pattern

### Secondary (MEDIUM confidence)
- https://ai-sdk.dev/cookbook/next/markdown-chatbot-with-memoization — MemoizedMarkdown pattern with block parsing
- https://github.com/remarkjs/react-markdown — v10.1.0, ESM-only, `components` prop API
- https://www.npmjs.com/package/remark-gfm — v4.0.1, Node 16+ compatible
- https://github.com/AVGVSTVS96/react-shiki — v0.9.1, streaming syntax highlighting, `isInlineCode` export, `github-light` theme

### Tertiary (LOW confidence — mark for validation)
- `react-markdown` ESM transpilePackages requirement in Next.js 14.2.x — single report pattern, needs verification on first build
- `stop()` behavior in non-edge Node.js runtime — known bugs documented in GitHub issues but may not affect this deployment configuration

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all library versions verified via npm/GitHub, AI SDK types read from installed node_modules
- Architecture: HIGH — existing page fully read, layout context understood, patterns derived from official cookbook
- Pitfalls: MEDIUM — most from official GitHub issues and direct code analysis; transpilePackages is LOW (verify on build)

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (stable libraries; AI SDK 6 API is settled)
