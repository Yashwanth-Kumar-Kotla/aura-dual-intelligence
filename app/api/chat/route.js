import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Missing prompt" },
        { status: 400 }
      );
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!openaiKey || !geminiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY or GEMINI_API_KEY env vars" },
        { status: 500 }
      );
    }

    // 1) Ask GPT-4o mini
    const gptPromise = fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are GPT-4o mini in a dual-AI pair. Provide a clear, structured first-pass answer. " +
              "Explain your reasoning and assumptions briefly."
          },
          { role: "user", content: prompt }
        ]
      })
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok || data.error) {
        console.error("GPT API error:", data.error || data);
        return { error: data.error || { message: "Unknown GPT API error", status: res.status } };
      }
      return data;
    }).catch((err) => {
      console.error("GPT fetch error:", err);
      return { error: { message: err.message } };
    });

    // 2) Ask Gemini (using gemini-flash-latest which is available in Google AI Studio)
    const geminiPromise = fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" +
        encodeURIComponent(geminiKey),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    "You are Gemini in a dual-AI pair with GPT-4o mini. " +
                    "Read the user question and imagine GPT has already given a thoughtful answer. " +
                    "Your job is to critique that style of answer: check for gaps, edge cases, " +
                    "risks, or hallucinations, and suggest improvements. " +
                    "You do NOT need to reference GPT directly, just speak as a smart second opinion.\n\n" +
                    "User question: " +
                    prompt
                }
              ]
            }
          ]
        })
      }
    ).then(async (res) => {
      const data = await res.json();
      if (!res.ok || data.error) {
        // Log the error for debugging
        console.error("Gemini API error:", data.error || data);
        return { error: data.error || { message: "Unknown Gemini API error", status: res.status } };
      }
      return data;
    }).catch((err) => {
      console.error("Gemini fetch error:", err);
      return { error: { message: err.message } };
    });

    const [gptRaw, geminiRaw] = await Promise.all([gptPromise, geminiPromise]);

    let gptReply = "No response from GPT-4o mini.";
    if (gptRaw?.error) {
      const errorMsg = gptRaw.error.message || gptRaw.error.type || "Unknown error";
      const statusCode = gptRaw.error.status || gptRaw.error.code;
      if (statusCode === 401 || errorMsg.includes("API key") || errorMsg.includes("authentication") || errorMsg.includes("Invalid")) {
        gptReply = `GPT API Error: Invalid or missing API key. Please check your OPENAI_API_KEY.`;
      } else {
        gptReply = `GPT API Error: ${errorMsg}`;
      }
    } else if (gptRaw?.choices?.[0]?.message?.content) {
      gptReply = gptRaw.choices[0].message.content;
    }

    let geminiReply = "No response from Gemini 1.5 Flash.";
    if (geminiRaw?.error) {
      const errorMsg = geminiRaw.error.message || geminiRaw.error.status?.message || "Unknown error";
      const errorCode = geminiRaw.error.status?.code || geminiRaw.error.status;
      if (errorCode === 400 || errorMsg.includes("API key") || errorMsg.includes("invalid")) {
        geminiReply = `Gemini API Error: Invalid or missing API key. Please check your GEMINI_API_KEY.`;
      } else {
        geminiReply = `Gemini API Error: ${errorMsg}`;
      }
    } else if (geminiRaw?.candidates?.[0]?.content?.parts) {
      geminiReply = geminiRaw.candidates[0].content.parts
        .map(p => p.text)
        .join("\n");
    }

    // 3) Final synthesis by GPT
    const finalRawRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are the synthesizer for a dual-AI system (GPT + Gemini). " +
              "You see both drafts below. Combine their strengths into one clear answer. " +
              "Prefer concrete, actionable guidance. If they disagree, explain briefly and choose the safer / better supported path."
          },
          {
            role: "user",
            content:
              "User question: " + prompt + "\n\n" +
              "Draft A (GPT-4o mini):\n" + gptReply + "\n\n" +
              "Draft B (Gemini 1.5 Flash):\n" + geminiReply + "\n\n" +
              "Now produce a single, polished answer for the user."
          }
        ]
      })
    }).then(res => res.json());

    const finalReply =
      finalRawRes?.choices?.[0]?.message?.content ||
      "No synthesis available.";

    return NextResponse.json({
      gptReply,
      geminiReply,
      finalReply
    });
  } catch (err) {
    console.error("API error:", err);
    console.error("Error stack:", err.stack);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
