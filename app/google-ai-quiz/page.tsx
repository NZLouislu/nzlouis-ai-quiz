"use client";
import { useState } from "react";
import Footer from "@/components/Footer";
import * as Form from "@radix-ui/react-form";
import * as RadioGroup from "@radix-ui/react-radio-group";
export default function GoogleAIQuizPage() {
  const [quizTopic, setQuizTopic] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState("3");
  const [difficulty, setDifficulty] = useState("easy");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle quiz generation logic here
    console.log({
      quizTopic,
      numberOfQuestions,
      difficulty,
    });
  };
  return (
    <>
      <main className="min-h-screen pt-16 pb-8 px-4">
        <div className="max-w-2xl mx-auto mt-8">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Generate Google AI Quiz
          </h1>
          <Form.Root onSubmit={handleSubmit} className="space-y-6">
            <Form.Field name="quizTopic">
              <Form.Label className="block text-sm font-medium mb-2">
                Quiz Topic
              </Form.Label>
              <Form.Control asChild>
                <input
                  type="text"
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  placeholder="Enter your quiz topic"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </Form.Control>
            </Form.Field>
            <div>
              <label className="block text-sm font-medium mb-2">
                Number of Questions
              </label>
              <RadioGroup.Root
                value={numberOfQuestions}
                onValueChange={setNumberOfQuestions}
                className="flex gap-4"
              >
                {["3", "5", "10"].map((num) => (
                  <div key={num} className="flex items-center">
                    <RadioGroup.Item
                      value={num}
                      id={`questions-${num}`}
                      className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                    >
                      <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-blue-600" />
                    </RadioGroup.Item>
                    <label htmlFor={`questions-${num}`}>{num}</label>
                  </div>
                ))}
              </RadioGroup.Root>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Difficulty
              </label>
              <RadioGroup.Root
                value={difficulty}
                onValueChange={setDifficulty}
                className="flex gap-4"
              >
                {["easy", "medium", "hard"].map((level) => (
                  <div key={level} className="flex items-center">
                    <RadioGroup.Item
                      value={level}
                      id={`difficulty-${level}`}
                      className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                    >
                      <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-blue-600" />
                    </RadioGroup.Item>
                    <label
                      htmlFor={`difficulty-${level}`}
                      className="capitalize"
                    >
                      {level}
                    </label>
                  </div>
                ))}
              </RadioGroup.Root>
            </div>
            <Form.Submit asChild>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Generate Google AI Quiz
              </button>
            </Form.Submit>
          </Form.Root>
        </div>
      </main>
      <Footer />
    </>
  );
}
