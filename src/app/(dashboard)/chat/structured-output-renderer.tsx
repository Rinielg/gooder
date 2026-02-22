"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  StructuredOutput,
  Channel,
  EmailChannel,
  SMSChannel,
  PushChannel,
  UXJourneyChannel,
  AdCopyChannel,
} from "@/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmailRenderer } from "./renderers/email-renderer";
import { SMSRenderer } from "./renderers/sms-renderer";
import { PushRenderer } from "./renderers/push-renderer";
import { UXJourneyRenderer } from "./renderers/ux-journey-renderer";
import { AdCopyRenderer } from "./renderers/ad-copy-renderer";

// A group is one card slot: either a single channel or multiple same-type tiers
interface ChannelGroup {
  channels: Channel[];
  firstIndex: number; // index in original output.channels array
}

function groupChannels(channels: Channel[]): ChannelGroup[] {
  const groups: ChannelGroup[] = [];
  const seenTypes = new Map<string, ChannelGroup>();

  channels.forEach((channel, i) => {
    if (channel.tier !== null) {
      // Has a tier — group with other same-type tiered channels
      const existing = seenTypes.get(channel.type);
      if (existing) {
        existing.channels.push(channel);
      } else {
        const group: ChannelGroup = { channels: [channel], firstIndex: i };
        seenTypes.set(channel.type, group);
        groups.push(group);
      }
    } else {
      // No tier — always its own standalone card
      groups.push({ channels: [channel], firstIndex: i });
    }
  });

  return groups;
}

interface StructuredOutputRendererProps {
  output: StructuredOutput;
  messageId: string;
  onSave: () => void;
  onAdjust: (channelIndex: number) => void;
}

function renderChannel(
  channel: Channel,
  showTierBadge: boolean,
  onSave: () => void,
  onAdjust: () => void
): React.ReactNode {
  if (channel.type === "email") {
    return (
      <EmailRenderer
        channel={channel as EmailChannel}
        showTierBadge={showTierBadge}
        onSave={onSave}
        onAdjust={onAdjust}
      />
    );
  }
  if (channel.type === "sms") {
    return (
      <SMSRenderer
        channel={channel as SMSChannel}
        showTierBadge={showTierBadge}
        onSave={onSave}
        onAdjust={onAdjust}
      />
    );
  }
  if (channel.type === "push_notification") {
    return (
      <PushRenderer
        channel={channel as PushChannel}
        showTierBadge={showTierBadge}
        onSave={onSave}
        onAdjust={onAdjust}
      />
    );
  }
  if (channel.type === "ux_journey") {
    return (
      <UXJourneyRenderer
        channel={channel as UXJourneyChannel}
        showTierBadge={showTierBadge}
        onSave={onSave}
        onAdjust={onAdjust}
      />
    );
  }
  if (channel.type === "ad_copy") {
    return (
      <AdCopyRenderer
        channel={channel as AdCopyChannel}
        showTierBadge={showTierBadge}
        onSave={onSave}
        onAdjust={onAdjust}
      />
    );
  }
  return null;
}

function GroupRenderer({
  group,
  onSave,
  onAdjust,
}: {
  group: ChannelGroup;
  onSave: () => void;
  onAdjust: () => void;
}) {
  const { channels } = group;

  // Single channel — render standalone with tier badge if tier is set
  if (channels.length === 1) {
    return (
      <>
        {renderChannel(channels[0], channels[0].tier !== null, onSave, onAdjust)}
      </>
    );
  }

  // Multi-tier group — same type, multiple tier variants → shadcn Tabs
  // Omit tier badge from each card header (tab triggers serve that purpose)
  const defaultTier = channels[0].tier ?? "Classic";
  return (
    <Tabs defaultValue={defaultTier}>
      <TabsList className="mb-0 h-8">
        {channels.map((ch) => (
          <TabsTrigger key={ch.tier} value={ch.tier!} className="text-xs px-3 py-1">
            {ch.tier}
          </TabsTrigger>
        ))}
      </TabsList>
      {channels.map((ch) => (
        <TabsContent key={ch.tier} value={ch.tier!} className="mt-2">
          {renderChannel(ch, false, onSave, onAdjust)}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export function StructuredOutputRenderer({
  output,
  messageId,
  onSave,
  onAdjust,
}: StructuredOutputRendererProps) {
  const groups = groupChannels(output.channels);

  return (
    <div className="space-y-3">
      {groups.map((group, i) => (
        <motion.div
          key={`${messageId}-group-${i}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut", delay: i * 0.06 }}
        >
          <GroupRenderer
            group={group}
            onSave={onSave}
            onAdjust={() => onAdjust(group.firstIndex)}
          />
        </motion.div>
      ))}
    </div>
  );
}
