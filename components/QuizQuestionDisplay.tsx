"use client";

import React from "react";
import DOMPurify from "dompurify";

interface QuizQuestionDisplayProps {
  question: string;
  options: string[];
  correctAnswer: string;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  score: number;
  onAnswer: (option: string) => void;
  onAskAI: () => void;
  onNext: () => void;
  onReset: () => void;
  quizLanguage?: "中文" | "English";
  onShowHint?: () => void;
  hint?: string;
  showHint?: boolean;
}

const getOptionLetter = (index: number) => {
  return String.fromCharCode(65 + index);
};

const QuizQuestionDisplay: React.FC<QuizQuestionDisplayProps> = ({
  question,
  options,
  correctAnswer,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  isCorrect,
  score,
  onAnswer,
  onAskAI,
  onNext,
  onReset,
  quizLanguage = "English",
  onShowHint,
  hint,
  showHint,
}) => {
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <>
      <div className="flex justify-between text-sm text-gray-600 mb-4">
        <span>
          {quizLanguage === "中文" ? "问题" : "Question"} {currentIndex + 1} /{" "}
          {totalQuestions}
        </span>
        <span>
          {quizLanguage === "中文" ? "得分" : "Score"}: {score}
        </span>
      </div>

      <h2
        className="text-lg font-semibold mb-6"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question) }}
      />

      <ul className="space-y-3">
        {options.map((opt, i) => {
          const isOptionCorrect = opt === correctAnswer;
          const isSelected = selectedAnswer === opt;
          const wrongSelected = isSelected && isCorrect === false;
          const revealState = selectedAnswer !== null;

          const baseClass =
            "p-4 rounded-lg cursor-pointer transition flex justify-between items-center";
          let stateClass = "bg-gray-100 hover:bg-gray-200";

          if (revealState) {
            if (isOptionCorrect) {
              stateClass = "bg-green-200";
            } else if (wrongSelected) {
              stateClass = "bg-red-200";
            } else {
              stateClass = "bg-gray-100 opacity-80";
            }
          }

          return (
            <li
              key={i}
              onClick={() => onAnswer(opt)}
              className={`${baseClass} ${stateClass}`}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(`${getOptionLetter(i)}. ${opt}`),
                }}
              />
              {revealState && (
                <span className="ml-4">
                  {isOptionCorrect ? "✅" : wrongSelected ? "❌" : ""}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex gap-3">
        {onShowHint && (
          <button
            onClick={onShowHint}
            className="flex-1 py-3 rounded-md text-white font-medium shadow-sm focus:outline-none transition-all bg-yellow-500 hover:bg-yellow-600"
          >
            {quizLanguage === "中文" ? "提示" : "Hint"}
          </button>
        )}
        <button
          onClick={onAskAI}
          className={`py-3 rounded-md text-white font-medium shadow-sm focus:outline-none transition-all bg-purple-600 hover:bg-purple-700 ${onShowHint ? 'flex-1' : 'w-full'}`}
        >
          {quizLanguage === "中文" ? "问AI" : "Ask AI"}
        </button>
      </div>

      {showHint && hint && (
        <div className="mt-3 p-3 bg-gray-50 rounded-md">
          <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(hint) }} />
        </div>
      )}

      {selectedAnswer && !isCorrect && (
        <p className="mt-3 text-red-600 font-medium">
          {quizLanguage === "中文" ? "正确答案：" : "Correct Answer: "}{" "}
          <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(correctAnswer) }} />
        </p>
      )}

      {selectedAnswer && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={onNext}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {isLastQuestion
              ? quizLanguage === "中文"
                ? "查看结果"
                : "View Results"
              : quizLanguage === "中文"
              ? "下一题"
              : "Next Question"}
          </button>
          <button
            onClick={onReset}
            className="flex-1 py-3 rounded-md text-gray-800 font-medium shadow-sm focus:outline-none transition-all bg-gray-200 hover:bg-gray-300"
          >
            {quizLanguage === "中文" ? "重置" : "Reset"}
          </button>
        </div>
      )}
    </>
  );
};

export default QuizQuestionDisplay;
