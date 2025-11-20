import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY env var" },
        { status: 500 }
      );
    }

    // Try to list available models
    // First try v1beta endpoint
    try {
      const v1betaRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(geminiKey)}`
      );
      const v1betaData = await v1betaRes.json();
      
      if (v1betaRes.ok && v1betaData.models) {
        return NextResponse.json({
          apiVersion: "v1beta",
          models: v1betaData.models.map(m => ({
            name: m.name,
            displayName: m.displayName,
            supportedGenerationMethods: m.supportedGenerationMethods
          }))
        });
      }
    } catch (err) {
      console.log("v1beta failed, trying v1...", err.message);
    }

    // Try v1 endpoint
    try {
      const v1Res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(geminiKey)}`
      );
      const v1Data = await v1Res.json();
      
      if (v1Res.ok && v1Data.models) {
        return NextResponse.json({
          apiVersion: "v1",
          models: v1Data.models.map(m => ({
            name: m.name,
            displayName: m.displayName,
            supportedGenerationMethods: m.supportedGenerationMethods
          }))
        });
      }
    } catch (err) {
      console.log("v1 also failed:", err.message);
    }

    return NextResponse.json(
      { error: "Could not list models. Check your API key." },
      { status: 500 }
    );
  } catch (err) {
    console.error("Error listing models:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

