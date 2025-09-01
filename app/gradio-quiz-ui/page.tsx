"use client";
import Link from "next/link";
import Image from "next/image";
import BackgroundSun from "../../components/BackgroundSun";

export default function HFQuizPage() {
  return (
    <div className="flex-1 flex flex-col p-2">
      <div className="w-full max-w-[900px] mx-auto flex-1 min-h-0 flex justify-start">
        <div className="w-full md:w-[65%] md:max-w-[600px] flex flex-col px-4 md:px-0">
          <div className="bg-white/30 backdrop-blur-md p-6 rounded-lg shadow-xl flex-grow-0 relative">
           <BackgroundSun />
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-620 dark:text-gray-900 flex items-center justify-center gap-2">
              🔗 Gradio Quiz UI
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-700 mb-2">
              Interactive prototype on Hugging Face Space
            </p>
            <Link
              href="https://huggingface.co/spaces/NZLouislu/smart-quiz-ui"
              target="_blank"
              className="mt-4 py-2 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700 block mx-auto w-fit"
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
      </div>
    </div>
  );
}
