/**
 * Save Chat API Route
 * 
 * Saves a conversation to the user's chat history.
 */

import { NextResponse } from "next/server";
import { auth } from "../../auth/[...nextauth]/route";
import { addChatToSession } from "../../../../lib/chatSessions";

export async function POST(request) {
  try {
    // Get the current user session (NextAuth v5)
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { user, gpt, gemini, final, sessionId } = body;

    if (!user || !gpt || !gemini || !final) {
      return NextResponse.json(
        { error: "Missing conversation data" },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Use email as stable key for per-user chat history
    const userKey = session.user.email;

    // Save the chat to the session
    const savedChat = addChatToSession(userKey, sessionId, {
      user,
      gpt,
      gemini,
      final
    });

    return NextResponse.json(
      { success: true, chat: savedChat },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving chat:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save chat" },
      { status: 500 }
    );
  }
}

