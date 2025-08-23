import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("=== [API] Generate Quiz called ===");

    const { quizTopic, numberOfQuestions, difficulty } = await req.json();
    console.log("Request body:", { quizTopic, numberOfQuestions, difficulty });

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

    const apiKey = process.env.GOOGLE_API_KEY;
    const apiUrl = process.env.GEMINI_API_URL;

    console.log("API Key present:", !!apiKey);
    console.log("API URL:", apiUrl);

    if (!apiKey || !apiUrl) {
      console.error("Missing API key or API URL");
      return NextResponse.json(
        { error: "API key or URL not set" },
        { status: 500 }
      );
    }

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    };
    console.log("Payload to Gemini:", JSON.stringify(payload, null, 2));

    const url = `${apiUrl}?key=${apiKey}`;
    console.log("Fetching Gemini API:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("Gemini response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error response:", errorText);
      return NextResponse.json(
        { error: `API error: ${response.status}`, details: errorText },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("Gemini API raw data:", JSON.stringify(data, null, 2));

    if (!data.candidates || data.candidates.length === 0) {
      console.error("No candidates in response");
      return NextResponse.json(
        { error: "No quiz data received from API" },
        { status: 500 }
      );
    }

    let quizJson = data.candidates[0].content.parts[0].text;
    console.log("Raw quiz JSON string:", quizJson);

    quizJson = quizJson.replace(/```json\n?|```/g, "").trim();

    let parsedData;
    try {
      parsedData = JSON.parse(quizJson);
    } catch (err: unknown) {
      console.error("JSON parse error:", err);
      const sanitizedJson = quizJson
        .replace(/\\(?!["\\/bfnrtu])/g, "")
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");
      console.log("Sanitized JSON string:", sanitizedJson);
      parsedData = JSON.parse(sanitizedJson);
    }

    console.log("Final parsed quiz object:", JSON.stringify(parsedData, null, 2));

    return NextResponse.json(parsedData);
  } catch (err: unknown) {
    console.error("Quiz API fatal error:", err);
    return NextResponse.json(
      { 
        error: "Failed to generate quiz", 
        details: err instanceof Error ? err.message : String(err) 
      },
      { status: 500 }
    );
  }
  
}
