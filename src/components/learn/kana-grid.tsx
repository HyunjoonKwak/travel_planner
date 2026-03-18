"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSpeech } from "@/hooks/use-speech";
import type { KanaChar } from "@/types/learn";

interface KanaGridProps {
  kanaList: ReadonlyArray<KanaChar>;
  completedChars: string[];
  learningChars: string[];
}

function getCellStyle(
  char: string,
  completedChars: string[],
  learningChars: string[],
): string {
  if (completedChars.includes(char)) {
    return "bg-green-100 border-green-400 text-green-800 hover:bg-green-200";
  }
  if (learningChars.includes(char)) {
    return "bg-blue-100 border-blue-400 text-blue-800 hover:bg-blue-200";
  }
  return "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100";
}

export function KanaGrid({
  kanaList,
  completedChars,
  learningChars,
}: KanaGridProps) {
  const { speak } = useSpeech();
  const [selectedChar, setSelectedChar] = useState<KanaChar | null>(null);

  const handleCellClick = (kana: KanaChar) => {
    setSelectedChar(kana);
    speak(kana.char, "ja-JP");
  };

  return (
    <div className="space-y-4">
      {selectedChar && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-primary bg-primary/5 p-6">
          <span className="text-7xl font-bold">{selectedChar.char}</span>
          <span className="mt-2 text-2xl text-muted-foreground">
            {selectedChar.romaji}
          </span>
        </div>
      )}

      <div className="grid grid-cols-5 gap-2">
        {kanaList.map((kana) => (
          <button
            key={kana.char}
            onClick={() => handleCellClick(kana)}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-3 transition-all",
              getCellStyle(kana.char, completedChars, learningChars),
              selectedChar?.char === kana.char && "ring-2 ring-primary ring-offset-1",
            )}
          >
            <span className="text-2xl font-bold">{kana.char}</span>
            <span className="mt-1 text-xs">{kana.romaji}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
