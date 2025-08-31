"use client";

import { useEffect, useRef, useState } from "react";
import QuizForm from "../../components/QuizForm";
import AIAssistant from "../../components/AIAssistant";
import RecommendTopicsPanel from "../../components/RecommendTopicsPanel";
import QuizQuestionDisplay from "../../components/QuizQuestionDisplay";

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

const models = [
  { id: "openai/gpt-oss-120b:free", name: "GPT-OSS 120B", desc: "OpenAI's open-source 120B model", latency: "150ms", free: true },
  { id: "deepseek/deepseek-chat-v3-0324:free", name: "DeepSeek Chat V3", desc: "Strong reasoning, complex quiz generation", latency: "120ms", free: true },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "LLaMA 3.3 70B Instruct", desc: "Versatile, general-purpose, powerful instruction following", latency: "140ms", free: true },
  { id: "nousresearch/deephermes-3-llama-3-8b-preview:free", name: "Nous DeepHermes 3 Llama 3 8B Preview", desc: "Structured output, fine-tuned Llama 3 variant", latency: "130ms", free: true }
];

export default function CustomAIQuizPage() {
  const [quizTopic, setQuizTopic] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState("5");
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
  const [selectedModel, setSelectedModel] = useState(models[0].id);

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
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetQuizState();
    setLoading(true);
    const language = isChinese(quizTopic) ? "中文" : "English";
    setQuizLanguage(language);
    try {
      const response = await fetch("/api/custome-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizTopic,
          numberOfQuestions,
          difficulty,
          language,
          model: selectedModel,
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
          model: selectedModel,
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
      if (!response.ok) throw new Error("recommend API error");
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

  return (
    <div className="flex-1 flex flex-col p-4">
      <div className="w-full max-w-[900px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_340px] gap-6">
        <div
          className="bg-white/30 backdrop-blur-md p-6 rounded-lg shadow-xl"
          ref={questionContainerRef}
        >
          <h1 className="text-3xl font-bold mb-2 text-center text-gray-800 dark:text-gray-900 flex items-center justify-center gap-2">
            🛠 Custom AI Quiz
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-700 mb-8">
            Multi-model quiz engine leveraging diverse open-source AI models
          </p>

          {!quiz && !showResults && (
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
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              models={models}
            />
          )}

          {error && (
            <div className="mt-8 p-4 bg-red-100/50 text-red-700 rounded-md backdrop-blur-sm">
              <p>{error}</p>
            </div>
          )}

          {quiz && !showResults && currentQuestion && (
            <QuizQuestionDisplay
              question={currentQuestion.question}
              options={currentQuestion.options}
              correctAnswer={currentQuestion.correctAnswer}
              currentIndex={currentQuestionIndex}
              totalQuestions={quiz.length}
              selectedAnswer={selectedAnswer}
              isCorrect={isCorrect}
              score={score}
              onAnswer={handleOptionClick}
              onAskAI={handleAskAI}
              onNext={handleNextQuestion}
              onReset={handleReset}
              quizLanguage={quizLanguage}
              onShowHint={handleShowHint}
              hint={currentQuestion.hint}
              showHint={showHint}
            />
          )}

          {showResults && (
            <div className="mt-8 text-center p-8 bg-white/30 backdrop-blur-md rounded-lg shadow-xl">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-900 mb-4">
                {quizLanguage === "中文" ? "测验完成!" : "Quiz Complete!"}
              </h2>
              <p className="text-2xl text-gray-700 dark:text-gray-800">
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
              quizLanguage={quizLanguage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
