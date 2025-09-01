"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type Model = {
  id: string;
  name: string;
  desc: string;
  latency: string;
  free: boolean;
};

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
  selectedModel?: string;
  setSelectedModel?: (v: string) => void;
  models?: Model[];
  showModelSelect?: boolean;
};

const defaultModels: Model[] = [];

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
  selectedModel,
  setSelectedModel,
  models = defaultModels,
  showModelSelect = true,
}: Props) {
  React.useEffect(() => {
    console.log("QuizForm models prop:", models);
  }, [models]);
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

      {showModelSelect && (
        <div className="mb-4 mt-6">
          <label
            htmlFor="model-select"
            className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-2"
          >
            Select AI Open‑Source Model
          </label>
          {/* Ensure selectedModel and setSelectedModel are defined before using */}
          {selectedModel !== undefined && setSelectedModel !== undefined && (
            <Select
              onValueChange={setSelectedModel}
              defaultValue={selectedModel}
            >
              <SelectTrigger id="model-select" className="w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models?.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center justify-between">
                      <span>{model.name}</span>
                    </div>
                    <p className="text-xs text-gray-500">{model.desc}</p>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2 ">
          Number of Questions
        </label>
        <div className="flex gap-4">
          {["5", "10", "15", "20"].map((num) => (
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
        <label className="block text-sm font-medium mb-2 ">Difficulty</label>
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

      {loading && (
        <div className="flex items-center justify-center space-x-3 py-4">
          <svg
            className="animate-spin h-5 w-5 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-blue-600 font-medium">
            {quizLanguage === "中文"
              ? "正在生成题目 (通常需要几秒到几十秒)..."
              : "Generating Quiz (usually takes a few seconds)..."}
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {quizLanguage === "中文" ? "生成题目" : "Generate Quiz"}
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
