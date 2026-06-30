import { NextResponse } from "next/server";
import { auth } from "../../auth/[...nextauth]/route";
import { getUserSessions } from "../../../../lib/chatSessions";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await getUserSessions(session.user.email);
    const allChats = sessions.flatMap((s) => s.chats || [])
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return NextResponse.json({ chats: allChats }, { status: 200 });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 });
  }
}
