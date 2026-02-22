"use client";

import { AdCopyChannel } from "@/types";
import { OutputCardActions } from "../output-card";
import { Badge } from "@/components/ui/badge";

interface AdCopyRendererProps {
  channel: AdCopyChannel;
  showTierBadge: boolean;
  onSave: () => void;
  onAdjust: () => void;
}

export function AdCopyRenderer({ channel, showTierBadge, onSave, onAdjust }: AdCopyRendererProps) {
  const copyText = [
    `Headline: ${channel.headline}`,
    `Body: ${channel.body}`,
    `CTA: ${channel.cta_label}`,
  ].join("\n\n");

  return (
    <div className="rounded-xl border border-border bg-white shadow-elevation-1">
      {/* Card header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Badge className="text-xs font-medium border bg-zinc-100 text-zinc-700 border-zinc-200">
          Ad Copy
        </Badge>
        {showTierBadge && channel.tier && (
          <Badge variant="outline" className="text-xs">
            {channel.tier}
          </Badge>
        )}
      </div>
      {/* Ad preview strip */}
      <div className="px-4 py-4">
        <div className="bg-zinc-50/50 border border-border rounded-lg p-4">
          <p className="text-base font-bold text-foreground">{channel.headline}</p>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{channel.body}</p>
          <div className="mt-4">
            <span className="inline-block px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium cursor-default">
              {channel.cta_label}
            </span>
          </div>
        </div>
      </div>
      {/* Actions */}
      <OutputCardActions body={copyText} onSave={onSave} onAdjust={onAdjust} />
    </div>
  );
}
