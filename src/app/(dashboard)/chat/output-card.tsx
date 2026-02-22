"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Save, Copy, Pencil, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MemoizedMarkdown } from "./markdown-message";

// ── Types ────────────────────────────────────────────────────────────────────

export type DetectedOutputType =
  | "email"
  | "sms"
  | "push"
  | "whatsapp"
  | "ux_journey"
  | "generic";

export interface AdjustTarget {
  messageId: string;
  sectionTitle: string;
  sectionBody: string;
  outputType: DetectedOutputType;
}

// ContentSection matches the shape from splitIntoSections() in page.tsx
interface ContentSection {
  title: string;
  body: string;
  raw: string;
}

interface ParsedFields {
  subject?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  cta?: string;
  message?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

// Use complete Tailwind class strings (never dynamic concatenation — Tailwind purge will strip them)
export const OUTPUT_TYPE_CONFIG: Record<
  DetectedOutputType,
  { label: string; badgeClass: string }
> = {
  sms:        { label: "SMS",        badgeClass: "bg-purple-100 text-purple-800 border-purple-200" },
  email:      { label: "Email",      badgeClass: "bg-blue-100 text-blue-800 border-blue-200" },
  push:       { label: "Push",       badgeClass: "bg-orange-100 text-orange-800 border-orange-200" },
  whatsapp:   { label: "WhatsApp",   badgeClass: "bg-green-100 text-green-800 border-green-200" },
  ux_journey: { label: "UX Journey", badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  generic:    { label: "Content",    badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-200" },
};

const CHAR_LIMITS = {
  subject: 60,
  title: 65,
  subtitle: 45,
  sms: 160,
  whatsapp: 1024,
};

// ── Pure function parsers ─────────────────────────────────────────────────────

/**
 * Detects the output type from a section title string using regex matching.
 */
export function detectOutputType(title: string): DetectedOutputType {
  if (/ux.?journey|user.?journey|user.?flow|onboarding.?flow|\bjourney\b/i.test(title)) {
    return "ux_journey";
  }
  if (/\bemail\b/i.test(title)) return "email";
  if (/\bsms\b|text.?message/i.test(title)) return "sms";
  if (/push.?notification|push.?copy|\bpush\b/i.test(title)) return "push";
  if (/whatsapp/i.test(title)) return "whatsapp";
  return "generic";
}

/**
 * Parses structured field labels (Subject:, Title:, Body:, etc.) from a section body.
 * Strips ** bold markers before matching — AI frequently bolds field labels.
 * Returns an empty ParsedFields object if no fields match (caller should fall back to MemoizedMarkdown).
 */
export function parseStructuredFields(body: string): ParsedFields {
  const fields: ParsedFields = {};

  // Strip markdown bold markers for matching (AI frequently bolds field labels)
  const clean = body.replace(/\*\*/g, "");

  const extract = (pattern: RegExp): string | undefined => {
    const m = clean.match(pattern);
    return m?.[1]?.trim() || undefined;
  };

  fields.subject  = extract(/^subject(?:\s+line)?:\s*(.+)$/im);
  fields.title    = extract(/^title:\s*(.+)$/im);
  fields.subtitle = extract(/^subtitle:\s*(.+)$/im);
  fields.body     = extract(/^body(?:\s+copy)?:\s*([\s\S]+?)(?=\n(?:cta|subject|title|subtitle):|$)/im);
  fields.cta      = extract(/^cta(?:\s+button)?(?:\s+label)?:\s*(.+)$/im);
  fields.message  = extract(/^message:\s*([\s\S]+?)$/im);

  return fields;
}

/**
 * Parses UX Journey body content into individual screen cards.
 * Tries subheadings first, then bold numbered headers, then falls back to one card.
 */
export function parseUxJourneyScreens(
  body: string,
  fallbackTitle: string
): Array<{ title: string; content: string }> {
  // 1. Try splitting on #### or ## subheadings
  const byHeading = body.split(/^#{2,4}\s+/m).filter(Boolean);
  if (byHeading.length > 1) {
    return byHeading.map((part) => {
      const nl = part.indexOf("\n");
      return nl === -1
        ? { title: part.trim(), content: "" }
        : { title: part.slice(0, nl).trim(), content: part.slice(nl + 1).trim() };
    });
  }

  // 2. Try splitting on bold numbered headers: **Screen 1:** or **Step 1:**
  const byBold = body.split(/\n(?=\*\*(?:Screen|Step|Platform|State)\s+\d+[:.]\*\*)/i);
  if (byBold.length > 1) {
    const titles = Array.from(
      body.matchAll(/\*\*(?:Screen|Step|Platform|State)\s+\d+[:.]\*\*/gi)
    ).map((m) => m[0]);
    return byBold.slice(1).map((content, i) => ({
      title: titles[i]?.replace(/\*\*/g, "").trim() ?? `Screen ${i + 1}`,
      content: content.trim(),
    }));
  }

  // 3. Fallback: whole body as one screen
  return [{ title: fallbackTitle, content: body }];
}

// ── CharCount ─────────────────────────────────────────────────────────────────

function CharCount({ text, limit }: { text: string; limit: number }) {
  const len = text.length;
  const pct = len / limit;
  return (
    <span
      className={cn(
        "text-[10px] tabular-nums ml-1",
        pct >= 1
          ? "text-red-500"
          : pct >= 0.9
          ? "text-amber-500"
          : "text-muted-foreground/60"
      )}
    >
      {len}/{limit}
    </span>
  );
}

// ── OutputCardActions ─────────────────────────────────────────────────────────

interface OutputCardActionsProps {
  body: string;
  onSave: () => void;
  onAdjust: () => void;
}

export function OutputCardActions({ body, onSave, onAdjust }: OutputCardActionsProps) {
  function handleCopy() {
    navigator.clipboard.writeText(body);
    toast.success("Copied");
  }

  return (
    <div className="flex items-center gap-2 px-4 pb-3 pt-1">
      <button
        onClick={onSave}
        className="flex items-center gap-1 px-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Save className="w-3.5 h-3.5" />
        Save
      </button>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1 px-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Copy className="w-3.5 h-3.5" />
        Copy
      </button>
      <button
        onClick={onAdjust}
        className="flex items-center gap-1 px-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
        Adjust
      </button>
    </div>
  );
}

// ── StructuredFieldCard ───────────────────────────────────────────────────────

interface StructuredFieldCardProps {
  section: ContentSection;
  outputType: DetectedOutputType;
  id: string;
}

function StructuredFieldCard({ section, outputType, id }: StructuredFieldCardProps) {
  const fields = parseStructuredFields(section.body);
  const hasFields =
    fields.subject ||
    fields.title ||
    fields.subtitle ||
    fields.body ||
    fields.cta ||
    fields.message;

  // No structured fields found — fall back to full markdown rendering
  if (!hasFields) {
    return (
      <div className="px-4 py-4">
        <MemoizedMarkdown content={section.body} id={id} />
      </div>
    );
  }

  const labelClass = "text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-0.5";
  const valueClass = "text-sm text-foreground";
  const fieldWrapperClass = "space-y-1 mb-3";

  // Email: Subject + Body + CTA
  if (outputType === "email") {
    return (
      <div className="px-4 py-4">
        {fields.subject && (
          <div className={fieldWrapperClass}>
            <p className={labelClass}>
              Subject
              <CharCount text={fields.subject} limit={CHAR_LIMITS.subject} />
            </p>
            <p className={valueClass}>{fields.subject}</p>
          </div>
        )}
        {fields.body && (
          <div className={fieldWrapperClass}>
            <p className={labelClass}>Body</p>
            <p className={valueClass}>{fields.body}</p>
          </div>
        )}
        {fields.cta && (
          <div className={fieldWrapperClass}>
            <p className={labelClass}>CTA</p>
            <p className={valueClass}>{fields.cta}</p>
          </div>
        )}
        {/* Fallback if none of the specific email fields matched */}
        {!fields.subject && !fields.body && !fields.cta && (
          <MemoizedMarkdown content={section.body} id={id} />
        )}
      </div>
    );
  }

  // Push: Title + Subtitle + Body
  if (outputType === "push") {
    return (
      <div className="px-4 py-4">
        {fields.title && (
          <div className={fieldWrapperClass}>
            <p className={labelClass}>
              Title
              <CharCount text={fields.title} limit={CHAR_LIMITS.title} />
            </p>
            <p className={valueClass}>{fields.title}</p>
          </div>
        )}
        {fields.subtitle && (
          <div className={fieldWrapperClass}>
            <p className={labelClass}>
              Subtitle
              <CharCount text={fields.subtitle} limit={CHAR_LIMITS.subtitle} />
            </p>
            <p className={valueClass}>{fields.subtitle}</p>
          </div>
        )}
        {fields.body && (
          <div className={fieldWrapperClass}>
            <p className={labelClass}>Body</p>
            <p className={valueClass}>{fields.body}</p>
          </div>
        )}
        {/* Fallback if none of the specific push fields matched */}
        {!fields.title && !fields.subtitle && !fields.body && (
          <MemoizedMarkdown content={section.body} id={id} />
        )}
      </div>
    );
  }

  // SMS: message or body with 160-char count
  if (outputType === "sms") {
    const text = fields.message ?? fields.body ?? "";
    return (
      <div className="px-4 py-4">
        {text ? (
          <div className={fieldWrapperClass}>
            <p className={labelClass}>
              Message
              <CharCount text={text} limit={CHAR_LIMITS.sms} />
            </p>
            <p className={valueClass}>{text}</p>
          </div>
        ) : (
          <MemoizedMarkdown content={section.body} id={id} />
        )}
      </div>
    );
  }

  // WhatsApp: message or body with 1024-char count
  // Fall back to full section body if no labeled field found — always show as styled text not gray markdown
  if (outputType === "whatsapp") {
    const text = fields.message ?? fields.body ?? section.body.trim();
    return (
      <div className="px-4 py-4">
        <div className={fieldWrapperClass}>
          <p className={labelClass}>
            Message
            <CharCount text={text} limit={CHAR_LIMITS.whatsapp} />
          </p>
          <p className={valueClass}>{text}</p>
        </div>
      </div>
    );
  }

  // Generic — render markdown
  return (
    <div className="px-4 py-4">
      <MemoizedMarkdown content={section.body} id={id} />
    </div>
  );
}

// ── JourneyScreenCard ─────────────────────────────────────────────────────────

interface JourneyScreenCardProps {
  screen: { title: string; content: string };
  index: number;
  isLast: boolean;
}

// Parse a screen's content for Headline, Body Copy, and CTA sections
function parseScreenSections(content: string) {
  const clean = content.replace(/\*\*/g, "");
  const extract = (pattern: RegExp) => clean.match(pattern)?.[1]?.trim();
  const headline = extract(/^(?:headline|heading|title|screen\s+title):\s*(.+)$/im)
    ?? extract(/^#+\s+(.+)$/m); // first markdown heading as fallback
  const body = extract(/^(?:body\s+copy|body|copy|description|content):\s*([\s\S]+?)(?=\n(?:cta|headline|heading|call to action):|$)/im);
  const cta = extract(/^(?:cta|call to action|button|primary\s+action)(?:\s+(?:text|label|copy))?:\s*(.+)$/im);
  // If none found, treat entire content as body
  const rawBody = !headline && !body && !cta ? content.trim() : undefined;
  return { headline, body, cta, rawBody };
}

const JourneyScreenCard = memo(function JourneyScreenCard({
  screen,
  index,
  isLast,
}: JourneyScreenCardProps) {
  const { headline, body, cta, rawBody } = parseScreenSections(screen.content);
  return (
    <>
      <div className="w-[400px] flex-shrink-0 rounded-lg border border-border bg-white shadow-elevation-1 overflow-hidden">
        {/* Screen title / step label */}
        <div className="px-4 py-2.5 bg-accent/40 border-b border-border">
          <p className="text-xs font-semibold text-foreground">{screen.title}</p>
        </div>
        <div className="p-4 space-y-3">
          {rawBody ? (
            // No structured fields — render content as markdown
            <div className="text-xs [&_p]:text-xs [&_li]:text-xs">
              <MemoizedMarkdown content={rawBody} id={`journey-screen-${index}`} />
            </div>
          ) : (
            <>
              {headline && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1">Headline</p>
                  <p className="text-sm font-medium text-foreground leading-snug">{headline}</p>
                </div>
              )}
              {body && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1">Body copy</p>
                  <p className="text-xs text-foreground leading-relaxed">{body}</p>
                </div>
              )}
              {cta && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1">CTA</p>
                  <span className="inline-block px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">{cta}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {!isLast && (
        <ArrowRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 self-center" />
      )}
    </>
  );
});

// ── UxJourneyCard ─────────────────────────────────────────────────────────────

interface UxJourneyCardProps {
  section: ContentSection;
  messageId: string;
  onSave: () => void;
  onAdjust: () => void;
}

function UxJourneyCard({ section, messageId, onSave, onAdjust }: UxJourneyCardProps) {
  const screens = parseUxJourneyScreens(section.body, section.title);

  return (
    <div className="rounded-xl border border-border bg-white shadow-elevation-1">
      {/* Header with badge + section title */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Badge
          className={cn(
            "text-xs font-medium border",
            OUTPUT_TYPE_CONFIG.ux_journey.badgeClass
          )}
        >
          {OUTPUT_TYPE_CONFIG.ux_journey.label}
        </Badge>
        <span className="text-sm font-medium text-foreground">{section.title}</span>
      </div>

      {/* Horizontal scroll container — native overflow-x-auto (ScrollArea is vertical-only) */}
      <div className="overflow-x-auto px-4 py-4">
        <div
          className="flex items-center gap-2"
          style={{ minWidth: "max-content" }}
        >
          {screens.map((screen, i) => (
            <JourneyScreenCard
              key={`${messageId}-screen-${i}`}
              screen={screen}
              index={i}
              isLast={i === screens.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <OutputCardActions body={section.body} onSave={onSave} onAdjust={onAdjust} />
    </div>
  );
}

// ── OutputCard ────────────────────────────────────────────────────────────────

interface OutputCardProps {
  section: ContentSection;
  outputType: DetectedOutputType;
  messageId: string;
  sectionIndex: number;
  onSave: () => void;
  onAdjust: () => void;
}

function OutputCard({
  section,
  outputType,
  messageId,
  sectionIndex,
  onSave,
  onAdjust,
}: OutputCardProps) {
  const config = OUTPUT_TYPE_CONFIG[outputType];
  const cardId = `${messageId}-card-${sectionIndex}`;

  if (outputType === "ux_journey") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut", delay: sectionIndex * 0.05 }}
      >
        <UxJourneyCard
          section={section}
          messageId={messageId}
          onSave={onSave}
          onAdjust={onAdjust}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut", delay: sectionIndex * 0.05 }}
      className="rounded-xl border border-border bg-white shadow-elevation-1"
    >
      {/* Card header: badge + section title */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Badge className={cn("text-xs font-medium border", config.badgeClass)}>
          {config.label}
        </Badge>
        <span className="text-sm font-medium text-foreground">{section.title}</span>
      </div>

      {/* Card body: type-specific structured fields or markdown fallback */}
      <StructuredFieldCard
        section={section}
        outputType={outputType}
        id={cardId}
      />

      {/* Actions: Save, Copy, Adjust */}
      <OutputCardActions body={section.body} onSave={onSave} onAdjust={onAdjust} />
    </motion.div>
  );
}

// ── OutputCardGroup (export) ──────────────────────────────────────────────────

interface OutputCardGroupProps {
  sections: ContentSection[];
  messageId: string;
  onSave: (
    messageId: string,
    sectionTitle: string,
    sectionBody: string,
    outputType: DetectedOutputType
  ) => void;
  onAdjust: (target: AdjustTarget) => void;
}

export function OutputCardGroup({
  sections,
  messageId,
  onSave,
  onAdjust,
}: OutputCardGroupProps) {
  const intro = sections.find((s) => !s.title);
  const titled = sections.filter((s) => s.title);

  return (
    <div className="space-y-3">
      {intro && (
        <div className="text-sm text-muted-foreground">
          <MemoizedMarkdown content={intro.body} id={`${messageId}-intro`} />
        </div>
      )}
      {titled.map((section, i) => {
        const outputType = detectOutputType(section.title);
        return (
          <OutputCard
            key={`${messageId}-card-${i}`}
            section={section}
            outputType={outputType}
            messageId={messageId}
            sectionIndex={i}
            onSave={() => onSave(messageId, section.title, section.body, outputType)}
            onAdjust={() =>
              onAdjust({
                messageId,
                sectionTitle: section.title,
                sectionBody: section.body,
                outputType,
              })
            }
          />
        );
      })}
    </div>
  );
}
