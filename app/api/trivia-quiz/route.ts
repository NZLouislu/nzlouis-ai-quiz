import { NextResponse } from "next/server";

type TriviaQuestion = {
  question: string;
  incorrect_answers: string[];
  correct_answer: string;
};

type TriviaApiResponse = {
  results: TriviaQuestion[];
};

export async function POST(req: Request) {
  try {
    const { category, numQuestions, difficulty } = await req.json();

    const res = await fetch(
      `https://opentdb.com/api.php?amount=${numQuestions}&category=${category}&difficulty=${difficulty}&type=multiple`
    );

    const data: TriviaApiResponse = await res.json();

    if (!data.results || !Array.isArray(data.results)) {
      return NextResponse.json({ error: "No questions found" }, { status: 400 });
    }

    const formatted = data.results.map((q) => {
      const allAnswers = [...q.incorrect_answers];
      const randomIndex = Math.floor(Math.random() * (allAnswers.length + 1));
      allAnswers.splice(randomIndex, 0, q.correct_answer);

      return {
        question: q.question,
        options: allAnswers,
        correctAnswer: q.correct_answer,
      };
    });

    return NextResponse.json({ quiz: formatted });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}