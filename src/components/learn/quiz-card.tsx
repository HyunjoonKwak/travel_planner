"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuizCardProps {
  question: string;
  correctAnswer: string;
  options: string[];
  onAnswer: (correct: boolean) => void;
}

type AnswerState = "idle" | "correct" | "incorrect";

export function QuizCard({
  question,
  correctAnswer,
  options,
  onAnswer,
}: QuizCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");

  const handleSelect = (option: string) => {
    if (answerState !== "idle") return;

    const isCorrect = option === correctAnswer;
    setSelected(option);
    setAnswerState(isCorrect ? "correct" : "incorrect");

    setTimeout(() => {
      setSelected(null);
      setAnswerState("idle");
      onAnswer(isCorrect);
    }, 900);
  };

  const getOptionStyle = (option: string): string => {
    if (answerState === "idle") {
      return "border-border bg-card hover:bg-accent hover:text-accent-foreground";
    }
    if (option === correctAnswer) {
      return "border-green-400 bg-green-50 text-green-800";
    }
    if (option === selected && answerState === "incorrect") {
      return "border-red-400 bg-red-50 text-red-800";
    }
    return "border-border bg-card text-muted-foreground";
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Question character */}
      <div className="flex h-36 w-36 items-center justify-center rounded-2xl border-2 border-primary/30 bg-primary/5">
        <span className="text-7xl font-bold">{question}</span>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        이 문자의 발음은?
      </p>

      {/* Answer options */}
      <div className="grid w-full max-w-xs grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            disabled={answerState !== "idle"}
            className={cn(
              "flex items-center justify-center rounded-xl border-2 p-4 text-lg font-semibold transition-all",
              getOptionStyle(option),
            )}
          >
            {option}
            {answerState !== "idle" && option === correctAnswer && (
              <Check className="ml-1 h-4 w-4 text-green-600" />
            )}
            {answerState === "incorrect" && option === selected && (
              <X className="ml-1 h-4 w-4 text-red-600" />
            )}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {answerState !== "idle" && (
        <p
          className={cn(
            "text-sm font-medium",
            answerState === "correct" ? "text-green-600" : "text-red-600",
          )}
        >
          {answerState === "correct" ? "정답!" : `정답: ${correctAnswer}`}
        </p>
      )}
    </div>
  );
}
