/**
 * Chat Sessions API Route
 * 
 * Handles creating, reading, updating, and deleting chat sessions.
 */

import { NextResponse } from "next/server";
import { auth } from "../../auth/[...nextauth]/route";
import {
  getUserSessions,
  createSession,
  updateSessionName,
  deleteSession,
  migrateOldChatsToSession
} from "../../../../lib/chatSessions";

// GET: Get all sessions for user
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userKey = session.user.email;
    let sessions = getUserSessions(userKey);

    // If no sessions exist, try migrating old chats
    if (sessions.length === 0) {
      const migrated = migrateOldChatsToSession(userKey);
      if (migrated) {
        sessions = getUserSessions(userKey);
      }
    }

    return NextResponse.json({ sessions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

// POST: Create a new session
export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    const userKey = session.user.email;
    const newSession = createSession(userKey, name);

    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

// PUT: Update session name
export async function PUT(request) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId, name } = body;

    if (!sessionId || !name) {
      return NextResponse.json(
        { error: "Session ID and name are required" },
        { status: 400 }
      );
    }

    const userKey = session.user.email;
    const updated = updateSessionName(userKey, sessionId, name);

    if (!updated) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ session: updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a session
export async function DELETE(request) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const userKey = session.user.email;
    deleteSession(userKey, sessionId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}

