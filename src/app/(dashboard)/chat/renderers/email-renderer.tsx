"use client";

import { EmailChannel } from "@/types";
import { OutputCardActions } from "../output-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EmailRendererProps {
  channel: EmailChannel;
  showTierBadge: boolean;
  onSave: () => void;
  onAdjust: () => void;
}

function EmailRendererContent({ channel }: { channel: EmailChannel }) {
  return (
    <div className="mx-auto max-w-[540px] bg-zinc-50/50 border border-zinc-200 rounded-lg overflow-hidden">
      {/* Subject + Preheader */}
      <div className="px-6 pt-5 pb-4 border-b border-zinc-200">
        <h2 className="text-lg font-bold text-foreground leading-snug">{channel.subject}</h2>
        {channel.preheader && (
          <p className="text-sm text-muted-foreground mt-1">{channel.preheader}</p>
        )}
      </div>
      {/* Sections in order: hero → body → cta → footer */}
      <div className="px-6 py-4 space-y-4">
        {channel.sections.map((section, i) => {
          if (section.type === "hero") {
            return (
              <div key={i} className="text-center space-y-1">
                {section.headline && (
                  <p className="text-xl font-semibold text-foreground">{section.headline}</p>
                )}
                {section.subheadline && (
                  <p className="text-sm text-muted-foreground">{section.subheadline}</p>
                )}
              </div>
            );
          }
          if (section.type === "body") {
            return (
              <p key={i} className="text-sm text-foreground leading-relaxed">
                {section.content}
              </p>
            );
          }
          if (section.type === "cta") {
            return (
              <div key={i} className="text-center space-y-1.5">
                <span className="inline-block px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium cursor-default">
                  {section.label}
                </span>
                {section.supporting_text && (
                  <p className="text-xs text-muted-foreground">{section.supporting_text}</p>
                )}
              </div>
            );
          }
          if (section.type === "footer") {
            return (
              <p key={i} className="text-xs text-muted-foreground text-center border-t border-zinc-200 pt-3">
                {section.content}
              </p>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

export function EmailRenderer({ channel, showTierBadge, onSave, onAdjust }: EmailRendererProps) {
  const copyText = [
    `Subject: ${channel.subject}`,
    channel.preheader ? `Preheader: ${channel.preheader}` : "",
    ...channel.sections.map((s) => {
      if (s.type === "hero") return [s.headline, s.subheadline].filter(Boolean).join("\n");
      if (s.type === "body") return s.content ?? "";
      if (s.type === "cta") return [s.label, s.supporting_text].filter(Boolean).join("\n");
      if (s.type === "footer") return s.content ?? "";
      return "";
    }),
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <div className="rounded-xl border border-border bg-white shadow-elevation-1">
      {/* Card header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Badge className="text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200">
          Email
        </Badge>
        {showTierBadge && channel.tier && (
          <Badge variant="outline" className="text-xs">
            {channel.tier}
          </Badge>
        )}
      </div>
      {/* Email preview strip */}
      <div className="px-4 py-4">
        <EmailRendererContent channel={channel} />
      </div>
      {/* Actions */}
      <OutputCardActions body={copyText} onSave={onSave} onAdjust={onAdjust} />
    </div>
  );
}
