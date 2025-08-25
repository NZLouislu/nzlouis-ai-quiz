"use client";

import React from "react";

type Props = {
  quizTopic: string;
  setQuizTopic: (v: string) => void;
  numberOfQuestions: string;
  setNumberOfQuestions: (v: string) => void;
  difficulty: string;
  setDifficulty: (v: string) => void;
  loading: boolean;
  quizLanguage: "中文" | "English";
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onRecommend: () => Promise<void>;
};

export default function QuizForm({
  quizTopic,
  setQuizTopic,
  numberOfQuestions,
  setNumberOfQuestions,
  difficulty,
  setDifficulty,
  loading,
  quizLanguage,
  onSubmit,
  onRecommend,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Quiz Topic
        </label>
        <input
          type="text"
          value={quizTopic}
          onChange={(e) => setQuizTopic(e.target.value)}
          placeholder="Enter your quiz topic"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Number of Questions
        </label>
        <div className="flex gap-4">
          {["3", "5", "10"].map((num) => (
            <label key={num} className="flex items-center">
              <input
                type="radio"
                name="questions"
                value={num}
                checked={numberOfQuestions === num}
                onChange={(e) => setNumberOfQuestions(e.target.value)}
                className="mr-2"
              />
              {num}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
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

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {loading
            ? quizLanguage === "中文"
              ? "生成题目中..."
              : "Generating Quiz..."
            : quizLanguage === "中文"
            ? "生成题目"
            : "Generate Quiz"}
        </button>
        <button
          type="button"
          onClick={onRecommend}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
        >
          {quizLanguage === "中文" ? "推荐Topic" : "Recommend Topic"}
        </button>
      </div>
    </form>
  );
}
