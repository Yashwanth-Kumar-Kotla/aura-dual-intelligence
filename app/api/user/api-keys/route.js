import { NextResponse } from "next/server";
import { auth } from "../../auth/[...nextauth]/route";
import { updateUserApiKeys, getUserApiKeys } from "../../../../lib/users";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keys = await getUserApiKeys(session.user.email);
    return NextResponse.json({
      hasOpenaiKey: !!keys.openaiKey,
      hasGeminiKey: !!keys.geminiKey,
    });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { openaiKey, geminiKey } = await request.json();

    const updated = await updateUserApiKeys(
      session.user.email,
      openaiKey || null,
      geminiKey || null
    );

    return NextResponse.json({
      success: true,
      message: "API keys updated successfully",
      ...updated,
    });
  } catch (error) {
    console.error("Error updating API keys:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update API keys" },
      { status: 500 }
    );
  }
}
