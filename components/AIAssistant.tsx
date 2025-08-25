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
}: Props) {
  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 flex flex-col text-black"
      style={{
        maxHeight: questionContainerRef.current?.offsetHeight || "80vh",
      }}
    >
      <h3 className="font-semibold text-lg mb-2">
        {quizLanguage === "中文" ? "AI 助手" : "AI Assistant"}
      </h3>
      <div
        ref={aiScrollRef}
        className="flex-1 overflow-y-auto p-2 bg-gray-50 rounded-md mb-2 text-black"
      >
        {aiMessages.map((msg, idx) => (
          <p key={idx} className="mb-2">
            <span
              className={msg.role === "user" ? "font-medium" : "font-semibold"}
            >
              {msg.role === "user"
                ? quizLanguage === "中文"
                  ? "你: "
                  : "You: "
                : "AI: "}
            </span>
            {msg.content}
          </p>
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
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (aiInput.trim()) handleAIMessage(aiInput, "followup");
            }
          }}
          placeholder={
            quizLanguage === "中文"
              ? "向AI提问..."
              : "Ask AI about this question..."
          }
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
