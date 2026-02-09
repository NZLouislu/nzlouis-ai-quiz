import { NextResponse } from "next/server";
import { fetchWithFallback } from "../../../lib/gemini";

type RawQuizItem = {
  question?: string;
  options?: unknown;
  correctAnswer?: string;
  hint?: string;
};

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

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    };

    const result = await fetchWithFallback(payload);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: 500 }
      );
    }

    const data = result.data;

    if (!data.candidates || data.candidates.length === 0) {
      console.error("Gemini Error - No candidates:", data);
      return NextResponse.json({ error: "No quiz data received from Gemini" }, { status: 500 });
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

    parsed.quiz = parsed.quiz.map((q: RawQuizItem) => ({
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
