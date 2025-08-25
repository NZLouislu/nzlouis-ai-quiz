"use client";

import { useState, useEffect, useRef } from "react";

type QuizItem = {
  question: string;
  options: string[];
  correctAnswer: string;
  hint?: string;
};

type AIMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function GeminiAIQuizPage() {
  const [quizTopic, setQuizTopic] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState("3");
  const [difficulty, setDifficulty] = useState("easy");
  const [quiz, setQuiz] = useState<QuizItem[] | null>(null);
  const [quizLanguage, setQuizLanguage] = useState<"中文" | "English">(
    "English"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const aiScrollRef = useRef<HTMLDivElement>(null);
  const questionContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (aiScrollRef.current)
      aiScrollRef.current.scrollTop = aiScrollRef.current.scrollHeight;
  }, [aiMessages]);

  const isChinese = (text: string) => /[\u4e00-\u9fa5]/.test(text);

  const resetQuizState = () => {
    setQuiz(null);
    setScore(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowResults(false);
    setError(null);
    setLoading(false);
    setAiMessages([]);
    setAiInput("");
    setAiOpen(false);
    setShowHint(false);
  };

  const handleReset = () => {
    resetQuizState();
    setQuizTopic("");
    setNumberOfQuestions("3");
    setDifficulty("easy");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetQuizState();
    setLoading(true);
    const language = isChinese(quizTopic) ? "中文" : "English";
    setQuizLanguage(language);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizTopic,
          numberOfQuestions,
          difficulty,
          language,
        }),
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      if (!data.quiz || !Array.isArray(data.quiz) || data.quiz.length === 0) {
        setError("No quiz data received from API.");
        return;
      }
      setQuiz(data.quiz as QuizItem[]);
    } catch {
      setError(
        quizLanguage === "中文"
          ? "生成题目失败，请重试。"
          : "Failed to generate quiz. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (option: string) => {
    if (selectedAnswer !== null || !quiz) return;
    setSelectedAnswer(option);
    const correct = option === quiz[currentQuestionIndex].correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore((s) => s + 1);
  };

  const handleNextQuestion = () => {
    if (!quiz) return;
    setAiMessages([]);
    setAiInput("");
    setAiOpen(false);
    setShowHint(false);
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else setShowResults(true);
  };

  const handleAIMessage = async (
    message: string,
    mode: "initial" | "followup"
  ) => {
    if (!quiz) return;
    const currentQuestion = quiz[currentQuestionIndex];
    setAiLoading(true);
    if (mode === "followup")
      setAiMessages((prev) => [...prev, { role: "user", content: message }]);
    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          question: currentQuestion.question,
          options: currentQuestion.options,
          selectedAnswer,
          messages: aiMessages,
          language: quizLanguage,
        }),
      });
      const data = await response.json();
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message || "No response" },
      ]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            quizLanguage === "中文"
              ? "AI获取失败"
              : "AI failed to get response",
        },
      ]);
    } finally {
      setAiLoading(false);
      setAiInput("");
    }
  };

  const handleAskAI = () => {
    setAiMessages([]);
    setAiOpen(true);
    handleAIMessage("", "initial");
  };

  const handleShowHint = () => setShowHint(true);

  if (!isMounted) return null;

  const currentQuestion = quiz ? quiz[currentQuestionIndex] : null;
  const isLastQuestion = quiz
    ? currentQuestionIndex === quiz.length - 1
    : false;

  return (
    <main className="min-h-screen pt-16 pb-8 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto mt-8 flex flex-col lg:flex-row gap-6">
        <div
          className="flex-1 bg-white p-8 rounded-lg shadow-md"
          ref={questionContainerRef}
        >
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Gemini AI Quiz
          </h1>

          {!quiz && !showResults && (
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading
                  ? quizLanguage === "中文"
                    ? "生成题目中..."
                    : "Generating Quiz..."
                  : quizLanguage === "中文"
                  ? "生成题目"
                  : "Generate Quiz"}
              </button>
            </form>
          )}

          {error && (
            <div className="mt-8 p-4 bg-red-100 text-red-700 rounded-md">
              <p>{error}</p>
            </div>
          )}

          {quiz && !showResults && currentQuestion && (
            <div className="mt-8 space-y-6">
              <p className="text-gray-600 text-right">
                {quizLanguage === "中文" ? "问题" : "Question"}{" "}
                {currentQuestionIndex + 1}{" "}
                {quizLanguage === "中文" ? "共" : "of"} {quiz.length}
              </p>
              <div className="bg-gray-100 p-6 rounded-lg">
                <p className="font-semibold text-xl text-gray-900 mb-4">
                  {currentQuestion.question}
                </p>
                <ul className="space-y-3">
                  {currentQuestion.options.map((option, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleOptionClick(option)}
                      className={`p-4 rounded-md cursor-pointer transition-colors ${
                        selectedAnswer === option
                          ? isCorrect
                            ? "bg-green-200 text-green-800 border-2 border-green-500"
                            : "bg-red-200 text-red-800 border-2 border-red-500"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      } ${
                        selectedAnswer !== null &&
                        option === currentQuestion.correctAnswer
                          ? "bg-green-200 text-green-800 border-2 border-green-500"
                          : ""
                      }`}
                    >
                      {option}{" "}
                      {selectedAnswer === option && (
                        <span className="ml-2">{isCorrect ? "✅" : "❌"}</span>
                      )}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleShowHint}
                    className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors"
                  >
                    {quizLanguage === "中文" ? "提示" : "Hint"}
                  </button>
                  <button
                    onClick={handleAskAI}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                  >
                    {quizLanguage === "中文" ? "Ask AI" : "Ask AI"}
                  </button>
                </div>

                {showHint && currentQuestion.hint && (
                  <p className="mt-2 p-2 bg-gray-200 rounded-md text-gray-800">
                    {currentQuestion.hint}
                  </p>
                )}

                {selectedAnswer && (
                  <div className="mt-6">
                    {!isCorrect && (
                      <p className="text-red-700">
                        {quizLanguage === "中文"
                          ? "正确答案"
                          : "Correct Answer"}
                        : {currentQuestion.correctAnswer}
                      </p>
                    )}
                    <button
                      onClick={handleNextQuestion}
                      className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {isLastQuestion
                        ? quizLanguage === "中文"
                          ? "查看分数"
                          : "View Score"
                        : quizLanguage === "中文"
                        ? "下一题"
                        : "Next Question"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {showResults && (
            <div className="mt-8 text-center p-8 bg-white rounded-lg shadow-md">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {quizLanguage === "中文" ? "测验完成!" : "Quiz Complete!"}
              </h2>
              <p className="text-2xl text-gray-700">
                {quizLanguage === "中文"
                  ? "您的最终得分:"
                  : "Your final score is:"}
              </p>
              <p className="text-5xl font-extrabold text-blue-600 mt-2">
                {score} / {quiz ? quiz.length : 0}
              </p>
              <button
                onClick={handleReset}
                className="mt-8 bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
              >
                {quizLanguage === "中文" ? "创建新测验" : "Create New Quiz"}
              </button>
            </div>
          )}
        </div>

        {quiz && currentQuestion && aiOpen && (
          <div
            className="flex-shrink-0 w-full lg:w-96 bg-white rounded-lg shadow-md p-4 flex flex-col"
            style={{
              maxHeight: questionContainerRef.current?.offsetHeight || "80vh",
            }}
          >
            <h3 className="font-semibold text-lg mb-2">
              {quizLanguage === "中文" ? "AI 助手" : "AI Assistant"}
            </h3>
            <div
              ref={aiScrollRef}
              className="flex-1 overflow-y-auto p-2 bg-gray-50 rounded-md mb-2"
            >
              {aiMessages.map((msg, idx) => (
                <p key={idx} className="mb-2">
                  <span
                    className={
                      msg.role === "user" ? "font-medium" : "font-semibold"
                    }
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
                  {quizLanguage === "中文"
                    ? "AI 思考中..."
                    : "AI is thinking..."}
                </p>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        )}
      </div>
    </main>
  );
}
