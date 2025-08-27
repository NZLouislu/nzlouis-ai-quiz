"use client";

import { useEffect, useRef, useState } from "react";
import QuizForm from "../../components/QuizForm";
import AIAssistant from "../../components/AIAssistant";
import RecommendTopicsPanel from "../../components/RecommendTopicsPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [aiRecommendOpen, setAiRecommendOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [aiLoadingRecommend, setAiLoadingRecommend] = useState(false);

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
    setAiRecommendOpen(false);
    setRecommendations([]);
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

  const handleRecommendTopic = async () => {
    setAiRecommendOpen(true);
    setAiLoadingRecommend(true);
    try {
      const response = await fetch("/api/recommend-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: quizLanguage }),
      });
      const data = await response.json();
      setRecommendations(data.topics || []);
    } catch {
      setRecommendations([]);
    } finally {
      setAiLoadingRecommend(false);
    }
  };

  if (!isMounted) return null;

  const currentQuestion = quiz ? quiz[currentQuestionIndex] : null;
  const isLastQuestion = quiz
    ? currentQuestionIndex === quiz.length - 1
    : false;

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4">
      <div className="w-full max-w-[900px] grid grid-cols-1 md:grid-cols-[1fr_340px] gap-6 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl text-center">
              Gemini AI Quiz
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div ref={questionContainerRef}>
              {!quiz && !showResults && (
                <div className="w-full">
                  <QuizForm
                    quizTopic={quizTopic}
                    setQuizTopic={setQuizTopic}
                    numberOfQuestions={numberOfQuestions}
                    setNumberOfQuestions={setNumberOfQuestions}
                    difficulty={difficulty}
                    setDifficulty={setDifficulty}
                    loading={loading}
                    quizLanguage={quizLanguage}
                    onSubmit={handleSubmit}
                    onRecommend={handleRecommendTopic}
                  />
                </div>
              )}

              {error && (
                <div className="mt-4">
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </div>
              )}

              {quiz && !showResults && currentQuestion && (
                <div className="mt-6">
                  <p className="text-right mb-2 text-sm md:text-base">
                    {quizLanguage === "中文" ? "问题" : "Question"}{" "}
                    {currentQuestionIndex + 1}{" "}
                    {quizLanguage === "中文" ? "共" : "of"} {quiz.length}
                  </p>
                  <p className="font-semibold text-lg md:text-xl mb-4">
                    {currentQuestion.question}
                  </p>
                  <div className="flex flex-col gap-3">
                    {currentQuestion.options.map((option, idx) => {
                      const selected = selectedAnswer === option;
                      const correctOption =
                        option === currentQuestion.correctAnswer;
                      const wrongSelected = selected && isCorrect === false;
                      const revealState = selectedAnswer !== null;
                      const baseClass =
                        "w-full text-left rounded-md py-3 px-4 transition-all transform focus:outline-none disabled:opacity-90";
                      const hoverClass =
                        "hover:shadow-lg hover:scale-[1.01] cursor-pointer";
                      let stateClass = "bg-gray-50 border border-gray-200";
                      if (revealState) {
                        if (correctOption)
                          stateClass =
                            "bg-green-300 border-2 border-green-600 text-green-900";
                        else if (wrongSelected)
                          stateClass =
                            "bg-red-300 border-2 border-red-600 text-red-900";
                        else
                          stateClass =
                            "bg-gray-50 border border-gray-200 opacity-80";
                      } else {
                        stateClass = "bg-gray-50 border border-gray-200";
                      }
                      return (
                        <button
                          key={idx}
                          onClick={() => handleOptionClick(option)}
                          className={`${baseClass} ${stateClass} ${
                            !revealState ? hoverClass : ""
                          }`}
                          disabled={selectedAnswer !== null}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option}</span>
                            <span className="ml-4">
                              {selected && (isCorrect ? "✅" : "❌")}{" "}
                              {!selected &&
                                revealState &&
                                correctOption &&
                                "✅"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleShowHint}
                      className="flex-1 py-3 rounded-md text-white font-medium shadow-sm focus:outline-none transition-all bg-yellow-500 hover:bg-yellow-600"
                    >
                      {quizLanguage === "中文" ? "提示" : "Hint"}
                    </button>
                    <button
                      onClick={handleAskAI}
                      className="flex-1 py-3 rounded-md text-white font-medium shadow-sm focus:outline-none transition-all bg-violet-600 hover:bg-violet-700"
                    >
                      {quizLanguage === "中文" ? "Ask AI" : "Ask AI"}
                    </button>
                  </div>

                  {showHint && currentQuestion.hint && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      {currentQuestion.hint}
                    </div>
                  )}

                  {selectedAnswer && isCorrect === false && (
                    <p className="mt-3 text-red-600 font-medium">
                      {quizLanguage === "中文"
                        ? "正确答案："
                        : "Correct Answer: "}{" "}
                      {currentQuestion.correctAnswer}
                    </p>
                  )}

                  {selectedAnswer && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={handleNextQuestion}
                        className="flex-1 py-3 rounded-md text-white font-medium shadow-sm focus:outline-none transition-all bg-blue-600 hover:bg-blue-700"
                      >
                        {isLastQuestion
                          ? quizLanguage === "中文"
                            ? "查看分数"
                            : "View Score"
                          : quizLanguage === "中文"
                          ? "下一题"
                          : "Next Question"}
                      </button>
                      <button
                        onClick={handleReset}
                        className="flex-1 py-3 rounded-md text-gray-800 font-medium shadow-sm focus:outline-none transition-all bg-gray-200 hover:bg-gray-300"
                      >
                        {quizLanguage === "中文" ? "重置" : "Reset"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {showResults && (
                <div className="mt-6">
                  <div className="text-center">
                    <h2 className="text-2xl md:text-3xl mb-2">
                      {quizLanguage === "中文" ? "测验完成!" : "Quiz Complete!"}
                    </h2>
                    <p className="text-lg">
                      {quizLanguage === "中文"
                        ? "您的最终得分:"
                        : "Your final score is:"}
                    </p>
                    <p className="text-4xl md:text-5xl font-extrabold text-blue-600 mt-2">
                      {score} / {quiz ? quiz.length : 0}
                    </p>
                    <button
                      onClick={handleReset}
                      className="mt-4 py-3 px-6 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700"
                    >
                      {quizLanguage === "中文"
                        ? "创建新测验"
                        : "Create New Quiz"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {quiz && currentQuestion && aiOpen && (
                <AIAssistant
                  aiMessages={aiMessages}
                  aiInput={aiInput}
                  setAiInput={setAiInput}
                  aiLoading={aiLoading}
                  handleAIMessage={handleAIMessage}
                  quizLanguage={quizLanguage}
                  aiScrollRef={aiScrollRef}
                  questionContainerRef={questionContainerRef}
                  onClose={() => setAiOpen(false)}
                />
          )}

          {aiRecommendOpen && (
            <RecommendTopicsPanel
              aiLoadingRecommend={aiLoadingRecommend}
              recommendations={recommendations}
              onSelectTopic={(topic) => {
                              setQuizTopic(topic);
                              setAiRecommendOpen(false);
                            }}
              onClose={() => setAiRecommendOpen(false)}
              questionContainerRef={questionContainerRef}
              quizLanguage={quizLanguage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
