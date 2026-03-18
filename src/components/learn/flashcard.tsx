"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SpeakButton } from "@/components/learn/speak-button";
import { cn } from "@/lib/utils";
import type { KanaChar } from "@/types/learn";

interface FlashcardProps {
  kanaList: ReadonlyArray<KanaChar>;
  onComplete: (char: string, known: boolean) => void;
}

export function Flashcard({ kanaList, onComplete }: FlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const current = kanaList[currentIndex];
  const total = kanaList.length;

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const goNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.min(prev + 1, total - 1));
  };

  const goPrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleAnswer = (known: boolean) => {
    onComplete(current.char, known);
    goNext();
  };

  if (!current) return null;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
        <Badge variant="secondary">
          {currentIndex + 1} / {total}
        </Badge>
        <SpeakButton text={current.char} />
      </div>

      {/* Card */}
      <div
        onClick={handleFlip}
        className={cn(
          "relative flex h-52 w-full max-w-sm cursor-pointer select-none items-center justify-center rounded-2xl border-2 border-primary/20 bg-card shadow-md transition-all duration-300",
          isFlipped && "border-primary/60 bg-primary/5",
        )}
      >
        {!isFlipped ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-8xl font-bold">{current.char}</span>
            <span className="text-xs text-muted-foreground">클릭하여 뒤집기</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-5xl font-bold text-primary">{current.romaji}</span>
            <span className="text-2xl text-muted-foreground">{current.char}</span>
          </div>
        )}
      </div>

      {/* Answer buttons */}
      <div className="flex w-full max-w-sm gap-3">
        <Button
          variant="outline"
          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
          onClick={() => handleAnswer(false)}
        >
          <X className="mr-1 h-4 w-4" />
          몰라요
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-green-200 text-green-600 hover:bg-green-50"
          onClick={() => handleAnswer(true)}
        >
          <Check className="mr-1 h-4 w-4" />
          알아요
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={goPrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleFlip}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={goNext}
          disabled={currentIndex === total - 1}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
