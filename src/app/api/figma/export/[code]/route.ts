import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("figma_exports")
      .select("channel_type, payload, dimensions, brand_name, expires_at")
      .eq("code", code.toUpperCase())
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Export not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Check expiry
    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Export has expired" },
        { status: 410, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      {
        channel: data.payload,
        dimensions: data.dimensions,
        channelType: data.channel_type,
        brandName: data.brand_name,
      },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Figma export retrieval error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
