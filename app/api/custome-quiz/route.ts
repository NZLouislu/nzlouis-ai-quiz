import { NextResponse } from "next/server";

type RawQuizItem = {
  question?: string;
  options?: unknown;
  correctAnswer?: string;
  hint?: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const { quizTopic, numberOfQuestions, difficulty, language, model } = body as {
      quizTopic?: string;
      numberOfQuestions?: string;
      difficulty?: string;
      language?: "中文" | "English";
      model?: string;
    };

    if (!quizTopic || !numberOfQuestions || !difficulty || !language || !model) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

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

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    const openRouterApiUrl = process.env.OPENROUTER_API_URL;

    if (!openRouterApiKey || !openRouterApiUrl) {
      const missingEnv = [];
      if (!openRouterApiKey) missingEnv.push("OPENROUTER_API_KEY");
      if (!openRouterApiUrl) missingEnv.push("OPENROUTER_API_URL");
      return NextResponse.json({ error: `Environment variables not set: ${missingEnv.join(", ")}` }, { status: 500 });
    }

    const payload = {
      model: model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    };

    const response = await fetch(openRouterApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", {
        status: response.status,
        errorText,
        model,
        openRouterApiUrl,
        payload
      });
      return NextResponse.json(
        { error: `OpenRouter API error: ${response.status}`, details: errorText },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message?.content) {
      return NextResponse.json({ error: "No quiz data received from OpenRouter API" }, { status: 500 });
    }

    const quizJson = data.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(quizJson);
    } catch (parseError) {
      console.error("Failed to parse quiz JSON from OpenRouter:", quizJson, parseError);
      return NextResponse.json(
        { error: "Failed to parse quiz response from OpenRouter", details: String(parseError), rawResponse: quizJson },
        { status: 500 }
      );
    }

    if (!parsed.quiz || !Array.isArray(parsed.quiz)) {
      return NextResponse.json({ error: "Malformed quiz JSON from OpenRouter" }, { status: 500 });
    }

    const quizArray = parsed.quiz.map((q: RawQuizItem) => ({
      question: String(q.question || ""),
      options: Array.isArray(q.options) ? q.options.map(String) : [],
      correctAnswer: String(q.correctAnswer || ""),
      hint: q.hint ? String(q.hint) : "",
    }));

    return NextResponse.json({ quiz: quizArray });
  } catch (err: unknown) {
    console.error("Failed to generate quiz:", err);
    return NextResponse.json(
      { error: "Failed to generate quiz", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}