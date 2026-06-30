import { NextResponse } from "next/server";
import { auth } from "../../../auth/[...nextauth]/route";
import { getSession } from "../../../../../lib/chatSessions";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = params;
    const sessionData = await getSession(session.user.email, sessionId);

    if (!sessionData) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(
      { session: sessionData, chats: sessionData.chats || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}
