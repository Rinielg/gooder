"use client";

import { UXJourneyChannel, UXJourneyStep } from "@/types";
import { OutputCardActions } from "../output-card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowRight } from "lucide-react";

interface UXJourneyRendererProps {
  channel: UXJourneyChannel;
  showTierBadge: boolean;
  onSave: () => void;
  onAdjust: () => void;
}

interface UXStepCardProps {
  step: UXJourneyStep;
  isLast: boolean;
}

function UXStepCard({ step, isLast }: UXStepCardProps) {
  return (
    <>
      <div className="w-[360px] flex-shrink-0 rounded-xl border border-border bg-white shadow-elevation-1 overflow-hidden">
        {/* Header: step pill + screen name */}
        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 border-b border-border">
          <span className="text-[10px] bg-primary/10 text-primary rounded-full px-1.5 py-0.5 font-semibold tabular-nums flex-shrink-0">
            {step.step}
          </span>
          <p className="text-xs font-semibold text-foreground truncate">{step.screen_name}</p>
        </div>
        {/* Content area — typed fields directly, no markdown parsing */}
        <div className="p-4 space-y-2.5">
          {step.heading && (
            <p className="text-sm font-semibold text-foreground leading-snug">{step.heading}</p>
          )}
          <p className="text-xs text-foreground leading-relaxed">{step.body_copy}</p>
          {step.cta_label && (
            <span className="inline-block px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-default">
              {step.cta_label}
            </span>
          )}
          {step.helper_text && (
            <p className="text-[10px] text-muted-foreground">{step.helper_text}</p>
          )}
          {step.error_text && (
            <p className="text-[10px] text-red-500 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              {step.error_text}
            </p>
          )}
        </div>
      </div>
      {!isLast && (
        <ArrowRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 self-center" />
      )}
    </>
  );
}

export function UXJourneyRenderer({ channel, showTierBadge, onSave, onAdjust }: UXJourneyRendererProps) {
  const copyText = channel.steps
    .map((s) =>
      [
        `Step ${s.step}: ${s.screen_name}`,
        s.heading ? `Heading: ${s.heading}` : "",
        `Body: ${s.body_copy}`,
        s.cta_label ? `CTA: ${s.cta_label}` : "",
        s.helper_text ? `Helper: ${s.helper_text}` : "",
        s.error_text ? `Error: ${s.error_text}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    )
    .join("\n\n");

  return (
    <div className="rounded-xl border border-border bg-white shadow-elevation-1">
      {/* Card header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Badge className="text-xs font-medium border bg-indigo-100 text-indigo-800 border-indigo-200">
          UX Journey
        </Badge>
        <span className="text-sm font-medium text-foreground">{channel.journey_name}</span>
        {showTierBadge && channel.tier && (
          <Badge variant="outline" className="text-xs ml-auto">
            {channel.tier}
          </Badge>
        )}
      </div>
      {/* Horizontal scroll — native overflow-x-auto (ScrollArea is vertical-only per Phase 07.1 decision) */}
      <div className="overflow-x-auto px-4 py-4">
        <div className="flex items-center gap-2" style={{ minWidth: "max-content" }}>
          {channel.steps.map((step, i) => (
            <UXStepCard
              key={`step-${step.step}-${i}`}
              step={step}
              isLast={i === channel.steps.length - 1}
            />
          ))}
        </div>
      </div>
      {/* Actions */}
      <OutputCardActions body={copyText} onSave={onSave} onAdjust={onAdjust} />
    </div>
  );
}
