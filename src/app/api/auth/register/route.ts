import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { userId, workspaceName } = await request.json();

    if (!userId || !workspaceName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    // Create workspace
    const { data: workspace, error: wsError } = await supabase
      .from("workspaces")
      .insert({ name: workspaceName })
      .select()
      .single();

    if (wsError) {
      console.error("Workspace creation error:", wsError);
      return NextResponse.json(
        { error: "Failed to create workspace" },
        { status: 500 }
      );
    }

    // Add user as admin member
    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert({
        workspace_id: workspace.id,
        user_id: userId,
        role: "admin",
      });

    if (memberError) {
      console.error("Member creation error:", memberError);
      return NextResponse.json(
        { error: "Failed to add workspace member" },
        { status: 500 }
      );
    }

    // Seed default platform standards
    const defaultStandards = [
      {
        workspace_id: workspace.id,
        name: "UX Journey Best Practices",
        type: "predefined",
        category: "ux_journey",
        is_active: true,
        content: {
          rules: [
            "Progressive disclosure: reveal information as needed, not all at once",
            "One primary action per screen or step",
            "Error messages follow: What happened → Why → What to do → Where to get help",
            "Empty states should guide toward the first action",
            "Loading states should set expectations (what is happening, how long)",
            "Confirmation messages confirm the action, show result, and suggest next step",
            "Tooltips should be under 80 characters and answer one question",
            "CTAs use action verbs: 'Start trial' not 'Submit'",
            "Placeholder text should be an example, not a label repeat",
            "Permission requests explain the benefit before asking",
          ],
        },
      },
      {
        workspace_id: workspace.id,
        name: "Email Best Practices",
        type: "predefined",
        category: "email",
        is_active: true,
        content: {
          rules: [
            "Subject line under 60 characters",
            "Preheader text complements (not repeats) the subject",
            "One primary CTA per email",
            "Body copy is scannable: short paragraphs, clear hierarchy",
            "Transactional emails prioritize clarity over personality",
            "Marketing emails can use full brand personality",
            "Always include unsubscribe link for marketing emails",
            "Personalisation should feel natural, not creepy",
          ],
        },
      },
      {
        workspace_id: workspace.id,
        name: "SMS Best Practices",
        type: "predefined",
        category: "sms",
        is_active: true,
        content: {
          rules: [
            "Maximum 160 characters per message",
            "No marketing without explicit opt-in",
            "Include sender identification",
            "Direct and actionable — no fluff",
            "Include opt-out instructions where required",
            "Time-sensitive content only",
            "Deep link to relevant app screen where possible",
          ],
        },
      },
      {
        workspace_id: workspace.id,
        name: "Push Notification Best Practices",
        type: "predefined",
        category: "push",
        is_active: true,
        content: {
          rules: [
            "Under 50 characters for the main message",
            "Lead with value, not the brand name",
            "Create urgency only when genuine",
            "Deep link to the relevant screen",
            "Respect notification frequency — no spamming",
            "Personalise based on user behaviour",
            "Test timing for optimal engagement",
          ],
        },
      },
    ];

    await supabase.from("platform_standards").insert(defaultStandards);

    return NextResponse.json({ workspace });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
