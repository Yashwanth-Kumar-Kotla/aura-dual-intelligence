import { NextResponse } from "next/server";
import { auth } from "../../auth/[...nextauth]/route";
import {
  getUserSessions,
  createSession,
  updateSessionName,
  deleteSession,
} from "../../../../lib/chatSessions";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await getUserSessions(session.user.email);
    return NextResponse.json({ sessions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const newSession = await createSession(session.user.email, body.name || null);
    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, name } = await request.json();
    if (!sessionId || !name) {
      return NextResponse.json({ error: "Session ID and name are required" }, { status: 400 });
    }

    const updated = await updateSessionName(session.user.email, sessionId, name);
    if (!updated) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session: updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    await deleteSession(session.user.email, sessionId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
