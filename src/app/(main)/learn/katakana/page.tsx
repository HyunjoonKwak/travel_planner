"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanaGrid } from "@/components/learn/kana-grid";
import { Flashcard } from "@/components/learn/flashcard";
import { useActiveTrip } from "@/hooks/use-trip";
import { useTripLearnProgress } from "@/hooks/use-trip-data";
import {
  ALL_KATAKANA,
  KATAKANA_BASIC,
  KATAKANA_DAKUTEN,
  KATAKANA_HANDAKUTEN,
} from "@/lib/data/katakana";

export default function KatakanaPage() {
  const { activeTrip } = useActiveTrip();
  const tripId = activeTrip?.id ?? "";
  const { data: progress, loading, debouncedSave } = useTripLearnProgress(tripId);
  const [mode, setMode] = useState<"grid" | "flashcard">("grid");

  const completedChars = progress.completedKatakana;
  const learningChars = progress.learningKatakana;

  const progressPercent = Math.round(
    (completedChars.length / ALL_KATAKANA.length) * 100,
  );

  const handleComplete = (char: string, known: boolean) => {
    if (known) {
      const newCompleted = completedChars.includes(char)
        ? completedChars
        : [...completedChars, char];
      const newLearning = learningChars.filter((c) => c !== char);
      debouncedSave({
        ...progress,
        completedKatakana: newCompleted,
        learningKatakana: newLearning,
      });
    } else {
      const newLearning = learningChars.includes(char)
        ? learningChars
        : [...learningChars, char];
      debouncedSave({
        ...progress,
        learningKatakana: newLearning,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (mode === "flashcard") {
    return (
      <div className="mx-auto max-w-md space-y-6 p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMode("grid")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">카타카나 플래시카드</h1>
        </div>
        <Flashcard kanaList={ALL_KATAKANA} onComplete={handleComplete} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <div className="flex items-center gap-3">
        <Link href="/learn">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">카타카나</h1>
          <p className="text-sm text-muted-foreground">
            외래어 표기 음절 문자
          </p>
        </div>
        <Badge variant="secondary">
          {completedChars.length}/{ALL_KATAKANA.length}
        </Badge>
      </div>

      <div className="space-y-1">
        <Progress value={progressPercent} className="h-2" />
        <p className="text-right text-xs text-muted-foreground">
          {progressPercent}% 완료
        </p>
      </div>

      <Button
        className="w-full"
        onClick={() => setMode("flashcard")}
      >
        플래시카드로 학습하기
      </Button>

      <Tabs defaultValue="basic">
        <TabsList className="w-full">
          <TabsTrigger value="basic" className="flex-1">
            기본 ({KATAKANA_BASIC.length})
          </TabsTrigger>
          <TabsTrigger value="dakuten" className="flex-1">
            탁음 ({KATAKANA_DAKUTEN.length})
          </TabsTrigger>
          <TabsTrigger value="handakuten" className="flex-1">
            반탁음 ({KATAKANA_HANDAKUTEN.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="basic" className="mt-4">
          <KanaGrid
            kanaList={KATAKANA_BASIC}
            completedChars={completedChars}
            learningChars={learningChars}
          />
        </TabsContent>
        <TabsContent value="dakuten" className="mt-4">
          <KanaGrid
            kanaList={KATAKANA_DAKUTEN}
            completedChars={completedChars}
            learningChars={learningChars}
          />
        </TabsContent>
        <TabsContent value="handakuten" className="mt-4">
          <KanaGrid
            kanaList={KATAKANA_HANDAKUTEN}
            completedChars={completedChars}
            learningChars={learningChars}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
