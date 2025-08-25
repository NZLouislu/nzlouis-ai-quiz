import { NextResponse } from "next/server";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    const {
      mode,
      question,
      options,
      selectedAnswer,
      messages = [] as ChatMessage[],
    } = await req.json();

    const base = `
You are a helpful tutor for multiple-choice quizzes. Explain reasoning paths, key concepts, and how to eliminate distractors. Prefer step-by-step thinking aids and analogies. Do not reveal the final answer unless the user explicitly asks for it.
Question: ${question}
Options: ${Array.isArray(options) ? options.join(" | ") : ""}
User selected: ${selectedAnswer ?? "N/A"}
`;

    let userText = "";
    if (mode === "initial") {
      userText = `Provide a concise analysis to guide the user toward the solution without stating the correct option.`;
    } else {
      const history = (messages as ChatMessage[])
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n");
      userText = `Follow-up Q&A. Conversation:\n${history}\nRespond to the last USER message. Keep guidance helpful and non-spoiler unless the user explicitly requests the answer.`;
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    const apiUrl = process.env.GEMINI_API_URL;
    if (!apiKey || !apiUrl)
      return NextResponse.json(
        { error: "API key or URL not set" },
        { status: 500 }
      );

    const payload = {
      contents: [{ parts: [{ text: base + "\n" + userText }] }],
    };
    const url = `${apiUrl}?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `API error: ${response.status}`, details: errorText },
        { status: 500 }
      );
    }

    const data = await response.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    return NextResponse.json({ message: text });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "AI Assistant failed",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
