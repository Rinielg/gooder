"use client";

import { SMSChannel } from "@/types";
import { OutputCardActions } from "../output-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SMSRendererProps {
  channel: SMSChannel;
  showTierBadge: boolean;
  onSave: () => void;
  onAdjust: () => void;
}

export function SMSRenderer({ channel, showTierBadge, onSave, onAdjust }: SMSRendererProps) {
  const count = channel.character_count ?? channel.message.length;
  const limit = 160;
  const pct = count / limit;

  return (
    <div className="rounded-xl border border-border bg-white shadow-elevation-1">
      {/* Card header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Badge className="text-xs font-medium border bg-purple-100 text-purple-800 border-purple-200">
          SMS
        </Badge>
        {showTierBadge && channel.tier && (
          <Badge variant="outline" className="text-xs">
            {channel.tier}
          </Badge>
        )}
      </div>
      {/* iMessage bubble — brand is sender, bubble right-aligned */}
      <div className="px-4 py-4">
        <div className="flex justify-end">
          <div className="max-w-[75%] bg-indigo-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed">
            {channel.message}
          </div>
        </div>
        {/* Char count */}
        <p
          className={cn(
            "text-[10px] tabular-nums text-right mt-1 pr-1",
            pct >= 1
              ? "text-red-500"
              : pct >= 0.9
              ? "text-amber-500"
              : "text-muted-foreground/60"
          )}
        >
          {count} / {limit} chars
        </p>
      </div>
      {/* Actions */}
      <OutputCardActions body={channel.message} outputType="sms" channel={channel} onSave={onSave} onAdjust={onAdjust} />
    </div>
  );
}
