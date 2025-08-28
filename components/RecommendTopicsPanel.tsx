"use client";

import React from "react";

type Props = {
  aiLoadingRecommend: boolean;
  recommendations: string[];
  onSelectTopic: (topic: string) => void;
  onClose: () => void;
  questionContainerRef: React.RefObject<HTMLDivElement | null>;
  quizLanguage: "中文" | "English";
};

export default function RecommendTopicsPanel({
  aiLoadingRecommend,
  recommendations,
  onSelectTopic,
  onClose,
  questionContainerRef,
  quizLanguage,
}: Props) {
  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 flex flex-col h-full"
    >
      <h3 className="font-semibold text-lg mb-2">
        {quizLanguage === "中文" ? "推荐题目" : "Recommended Topics"}
      </h3>
      <div className="flex-1 overflow-y-auto p-2 bg-gray-50 rounded-md mb-2">
        {aiLoadingRecommend ? (
          <p>{quizLanguage === "中文" ? "AI 生成中..." : "Generating..."}</p>
        ) : (
          <ul className="space-y-2">
            {recommendations.map((topic, idx) => (
              <li
                key={idx}
                onClick={() => onSelectTopic(topic)}
                className="cursor-pointer p-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                {topic}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        onClick={onClose}
        className="mt-4 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
      >
        {quizLanguage === "中文" ? "关闭" : "Close"}
      </button>
    </div>
  );
}
