/**
 * Get Chat History API Route
 * 
 * Retrieves all conversations for the current user.
 * Now aggregates chats from all sessions.
 */

import { NextResponse } from "next/server";
import { auth } from "../../auth/[...nextauth]/route";
import { getUserSessions } from "../../../../lib/chatSessions";
import { getUserChats } from "../../../../lib/chatHistory";

export async function GET() {
  try {
    // Get the current user session (NextAuth v5)
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Use email as stable key for per-user chat history
    const userKey = session.user.email;

    // Get all sessions for the user
    const sessions = getUserSessions(userKey);
    
    // Aggregate all chats from all sessions
    let allChats = [];
    sessions.forEach(session => {
      if (session.chats && session.chats.length > 0) {
        allChats = allChats.concat(session.chats);
      }
    });
    
    // Also include old chats from the legacy chat history (for backward compatibility)
    const oldChats = getUserChats(userKey);
    if (oldChats.length > 0) {
      allChats = allChats.concat(oldChats);
    }
    
    // Sort by timestamp (newest first)
    allChats.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });

    return NextResponse.json(
      { chats: allChats },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

