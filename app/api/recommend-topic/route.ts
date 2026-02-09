import { NextResponse } from "next/server";
import { fetchWithFallback } from "../../../lib/gemini";

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
      return NextResponse.json({ error: "No data received from Gemini" }, { status: 500 });
    }

    let topicsJson = data.candidates[0].content.parts[0].text.trim();
    // Remove code blocks if present
    topicsJson = topicsJson.replace(/```json\n?|```/g, "").trim();

    let topics: string[] = [];
    try {
      topics = JSON.parse(topicsJson);
      if (!Array.isArray(topics)) {
        if (typeof topics === "object" && topics !== null && Array.isArray((topics as Record<string, unknown>).topics)) {
          topics = (topics as Record<string, unknown>).topics as string[];
        } else {
          topics = [];
        }
      }
    } catch (parseError) {
      console.error("Failed to parse topics JSON:", topicsJson, parseError);
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
