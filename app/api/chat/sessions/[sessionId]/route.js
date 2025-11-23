/**
 * Get Chat History for a Specific Session
 */

import { NextResponse } from "next/server";
import { auth } from "../../../auth/[...nextauth]/route";
import { getSession } from "../../../../../lib/chatSessions";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { sessionId } = params;
    const userKey = session.user.email;
    const sessionData = getSession(userKey, sessionId);

    if (!sessionData) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      session: sessionData,
      chats: sessionData.chats || []
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

