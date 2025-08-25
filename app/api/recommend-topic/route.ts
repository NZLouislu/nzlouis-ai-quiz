import { NextResponse } from "next/server";

type UserProfile = {
  age?: string;
  gender?: string;
  interests?: string[];
  location?: string;
};

export async function POST(req: Request) {
  try {
    const body: UserProfile = await req.json();

    const prompt = `
You are a helpful assistant that recommends quiz topics.
User info: 
Age: ${body.age || "unknown"}
Gender: ${body.gender || "unknown"}
Interests: ${body.interests?.join(", ") || "none"}
Location: ${body.location || "unknown"}
Please generate 5 suitable quiz topics for this user. Return only a JSON array of strings.
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
      return NextResponse.json({ error: "No data received from API" }, { status: 500 });
    }

    let topicsJson = data.candidates[0]?.content?.parts?.[0]?.text || "";
    topicsJson = topicsJson.replace(/```json\n?|```/g, "").trim();

    let topics: string[] = [];
    try {
      topics = JSON.parse(topicsJson);
      if (!Array.isArray(topics)) topics = [];
    } catch {
      topics = [];
    }

    return NextResponse.json({ topics });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to generate recommendations", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
