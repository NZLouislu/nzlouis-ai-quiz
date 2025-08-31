"use client";
import Link from "next/link";
import Image from "next/image";

export default function HFQuizPage() {
  return (
    <div className="flex-1 flex flex-col p-4">
      <div className="w-full max-w-[632px] mx-auto bg-white/30 backdrop-blur-md rounded-lg shadow-xl p-6 flex flex-col items-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-620 dark:text-gray-900 flex items-center justify-center gap-2">
          🔗 Gradio Quiz UI
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-700 mb-2">
          Interactive prototype on Hugging Face Space
        </p>
        <Link
          href="https://huggingface.co/spaces/NZLouislu/smart-quiz-ui"
          target="_blank"
          className="mt-4 py-2 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700"
        >
          Open Gradio Quiz UI
        </Link>

        <div className="mb-4 mt-4 px-4">
          <Image
            src="/images/smart-quiz-ui.png"
            alt="HF Space UI Screenshot"
            width={600}
            height={650}
            className="rounded shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
