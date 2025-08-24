"use client";

import { useState } from "react";

type QuizItem = {
  question: string;
  options: string[];
  correctAnswer: string;
};

const categories = [
  { id: "9", name: "General Knowledge" },
  { id: "10", name: "Entertainment: Books" },
  { id: "11", name: "Entertainment: Film" },
  { id: "12", name: "Entertainment: Music" },
  { id: "13", name: "Entertainment: Musicals & Theatres" },
  { id: "14", name: "Entertainment: Television" },
  { id: "15", name: "Entertainment: Video Games" },
  { id: "16", name: "Entertainment: Board Games" },
  { id: "17", name: "Science & Nature" },
  { id: "18", name: "Science: Computers" },
  { id: "19", name: "Science: Mathematics" },
  { id: "20", name: "Mythology" },
  { id: "21", name: "Sports" },
  { id: "22", name: "Geography" },
  { id: "23", name: "History" },
  { id: "24", name: "Politics" },
  { id: "25", name: "Art" },
  { id: "26", name: "Celebrities" },
  { id: "27", name: "Animals" },
];

export default function TriviaQuizPage() {
  const [category, setCategory] = useState("9");
  const [numQuestions, setNumQuestions] = useState("3");
  const [difficulty, setDifficulty] = useState("easy");
  const [quiz, setQuiz] = useState<QuizItem[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    setQuiz(null);
    setShowResults(false);
    setScore(0);
    setCurrentIndex(0);

    const res = await fetch("/api/trivia-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, numQuestions, difficulty }),
    });

    const data = await res.json();
    setQuiz(data.quiz);
    setLoading(false);
  };

  const handleAnswer = (option: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(option);
    const correct = option === quiz![currentIndex].correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentIndex + 1 < quiz!.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      setShowResults(true);
    }
  };

  if (!quiz && !showResults) {
    return (
      <main className="min-h-screen flex items-start justify-center bg-gray-50 mt-12">
        <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">
            🎯 Trivia Quiz
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded p-2"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Questions
              </label>
              <div className="flex gap-4">
                {["3", "5", "10"].map((num) => (
                  <label key={num} className="flex items-center gap-1">
                    <input
                      type="radio"
                      value={num}
                      checked={numQuestions === num}
                      onChange={(e) => setNumQuestions(e.target.value)}
                    />
                    {num}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Difficulty
              </label>
              <div className="flex gap-4">
                {["easy", "medium", "hard"].map((level) => (
                  <label key={level} className="flex items-center gap-1">
                    <input
                      type="radio"
                      value={level}
                      checked={difficulty === level}
                      onChange={(e) => setDifficulty(e.target.value)}
                    />
                    <span className="capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? "Loading..." : "Start Quiz"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (quiz && !showResults) {
    const currentQ = quiz[currentIndex];
    return (
      <main className="min-h-screen flex items-start justify-center bg-gray-50 mt-12">
        <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-between text-sm text-gray-600 mb-4">
            <span>
              Question {currentIndex + 1} / {quiz.length}
            </span>
            <span>Score: {score}</span>
          </div>

          <h2
            className="text-lg font-semibold mb-6"
            dangerouslySetInnerHTML={{ __html: currentQ.question }}
          />

          <ul className="space-y-3">
            {currentQ.options.map((opt, i) => {
              const isOptionCorrect = opt === currentQ.correctAnswer;
              const isSelected = selectedAnswer === opt;
              return (
                <li
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  className={`p-4 rounded-lg cursor-pointer transition flex justify-between items-center
                    ${
                      isSelected
                        ? isCorrect
                          ? "bg-green-200"
                          : "bg-red-200"
                        : "bg-gray-100 hover:bg-gray-200"
                    }
                    ${selectedAnswer && isOptionCorrect && "bg-green-200"}
                  `}
                >
                  <span dangerouslySetInnerHTML={{ __html: opt }} />
                  {selectedAnswer &&
                    (isSelected ? (
                      isCorrect ? (
                        <span>✅</span>
                      ) : (
                        <span>❌</span>
                      )
                    ) : isOptionCorrect ? (
                      <span>✅</span>
                    ) : null)}
                </li>
              );
            })}
          </ul>

          {selectedAnswer && (
            <div className="mt-4">
              {!isCorrect && (
                <p className="text-red-600">
                  Correct Answer: {currentQ.correctAnswer}
                </p>
              )}
              <button
                onClick={handleNext}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                {currentIndex + 1 === quiz.length
                  ? "View Results"
                  : "Next Question"}
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  if (showResults) {
    return (
      <main className="min-h-screen flex items-start justify-center bg-gray-50 mt-12">
        <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz Complete 🎉</h2>
          <p className="text-xl mb-6">
            Your Score: {score} / {quiz?.length}
          </p>
          <button
            onClick={() => {
              setQuiz(null);
              setShowResults(false);
              setScore(0);
              setCurrentIndex(0);
            }}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            New Quiz
          </button>
        </div>
      </main>
    );
  }

  return null;
}
