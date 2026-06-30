import { NextResponse } from "next/server";
import { auth } from "../../auth/[...nextauth]/route";
import { addChatToSession } from "../../../../lib/chatSessions";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { user, gpt, gemini, final, sessionId } = body;

    if (!user || !gpt || !gemini || !final) {
      return NextResponse.json({ error: "Missing conversation data" }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const savedChat = await addChatToSession(session.user.email, sessionId, {
      user,
      gpt,
      gemini,
      final,
    });

    return NextResponse.json({ success: true, chat: savedChat }, { status: 201 });
  } catch (error) {
    console.error("Error saving chat:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save chat" },
      { status: 500 }
    );
  }
}
