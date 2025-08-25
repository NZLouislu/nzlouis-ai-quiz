"use client";
import { useState } from "react";
export default function CustomAIQuizPage() {
  const [quizTopic, setQuizTopic] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState("3");
  const [difficulty, setDifficulty] = useState("easy");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      quizTopic,
      numberOfQuestions,
      difficulty,
    });
  };
  return (
    <>
      <main className="min-h-screen pt-16 pb-8 px-4">
        <div className="max-w-2xl mx-auto mt-8">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Create Your Custom AI Quiz
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="quizTopic"
                className="block text-sm font-medium mb-2"
              >
                Quiz Topic
              </label>
              <input
                type="text"
                id="quizTopic"
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                placeholder="Enter your quiz topic"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Number of Questions
              </label>
              <div className="flex gap-4">
                {["3", "5", "10"].map((num) => (
                  <label key={num} className="flex items-center">
                    <input
                      type="radio"
                      name="numberOfQuestions"
                      value={num}
                      checked={numberOfQuestions === num}
                      onChange={(e) => setNumberOfQuestions(e.target.value)}
                      className="mr-2"
                    />
                    <span>{num}</span>
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
                  <label key={level} className="flex items-center">
                    <input
                      type="radio"
                      name="difficulty"
                      value={level}
                      checked={difficulty === level}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="mr-2"
                    />
                    <span className="capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Start Quiz
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
