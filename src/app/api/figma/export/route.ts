import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars (0/O, 1/I)
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `GOODER-${code}`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get workspace
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "No workspace found" }, { status: 403 });
    }

    const body = await request.json();
    const { channel, dimensions, channelType, brandName } = body as {
      channel: unknown;
      dimensions: { width: number; height: number };
      channelType: string;
      brandName?: string;
    };

    if (!channel || !dimensions || !channelType) {
      return NextResponse.json(
        { error: "Missing required fields: channel, dimensions, channelType" },
        { status: 400 }
      );
    }

    // Generate unique code (retry on collision)
    let code = generateCode();
    let attempts = 0;
    while (attempts < 5) {
      const { error: insertError } = await supabase
        .from("figma_exports")
        .insert({
          code,
          workspace_id: membership.workspace_id,
          user_id: user.id,
          channel_type: channelType,
          payload: channel,
          dimensions,
          brand_name: brandName ?? null,
        });

      if (!insertError) break;

      // If duplicate code, retry with new one
      if (insertError.code === "23505") {
        code = generateCode();
        attempts++;
        continue;
      }

      console.error("Figma export insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create export" },
        { status: 500 }
      );
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    return NextResponse.json({ code, expiresAt });
  } catch (error) {
    console.error("Figma export error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
