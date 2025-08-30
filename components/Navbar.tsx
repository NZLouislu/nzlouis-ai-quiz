"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const items = [
    { label: "🛠 Custom AI Quiz", href: "/" },
    { label: "✨ Gemini AI Quiz", href: "/gemini-ai-quiz" },
    { label: "📚 Trivia API Quiz", href: "/trivia-api-quiz" },
    { label: "🔗 Gradio Quiz UI", href: "/gradio-quiz-ui" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-white/30 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/nzlouis-logo.png"
            alt="Nzlouis logo — Lu Louis"
            width={100}
            height={30}
            priority
            className="w-[100px] h-[30px] object-contain"
          />
        </Link>

        <div className="hidden md:flex gap-6">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="text-sm font-medium hover:text-blue-600 transition-colors"
              prefetch
            >
              {i.label}
            </Link>
          ))}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-gray-700 hover:text-blue-600 focus:outline-none"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white/30 backdrop-blur-md shadow-md">
          <div className="flex flex-col gap-4 p-4">
            {items.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className="block text-sm font-medium hover:text-blue-600"
                onClick={() => setOpen(false)}
                prefetch
              >
                {i.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
