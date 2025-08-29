"use client";
import Link from "next/link";
import Image from "next/image";

export default function HFQuizPage() {
  return (
    <div className="min-h-screen flex items-start justify-center p-4">
      <div className="w-full max-w-[900px] bg-white/30 backdrop-blur-md rounded-lg shadow-xl p-6 flex flex-col items-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800 dark:text-gray-900">
          Gradio Quiz UI
        </h1>

        <div className="mb-4">
          <Image
            src="/images/smart-quiz-ui.png"
            alt="HF Space UI Screenshot"
            width={800}
            height={850}
            className="rounded shadow-lg"
          />
        </div>

        <Link
          href="https://huggingface.co/spaces/NZLouislu/smart-quiz-ui"
          target="_blank"
          className="mt-4 py-2 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700"
        >
          Open Gradio Quiz UI
        </Link>
      </div>
    </div>
  );
}
