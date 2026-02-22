"use client";

import { PushChannel } from "@/types";
import { OutputCardActions } from "../output-card";
import { Badge } from "@/components/ui/badge";
import { Bell, X } from "lucide-react";

interface PushRendererProps {
  channel: PushChannel;
  showTierBadge: boolean;
  onSave: () => void;
  onAdjust: () => void;
}

export function PushRenderer({ channel, showTierBadge, onSave, onAdjust }: PushRendererProps) {
  const copyText = [
    `Title: ${channel.title}`,
    `Body: ${channel.body}`,
    channel.deep_link_label ? `Link: ${channel.deep_link_label}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="rounded-xl border border-border bg-white shadow-elevation-1">
      {/* Card header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Badge className="text-xs font-medium border bg-orange-100 text-orange-800 border-orange-200">
          Push
        </Badge>
        {showTierBadge && channel.tier && (
          <Badge variant="outline" className="text-xs">
            {channel.tier}
          </Badge>
        )}
      </div>
      {/* iOS notification card */}
      <div className="px-4 py-4">
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 shadow-elevation-1">
          {/* App row: icon + "Gooder" + "now" + × */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-xs font-medium text-zinc-500">Gooder</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-400">now</span>
              <X className="w-3 h-3 text-zinc-300" />
            </div>
          </div>
          {/* Title */}
          <p className="text-sm font-semibold text-zinc-900 mt-1.5 leading-snug">{channel.title}</p>
          {/* Body */}
          <p className="text-xs text-zinc-600 leading-relaxed mt-0.5">{channel.body}</p>
          {/* Deep link — only if non-null */}
          {channel.deep_link_label && (
            <p className="text-xs text-primary font-medium mt-1.5">
              {channel.deep_link_label} →
            </p>
          )}
        </div>
      </div>
      {/* Actions */}
      <OutputCardActions body={copyText} onSave={onSave} onAdjust={onAdjust} />
    </div>
  );
}
