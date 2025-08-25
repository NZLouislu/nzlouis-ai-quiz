import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { quizTopic, numberOfQuestions, difficulty, language } = await req.json();

    const prompt = `
Return only valid JSON. Create a ${language} quiz as a JSON object with this exact shape:
{
  "quiz": [
    {
      "question": "string",
      "options": ["A","B","C","D"],
      "correctAnswer": "one of options",
      "hint": "concise, non-spoiler nudge that helps reasoning without revealing the answer"
    }
  ]
}
Topic: ${quizTopic}
Questions: ${numberOfQuestions}
Difficulty: ${difficulty}
Rules:
- Each "options" must be plausible and mutually exclusive.
- "correctAnswer" must exactly match one item in "options".
- "hint" should guide thinking paths or key concept, avoid giving the exact answer.
- Avoid code fences or explanations; output JSON only.
`;

    const apiKey = process.env.GOOGLE_API_KEY;
    const apiUrl = process.env.GEMINI_API_URL;

    if (!apiKey || !apiUrl) {
      return NextResponse.json({ error: "API key or URL not set" }, { status: 500 });
    }

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
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

    if (!data.candidates || data.candidates.length === 0) {
      return NextResponse.json({ error: "No quiz data received from API" }, { status: 500 });
    }

    let quizJson = data.candidates[0]?.content?.parts?.[0]?.text || "";
    quizJson = quizJson.replace(/```json\n?|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(quizJson);
    } catch {
      const sanitized = quizJson
        .replace(/\\(?!["\\/bfnrtu])/g, "")
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");
      parsed = JSON.parse(sanitized);
    }

    if (!parsed.quiz || !Array.isArray(parsed.quiz)) {
      return NextResponse.json({ error: "Malformed quiz JSON" }, { status: 500 });
    }

    parsed.quiz = parsed.quiz.map((q: any) => ({
      question: String(q.question || ""),
      options: Array.isArray(q.options) ? q.options.map(String) : [],
      correctAnswer: String(q.correctAnswer || ""),
      hint: q.hint ? String(q.hint) : "",
    }));

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to generate quiz", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
