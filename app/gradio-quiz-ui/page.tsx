"use client";
import Link from "next/link";
import Image from "next/image";

export default function HFQuizPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Gradio Quiz UI</h1>

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
        className="text-blue-600 underline"
      >
        Open Gradio Quiz UI
      </Link>
    </div>
  );
}
