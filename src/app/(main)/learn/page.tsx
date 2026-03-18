"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ALL_HIRAGANA } from "@/lib/data/hiragana";
import { ALL_KATAKANA } from "@/lib/data/katakana";
import { TRAVEL_PHRASES } from "@/lib/data/phrases";

export default function LearnPage() {
  const [completedHiragana] = useLocalStorage<string[]>(
    "completed-hiragana",
    [],
  );
  const [completedKatakana] = useLocalStorage<string[]>(
    "completed-katakana",
    [],
  );
  const [savedPhrases] = useLocalStorage<string[]>("saved-phrases", []);
  const [streak] = useLocalStorage<number>("study-streak", 0);

  const hiraganaProgress = Math.round(
    (completedHiragana.length / ALL_HIRAGANA.length) * 100,
  );
  const katakanaProgress = Math.round(
    (completedKatakana.length / ALL_KATAKANA.length) * 100,
  );
  const phrasesProgress = Math.round(
    (savedPhrases.length / TRAVEL_PHRASES.length) * 100,
  );

  const modules = [
    {
      title: "히라가나",
      description: "기본 일본어 음절 문자",
      href: "/learn/hiragana",
      progress: hiraganaProgress,
      completed: completedHiragana.length,
      total: ALL_HIRAGANA.length,
      emoji: "あ",
      color: "text-rose-500",
      bg: "bg-rose-50 border-rose-200",
    },
    {
      title: "카타카나",
      description: "외래어 표기 문자",
      href: "/learn/katakana",
      progress: katakanaProgress,
      completed: completedKatakana.length,
      total: ALL_KATAKANA.length,
      emoji: "ア",
      color: "text-blue-500",
      bg: "bg-blue-50 border-blue-200",
    },
    {
      title: "여행 회화",
      description: "실용 여행 표현 모음",
      href: "/learn/phrases",
      progress: phrasesProgress,
      completed: savedPhrases.length,
      total: TRAVEL_PHRASES.length,
      emoji: "💬",
      color: "text-green-500",
      bg: "bg-green-50 border-green-200",
    },
    {
      title: "퀴즈",
      description: "배운 문자를 테스트",
      href: "/learn/quiz",
      progress: 0,
      completed: 0,
      total: 20,
      emoji: "📝",
      color: "text-purple-500",
      bg: "bg-purple-50 border-purple-200",
      isQuiz: true,
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">일본어 학습</h1>
          <p className="text-sm text-muted-foreground">
            히라가나, 카타카나, 여행 회화
          </p>
        </div>
        <div className="flex flex-col items-center rounded-xl border bg-card p-3 shadow-sm">
          <span className="text-2xl">🔥</span>
          <span className="text-lg font-bold">{streak}</span>
          <span className="text-xs text-muted-foreground">연속 학습</span>
        </div>
      </div>

      <div className="grid gap-4">
        {modules.map((mod) => (
          <Link key={mod.href} href={mod.href}>
            <Card
              className={`cursor-pointer border transition-all hover:shadow-md ${mod.bg}`}
            >
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl ${mod.color}`}>{mod.emoji}</span>
                    <span>{mod.title}</span>
                  </div>
                  {!mod.isQuiz && (
                    <Badge variant="secondary" className="text-xs">
                      {mod.completed}/{mod.total}
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{mod.description}</p>
              </CardHeader>
              {!mod.isQuiz && (
                <CardContent className="pb-4 pt-0">
                  <Progress value={mod.progress} className="h-2" />
                  <p className="mt-1 text-right text-xs text-muted-foreground">
                    {mod.progress}%
                  </p>
                </CardContent>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
