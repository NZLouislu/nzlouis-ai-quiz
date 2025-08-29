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
    You are a tutor for multiple-choice quizzes. Provide exactly three concise points, each preceded by a hyphen. Each point should be very short (no more than 12 words). Keep overall length ~50% of a normal hint. Do NOT reveal the correct answer unless the user explicitly requests it. Ensure each point is on a new line.
    Question: ${question}
    Options: ${Array.isArray(options) ? options.join(" | ") : ""}
    User selected: ${selectedAnswer ?? "N/A"}
    `;

    let userText = "";
    const history = messages
      .map((m: ChatMessage) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");
    const userMessages = messages
      .filter((m: ChatMessage) => m.role === "user")
      .map((m: ChatMessage) => m.content);
    const orPattern = /([A-Za-z0-9'’&\-\s]+?)\s+or\s+([A-Za-z0-9'’&\-\s]+)\??/i;
    let contrastPair = null;
    for (let i = userMessages.length - 1; i >= 0; i--) {
      const match = userMessages[i].match(orPattern);
      if (match) {
        const a = match[1].trim();
        const b = match[2].trim();
        const opts = Array.isArray(options)
          ? options.map((o) => o.toLowerCase())
          : [];
        if (opts.includes(a.toLowerCase()) && opts.includes(b.toLowerCase())) {
          contrastPair = { a, b };
          break;
        }
      }
    }

    if (mode === "initial") {
      userText = `Mode: hint
    Provide three short, non-spoiler hints that guide toward identifying the correct option. Keep each bullet <=12 words. Do not state or imply the answer.`;
    } else if (mode === "reveal") {
      userText = `Mode: answer
    Give the correct option on the first line, then one-sentence justification, then a short confidence (0-1). Keep each line very short.`;
    } else if (contrastPair) {
      userText = `Mode: contrast
    Compare "${contrastPair.a}" vs "${contrastPair.b}" in three very short bullets:
    1) Key fact that supports ${contrastPair.a}
    2) Key fact that supports ${contrastPair.b}
    3) One-line neutral leaning or invite to reveal answer (do not state the answer unless asked).`;
    } else {
      userText = `Mode: followup
    Follow the user's history: ${history}
    Respond with three concise, non-spoiler hints, each <=12 words, aimed to resolve uncertainty.`;
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    const apiUrl = process.env.GEMINI_API_URL;
    if (!apiKey || !apiUrl) {
      return NextResponse.json(
        { error: "API key or URL not set" },
        { status: 500 }
      );
    }

    const payload = {
      contents: [{ parts: [{ text: base + "\n" + userText }] }],
    };
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
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
      (data.candidates?.[0]?.content?.parts?.[0]?.text || "No response").replace(/^- /gm, '');
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
