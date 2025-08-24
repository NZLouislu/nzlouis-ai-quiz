"use client";

import * as React from "react";
import { useState } from "react";

type Difficulty = "Easy" | "Medium" | "Hard";

type TriviaQuestion = {
  category: string;
  type: "multiple";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  allAnswers: string[];
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

export default function TriviaApiQuizPage() {
  const [category, setCategory] = useState("9");
  const [numQuestions, setNumQuestions] = useState("3");
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const generateQuestions = async () => {
    if (!category) return;

    setIsLoading(true);
    setShowResults(false);

    try {
      const difficultyMap: Record<Difficulty, string> = {
        Easy: "easy",
        Medium: "medium",
        Hard: "hard",
      };

      const res = await fetch(
        `https://opentdb.com/api.php?amount=${numQuestions}&category=${category}&difficulty=${difficultyMap[difficulty]}&type=multiple`
      );
      const data: { results: Omit<TriviaQuestion, "allAnswers">[] } =
        await res.json();

      if (data.results) {
        const formatted: TriviaQuestion[] = data.results.map((q) => {
          const allAnswers = [...q.incorrect_answers];
          const randomIndex = Math.floor(
            Math.random() * (allAnswers.length + 1)
          );
          allAnswers.splice(randomIndex, 0, q.correct_answer);
          return { ...q, allAnswers };
        });

        setQuestions(formatted);
        setCurrentIndex(0);
        setScore(0);
        setSelectedAnswer("");
        setShowFeedback(false);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);

    const currentQuestion = questions[currentIndex];
    if (answer === currentQuestion.correct_answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer("");
      setShowFeedback(false);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer("");
    setShowFeedback(false);
    setShowResults(false);
  };

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">🎯 Trivia API Quiz</h1>
        <div className="text-center space-y-4 border p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Quiz Complete!</h2>
          <p className="text-lg">
            Your Score: {score}/{questions.length}
          </p>
          <p className="text-gray-600">
            {score === questions.length
              ? "Perfect! 🎉"
              : score >= questions.length * 0.7
              ? "Great job! 👏"
              : "Keep practicing! 📚"}
          </p>
          <button
            onClick={resetQuiz}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            New Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">🎯 Trivia API Quiz</h1>

      {questions.length === 0 ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium">
              Select Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <span className="block text-sm font-medium">
              Number of Questions
            </span>
            <div className="flex gap-6">
              {["3", "5", "10"].map((num) => (
                <label
                  key={num}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="numQuestions"
                    value={num}
                    checked={numQuestions === num}
                    onChange={(e) => setNumQuestions(e.target.value)}
                    className="h-4 w-4 text-blue-600 accent-blue-600"
                  />
                  <span className="text-sm">{num}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <span className="block text-sm font-medium">Difficulty</span>
            <div className="flex gap-6">
              {["Easy", "Medium", "Hard"].map((level) => (
                <label
                  key={level}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={difficulty === level}
                    onChange={(e) =>
                      setDifficulty(e.target.value as Difficulty)
                    }
                    className="h-4 w-4 text-blue-600 accent-blue-600"
                  />
                  <span className="text-sm">{level}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={generateQuestions}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating..." : "Start Quiz"}
          </button>
        </div>
      ) : (
        <div className="space-y-4 border p-4 rounded-lg shadow">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span>Score: {score}</span>
          </div>

          <h2
            className="text-lg font-semibold"
            dangerouslySetInnerHTML={{
              __html: questions[currentIndex].question,
            }}
          />

          <div className="flex flex-col gap-3">
            {questions[currentIndex].allAnswers.map((answer, i) => {
              const isCorrect =
                answer === questions[currentIndex].correct_answer;
              const isSelected = answer === selectedAnswer;

              let optionClass =
                "flex items-start gap-3 p-2 rounded cursor-pointer transition-colors";

              if (showFeedback) {
                if (isSelected && isCorrect) {
                  optionClass += " bg-green-200 border border-green-600";
                } else if (isSelected && !isCorrect) {
                  optionClass += " bg-red-200 border border-red-600";
                } else if (isCorrect) {
                  optionClass += " bg-green-100 border border-green-400";
                }
              } else {
                optionClass += " hover:bg-gray-50";
              }

              return (
                <div
                  key={i}
                  onClick={() => handleAnswer(answer)}
                  className={optionClass}
                  dangerouslySetInnerHTML={{ __html: answer }}
                />
              );
            })}
          </div>

          {showFeedback && (
            <div className="text-center">
              {selectedAnswer === questions[currentIndex].correct_answer ? (
                <p className="text-green-700 font-medium mt-2">✅ Correct!</p>
              ) : (
                <p className="text-red-700 font-medium mt-2">
                  ❌ Wrong! Correct answer:{" "}
                  <span
                    dangerouslySetInnerHTML={{
                      __html: questions[currentIndex].correct_answer,
                    }}
                  />
                </p>
              )}
            </div>
          )}

          {showFeedback && (
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 mt-3"
            >
              {currentIndex + 1 === questions.length
                ? "Finish Quiz"
                : "Next Question"}
            </button>
          )}

          <button
            onClick={resetQuiz}
            className="w-full mt-3 border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
