/**
 * User API Keys API Route
 * 
 * Allows users to save/update their own API keys.
 */

import { NextResponse } from "next/server";
import { auth } from "../../auth/[...nextauth]/route";
import { updateUserApiKeys, getUserApiKeys } from "../../../../lib/users";

// GET: Retrieve user's API keys (without showing the actual keys)
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const keys = getUserApiKeys(session.user.email);
    
    // Return only whether keys exist, not the actual keys
    return NextResponse.json({
      hasOpenaiKey: !!keys.openaiKey,
      hasGeminiKey: !!keys.geminiKey
    });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

// POST: Save/update user's API keys
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
    const { openaiKey, geminiKey } = body;

    // Update user's API keys
    const updated = updateUserApiKeys(
      session.user.email,
      openaiKey || null,
      geminiKey || null
    );

    return NextResponse.json({
      success: true,
      message: "API keys updated successfully",
      ...updated
    });
  } catch (error) {
    console.error("Error updating API keys:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update API keys" },
      { status: 500 }
    );
  }
}

