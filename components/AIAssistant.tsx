"use client";

import React from "react";

type AIMessage = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  aiMessages: AIMessage[];
  aiInput: string;
  setAiInput: (v: string) => void;
  aiLoading: boolean;
  handleAIMessage: (
    message: string,
    mode: "initial" | "followup"
  ) => Promise<void>;
  quizLanguage: "中文" | "English";
  aiScrollRef: React.RefObject<HTMLDivElement | null>;
  questionContainerRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
};

export default function AIAssistant({
  aiMessages,
  aiInput,
  setAiInput,
  aiLoading,
  handleAIMessage,
  quizLanguage,
  aiScrollRef,
  questionContainerRef,
  onClose,
}: Props) {
  return (
    <div
      className="relative bg-white/30 backdrop-blur-md rounded-lg shadow-xl p-6 flex flex-col text-gray-800 dark:text-gray-100"
      style={{
        maxHeight: questionContainerRef.current?.offsetHeight || "80vh",
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-200/50 backdrop-blur-sm text-gray-600 hover:bg-gray-300/50 flex items-center justify-center font-bold"
      >
        ×
      </button>
      <h3 className="font-semibold text-lg mb-4 pr-8 text-gray-800 dark:text-gray-100">
        {quizLanguage === "中文" ? "AI 助手" : "AI Assistant"}
      </h3>
      <div
        ref={aiScrollRef}
        className="flex-1 overflow-y-auto p-2 bg-white/40 backdrop-blur-sm rounded-md mb-4 text-gray-800 dark:text-gray-100 space-y-3"
      >
        {aiMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
          >
            {msg.role === "assistant" && (
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-2">
                AI
              </div>
            )}
            <div
              className={`px-3 py-2 rounded-lg ${msg.role === "assistant" ? "bg-blue-50/50 text-left backdrop-blur-sm" : "bg-green-50/50 text-right backdrop-blur-sm"}`}
              style={{ maxWidth: "88%" }}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold ml-2">
                {quizLanguage === "中文" ? "你" : "You"}
              </div>
            )}
          </div>
        ))}
        {aiLoading && (
          <p>
            {quizLanguage === "中文" ? "AI 思考中..." : "AI is thinking..."}
          </p>
        )}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-300"
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (aiInput.trim()) handleAIMessage(aiInput, "followup");
            }
          }}
          placeholder={quizLanguage === "中文" ? "向AI提问..." : "Ask AI about this question..."}
        />
        <button
          onClick={() => {
            if (aiInput.trim()) handleAIMessage(aiInput, "followup");
          }}
          disabled={aiLoading || !aiInput.trim()}
          className="bg-purple-600 text-white px-4 rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-400"
        >
          {quizLanguage === "中文" ? "发送" : "Send"}
        </button>
      </div>
    </div>
  );
}
