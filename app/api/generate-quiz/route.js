import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { quizTopic, numberOfQuestions, difficulty } = await req.json();

    const prompt = `
      Generate a quiz based on the following requirements:
      Topic: ${quizTopic}
      Number of questions: ${numberOfQuestions}
      Difficulty: ${difficulty}

      Return the result in JSON format with the following structure:
      {
        "quiz": [
          {
            "question": "Question content",
            "options": [
              "Option A",
              "Option B",
              "Option C",
              "Option D"
            ],
            "correctAnswer": "Correct answer"
          }
        ]
      }
      Ensure the value of "correctAnswer" exactly matches one of the values in "options".
    `;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    const apiUrl =
      process.env.NEXT_PUBLIC_GEMINI_API_URL;

    if (!apiKey) {
      return NextResponse.json({ error: "API key not set" }, { status: 500 });
    }

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    };

    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return NextResponse.json({ error: `API error: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      return NextResponse.json({ error: "No quiz data received from API" }, { status: 500 });
    }

    let quizJson = data.candidates[0].content.parts[0].text;
    quizJson = quizJson.replace(/```json\n?|```/g, "").trim();

    let parsedData;
    try {
      parsedData = JSON.parse(quizJson);
    } catch (err) {
      const sanitizedJson = quizJson
        .replace(/\\(?!["\\/bfnrtu])/g, "")
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");
      parsedData = JSON.parse(sanitizedJson);
    }

    return NextResponse.json(parsedData);
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
  }
}
