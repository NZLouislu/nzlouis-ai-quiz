"use client";

import { useEffect, useRef, useState } from "react";
import AIAssistant from "../../components/AIAssistant";
import QuizQuestionDisplay from "../../components/QuizQuestionDisplay";

type QuizItem = {
  question: string;
  options: string[];
  correctAnswer: string;
};

type AIMessage = {
  role: "user" | "assistant";
  content: string;
};

const categories = [
  { id: "9", name: "General Knowledge" },
  { id: "10", name: "Entertainment: Books" },
  { id: "11", name: "Entertainment: Film" },
  { id: "12", name: "Entertainment: Music" },
  { id: "13", name: "Entertainment: Musicals & Theatres" },
  { id: "14", name: "Entertainment: Television" },
  { id: "15", name: "Entertainment: Video Games" },
  { id: "16", name: "Entertainment: Board Games" },
  { id: "17", name: "Science & Nature" },
  { id: "18", name: "Science: Computers" },
  { id: "19", name: "Science: Mathematics" },
  { id: "20", name: "Mythology" },
  { id: "21", name: "Sports" },
  { id: "22", name: "Geography" },
  { id: "23", name: "History" },
  { id: "24", name: "Politics" },
  { id: "25", name: "Art" },
  { id: "26", name: "Celebrities" },
  { id: "27", name: "Animals" },
];

export default function TriviaQuizPage() {
  const [category, setCategory] = useState("9");
  const [numQuestions, setNumQuestions] = useState("3");
  const [difficulty, setDifficulty] = useState("easy");
  const [quiz, setQuiz] = useState<QuizItem[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const aiScrollRef = useRef<HTMLDivElement | null>(null);
  const questionContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (aiScrollRef.current)
      aiScrollRef.current.scrollTop = aiScrollRef.current.scrollHeight;
  }, [aiMessages]);

  const handleStart = async () => {
    setLoading(true);
    setQuiz(null);
    setShowResults(false);
    setScore(0);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setAiOpen(false);
    setAiMessages([]);
    const res = await fetch("/api/trivia-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, numQuestions, difficulty }),
    });
    const data = await res.json();
    setQuiz(data.quiz);
    setLoading(false);
  };

  const handleAnswer = (option: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(option);
    const correct = option === quiz![currentIndex].correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentIndex + 1 < quiz!.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setAiOpen(false);
      setAiMessages([]);
      setAiInput("");
    } else {
      setShowResults(true);
      setAiOpen(false);
    }
  };

  const handleAIMessage = async (
    message: string,
    mode: "initial" | "followup"
  ) => {
    if (!quiz) return;
    const currentQ = quiz[currentIndex];
    setAiLoading(true);
    if (mode === "followup")
      setAiMessages((prev) => [...prev, { role: "user", content: message }]);
    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          question: currentQ.question,
          options: currentQ.options,
          selectedAnswer,
          messages: aiMessages,
          language: "English",
        }),
      });
      const data = await res.json();
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message || "No response" },
      ]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", content: "AI failed to get response" },
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

  const handleResetQuiz = () => {
    setQuiz(null);
    setShowResults(false);
    setScore(0);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setAiOpen(false);
    setAiMessages([]);
  };

  return (
    <main className="min-h-screen pt-16 pb-8 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto mt-8 flex flex-col lg:flex-row gap-6">
        <div
          className="flex-1 bg-white p-8 rounded-lg shadow-md"
          ref={questionContainerRef}
        >
          <h1 className="text-2xl font-bold text-center mb-6">
            🎯 Trivia Quiz
          </h1>

          {!quiz && !showResults && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border rounded p-2"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Questions
                </label>
                <div className="flex gap-4">
                  {["3", "5", "10"].map((num) => (
                    <label key={num} className="flex items-center gap-1">
                      <input
                        type="radio"
                        value={num}
                        checked={numQuestions === num}
                        onChange={(e) => setNumQuestions(e.target.value)}
                      />
                      {num}
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
                    <label key={level} className="flex items-center gap-1">
                      <input
                        type="radio"
                        value={level}
                        checked={difficulty === level}
                        onChange={(e) => setDifficulty(e.target.value)}
                      />
                      <span className="capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStart}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
              >
                {loading ? "Loading..." : "Start Quiz"}
              </button>
            </div>
          )}

          {quiz && !showResults && (
            <QuizQuestionDisplay
              question={quiz[currentIndex].question}
              options={quiz[currentIndex].options}
              correctAnswer={quiz[currentIndex].correctAnswer}
              currentIndex={currentIndex}
              totalQuestions={quiz.length}
              selectedAnswer={selectedAnswer}
              isCorrect={isCorrect}
              score={score}
              onAnswer={handleAnswer}
              onAskAI={handleAskAI}
              onNext={handleNext}
              onReset={handleResetQuiz}
              quizLanguage={"English"}
            />
          )}

          {showResults && (
            <div className="text-center p-6">
              <h2 className="text-2xl font-bold mb-4">Quiz Complete 🎉</h2>
              <p className="text-xl mb-6">
                Your Score: {score} / {quiz?.length}
              </p>
              <button
                onClick={handleResetQuiz}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                New Quiz
              </button>
            </div>
          )}
        </div> 

        <div className="flex-shrink-0 w-full lg:w-96 flex flex-col gap-6">
          {aiOpen && quiz && (
            <AIAssistant
              aiMessages={aiMessages}
              aiInput={aiInput}
              setAiInput={setAiInput}
              aiLoading={aiLoading}
              handleAIMessage={handleAIMessage}
              quizLanguage={"English"}
              aiScrollRef={aiScrollRef}
              questionContainerRef={questionContainerRef}
              onClose={() => setAiOpen(false)}
            />
          )}
        </div>
      </div>
    </main>
  );
}