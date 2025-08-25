import { NextResponse } from "next/server";

type RawSpaceQuestion = {
  question?: string;
  options?: unknown;
  answer?: string;
  correctAnswer?: string;
  hint?: string;
};

type NormalizedQuiz = {
  quiz: RawSpaceQuestion[];
};

function safeString(v: unknown) {
  return v === undefined || v === null ? "" : String(v);
}

async function tryFetchText(url: string, init: RequestInit) {
  const res = await fetch(url, init);
  const text = await res.text();
  const contentType = res.headers.get("content-type") || "";
  return { ok: res.ok, status: res.status, statusText: res.statusText, text, contentType };
}

function isRawSpaceQuestionArray(value: unknown): value is RawSpaceQuestion[] {
  if (!Array.isArray(value)) return false;
  return value.length === 0 || value.every((item) => typeof item === "object" && item !== null);
}

function normalizeResponseBody(obj: unknown): NormalizedQuiz | null {
  if (!obj) return null;

  if (isRawSpaceQuestionArray(obj)) return { quiz: obj };

  if (typeof obj === "object" && obj !== null) {
    const o = obj as Record<string, unknown>;
    if (Array.isArray(o.questions)) {
      if (isRawSpaceQuestionArray(o.questions)) return { quiz: o.questions as RawSpaceQuestion[] };
    }
    if (Array.isArray(o.quiz)) {
      if (isRawSpaceQuestionArray(o.quiz)) return { quiz: o.quiz as RawSpaceQuestion[] };
    }
    if (Array.isArray(o.data)) {
      for (const item of o.data) {
        try {
          const parsed = typeof item === "string" ? JSON.parse(item) : item;
          const normalized = normalizeResponseBody(parsed);
          if (normalized) return normalized;
        } catch {
          // ignore parse errors and continue
        }
      }
    }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const { quizTopic, numberOfQuestions, difficulty } = body as {
      quizTopic?: unknown;
      numberOfQuestions?: unknown;
      difficulty?: unknown;
    };

    const hfUrlRaw = process.env.HF_SPACE_URL;
    if (!hfUrlRaw) {
      return NextResponse.json({ error: "HF_SPACE_URL environment variable is not set" }, { status: 500 });
    }
    const hfToken = process.env.HF_TOKEN;
    const headersBase: Record<string, string> = { "Content-Type": "application/json" };
    if (hfToken) headersBase["Authorization"] = `Bearer ${hfToken}`;

    const raw = String(hfUrlRaw).replace(/\/+$/, "");
    const attempts: Array<Record<string, unknown>> = [];

    const payloadObj = {
      topic: typeof quizTopic === "string" ? quizTopic : String(quizTopic ?? ""),
      n_questions: Number(numberOfQuestions ?? 3),
      difficulty: typeof difficulty === "string" ? difficulty : String(difficulty ?? "medium"),
    };
    const bodyGenerate = JSON.stringify(payloadObj);

    const candidates: { url: string; init: RequestInit; desc: string }[] = [];
    candidates.push({
      url: `${raw}/generate_quiz`,
      init: { method: "POST", headers: headersBase, body: bodyGenerate },
      desc: "raw + /generate_quiz",
    });

    const m = raw.match(/huggingface\.co\/spaces\/([^\/]+)\/([^\/]+)$/i);
    if (m) {
      const user = m[1];
      const repo = m[2];
      const dash = `${user}-${repo}`;
      const double = `${user}--${repo}`;
      candidates.push({ url: `https://${dash}.hf.space/generate_quiz`, init: { method: "POST", headers: headersBase, body: bodyGenerate }, desc: "user-repo.hf.space (single hyphen)" });
      candidates.push({ url: `https://${double}.hf.space/generate_quiz`, init: { method: "POST", headers: headersBase, body: bodyGenerate }, desc: "user--repo.hf.space (double hyphen)" });
      candidates.push({ url: `https://${dash.toLowerCase()}.hf.space/generate_quiz`, init: { method: "POST", headers: headersBase, body: bodyGenerate }, desc: "lowercase single-hyphen" });
      candidates.push({ url: `https://${double.toLowerCase()}.hf.space/generate_quiz`, init: { method: "POST", headers: headersBase, body: bodyGenerate }, desc: "lowercase double-hyphen" });
      const payloadAsData = JSON.stringify({ data: [payloadObj.topic, payloadObj.n_questions, payloadObj.difficulty] });
      candidates.push({ url: `https://${dash}.hf.space/run/predict`, init: { method: "POST", headers: headersBase, body: payloadAsData }, desc: "run/predict (single-hyphen)" });
      candidates.push({ url: `https://${dash}.hf.space/api/predict`, init: { method: "POST", headers: headersBase, body: payloadAsData }, desc: "api/predict (single-hyphen)" });
    } else {
      const submatch = raw.match(/^https?:\/\/([^\/]+\.hf\.space)/i);
      if (submatch) {
        const base = `https://${submatch[1]}`;
        candidates.push({ url: `${base}/generate_quiz`, init: { method: "POST", headers: headersBase, body: bodyGenerate }, desc: "provided subdomain + /generate_quiz" });
        const payloadAsData = JSON.stringify({ data: [payloadObj.topic, payloadObj.n_questions, payloadObj.difficulty] });
        candidates.push({ url: `${base}/run/predict`, init: { method: "POST", headers: headersBase, body: payloadAsData }, desc: "subdomain run/predict" });
        candidates.push({ url: `${base}/api/predict`, init: { method: "POST", headers: headersBase, body: payloadAsData }, desc: "subdomain api/predict" });
      }
    }

    const seen = new Set<string>();
    const uniqueCandidates = candidates.filter((c) => {
      const key = c.url;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    for (const cand of uniqueCandidates) {
      try {
        const r = await tryFetchText(cand.url, cand.init);
        attempts.push({ desc: cand.desc, url: cand.url, status: r.status, statusText: r.statusText, contentType: r.contentType, textSnippet: r.text.slice(0, 2000) });
        if (!r.ok) continue;

        let parsed: unknown = null;
        try {
          parsed = JSON.parse(r.text);
        } catch {
          parsed = null;
        }

        const normalized = normalizeResponseBody(parsed ?? undefined);
        if (normalized) {
          const quizArray = normalized.quiz.map((q) => ({
            question: safeString(q.question),
            options: Array.isArray(q.options) ? q.options.map(safeString) : [],
            correctAnswer: safeString(q.answer ?? q.correctAnswer),
            hint: safeString(q.hint ?? ""),
          }));
          return NextResponse.json({ quiz: quizArray, _meta: { usedEndpoint: cand.url, attempts } });
        } else {
          try {
            const maybe = JSON.parse(r.text.replace(/\u0000/g, ""));
            const norm2 = normalizeResponseBody(maybe);
            if (norm2) {
              const quizArray = norm2.quiz.map((q) => ({
                question: safeString(q.question),
                options: Array.isArray(q.options) ? q.options.map(safeString) : [],
                correctAnswer: safeString(q.answer ?? q.correctAnswer),
                hint: safeString(q.hint ?? ""),
              }));
              return NextResponse.json({ quiz: quizArray, _meta: { usedEndpoint: cand.url, attempts } });
            }
          } catch (parseErr: unknown) {
            attempts.push({ desc: `${cand.desc} - parse fallback failed`, url: cand.url, parseError: parseErr instanceof Error ? parseErr.message : String(parseErr) });
          }
        }
      } catch (e: unknown) {
        attempts.push({ desc: cand.desc, url: cand.url, error: e instanceof Error ? e.message : String(e) });
        continue;
      }
    }

    return NextResponse.json({ error: "All attempts failed", attempts }, { status: 500 });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Unexpected server error", details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}