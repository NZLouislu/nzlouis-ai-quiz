export async function fetchWithFallback(payload: unknown) {
    const keys = [
        process.env.GOOGLE_API_KEY,
        process.env.Tasky_Gemini_API,
        process.env.Blog_Gemini_API,
    ].filter(Boolean) as string[];

    const model = process.env.AI_MODEL_NAME || "gemini-1.5-flash";
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";

    let lastError: string | null = null;

    for (const key of keys) {
        try {
            const url = `${baseUrl}/${model}:generateContent?key=${key}`;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                return { ok: true, data };
            }

            // If it's a quota error (429) or other retryable error, continue to next key
            console.warn(`Gemini API key ${key.substring(0, 8)}... failed with status ${response.status}:`, data);
            lastError = data.error?.message || `API Error: ${response.status}`;

            // If error is NOT a quota error or internal error, we might want to stop early, 
            // but the user asked for fallback when quota is out. 429 is the main one.
            // We will fall back for any non-ok response.
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.error(`Fetch error with key ${key.substring(0, 8)}...:`, errorMsg);
            lastError = errorMsg;
        }
    }

    return {
        ok: false,
        error: "All Gemini API keys reached their quota or failed. Please try again later.",
        details: lastError
    };
}
