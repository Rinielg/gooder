// Mirror of src/types/index.ts lines 184-249 in the Gooder app.
// Keep in sync manually when channel interfaces change.

export type ChannelType = "email" | "sms" | "push_notification" | "ux_journey" | "ad_copy";

export interface EmailSection {
  type: "hero" | "body" | "cta" | "footer";
  headline?: string;
  subheadline?: string;
  content?: string;
  label?: string;
  supporting_text?: string;
}

export interface EmailChannel {
  type: "email";
  tier: string | null;
  subject: string;
  preheader: string;
  sections: EmailSection[];
}

export interface SMSChannel {
  type: "sms";
  tier: string | null;
  message: string;
  character_count: number;
}

export interface PushChannel {
  type: "push_notification";
  tier: string | null;
  title: string;
  body: string;
  deep_link_label: string | null;
}

export interface UXJourneyStep {
  step: number;
  screen_name: string;
  heading: string | null;
  body_copy: string;
  cta_label: string | null;
  helper_text: string | null;
  error_text: string | null;
}

export interface UXJourneyChannel {
  type: "ux_journey";
  tier: string | null;
  journey_name: string;
  steps: UXJourneyStep[];
}

export interface AdCopyChannel {
  type: "ad_copy";
  tier: string | null;
  headline: string;
  body: string;
  cta_label: string;
}

export type Channel =
  | EmailChannel
  | SMSChannel
  | PushChannel
  | UXJourneyChannel
  | AdCopyChannel;

export interface ExportPayload {
  channel: Channel;
  dimensions: { width: number; height: number };
  channelType: ChannelType;
  brandName?: string;
}
