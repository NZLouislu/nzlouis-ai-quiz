"use client";

import * as React from "react";
import { useState } from "react";

export default function TriviaApiQuizPage() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState("3");
  const [difficulty, setDifficulty] = useState("Easy");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const generateQuestions = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setShowResults(false);

    try {
      const difficultyMap = { Easy: "easy", Medium: "medium", Hard: "hard" };
      const res = await fetch(
        `https://opentdb.com/api.php?amount=${numQuestions}&difficulty=${difficultyMap[difficulty]}&type=multiple`
      );
      const data = await res.json();

      if (data.results) {
        const formatted = data.results.map((q: any) => {
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
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = () => {
    if (!questions.length) return;
    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer("");
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer("");
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
            <label htmlFor="topic" className="block text-sm font-medium">
              Quiz Topic
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your quiz topic"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="h-4 w-4 text-blue-600 accent-blue-600"
                  />
                  <span className="text-sm">{level}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={generateQuestions}
            disabled={!topic.trim() || isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating..." : "Generate Trivia API Quiz"}
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
            {questions[currentIndex].allAnswers.map(
              (answer: string, i: number) => (
                <label
                  key={i}
                  className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="answer"
                    value={answer}
                    checked={selectedAnswer === answer}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    className="h-4 w-4 text-blue-600 accent-blue-600 mt-0.5"
                  />
                  <span
                    className="flex-1"
                    dangerouslySetInnerHTML={{ __html: answer }}
                  />
                </label>
              )
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAnswer}
              disabled={!selectedAnswer}
              className="px-6 py-2 rounded-lg bg-green-600 text-white shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentIndex + 1 === questions.length ? "Finish" : "Next"}
            </button>
            <button
              onClick={resetQuiz}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 shadow hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
