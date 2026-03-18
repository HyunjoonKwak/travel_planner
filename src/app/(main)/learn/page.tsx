"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useActiveTrip } from "@/hooks/use-trip";
import { ALL_HIRAGANA } from "@/lib/data/hiragana";
import { ALL_KATAKANA } from "@/lib/data/katakana";
import { TRAVEL_PHRASES } from "@/lib/data/phrases";

const GENERAL_PHRASE_SECTIONS = [
  {
    emoji: "👋",
    title: "인사",
    phrases: [
      { text: "안녕하세요", romanization: "Hello" },
      { text: "감사합니다", romanization: "Thank you" },
      { text: "실례합니다", romanization: "Excuse me" },
      { text: "죄송합니다", romanization: "Sorry" },
    ],
  },
  {
    emoji: "🏨",
    title: "숙소",
    phrases: [
      { text: "체크인 부탁드립니다", romanization: "Check-in please" },
      { text: "방 열쇠를 주세요", romanization: "Room key please" },
      { text: "와이파이 비밀번호가 무엇인가요?", romanization: "What is the WiFi password?" },
    ],
  },
  {
    emoji: "🍽",
    title: "식당",
    phrases: [
      { text: "메뉴판을 주세요", romanization: "Menu please" },
      { text: "이것으로 주세요", romanization: "This one please" },
      { text: "계산서 주세요", romanization: "Bill please" },
      { text: "맛있어요!", romanization: "Delicious!" },
    ],
  },
  {
    emoji: "🚕",
    title: "교통",
    phrases: [
      { text: "이 주소로 가주세요", romanization: "Go to this address please" },
      { text: "얼마예요?", romanization: "How much?" },
      { text: "가장 가까운 지하철역이 어디예요?", romanization: "Where is the nearest subway?" },
    ],
  },
  {
    emoji: "🛒",
    title: "쇼핑",
    phrases: [
      { text: "이거 있어요?", romanization: "Do you have this?" },
      { text: "좀 더 싸게 해주세요", romanization: "A bit cheaper please" },
      { text: "카드 결제 되나요?", romanization: "Can I pay by card?" },
    ],
  },
];

interface LearningModule {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly progress: number;
  readonly completed: number;
  readonly total: number;
  readonly emoji: string;
  readonly color: string;
  readonly bg: string;
  readonly isQuiz?: boolean;
}

export default function LearnPage() {
  const { activeTrip } = useActiveTrip();
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

  const tripCountry = activeTrip?.country ?? null;
  const isJapanTrip = tripCountry === "JP";
  const hasTrip = tripCountry !== null;

  const hiraganaProgress = Math.round(
    (completedHiragana.length / ALL_HIRAGANA.length) * 100,
  );
  const katakanaProgress = Math.round(
    (completedKatakana.length / ALL_KATAKANA.length) * 100,
  );
  const phrasesProgress = Math.round(
    (savedPhrases.length / TRAVEL_PHRASES.length) * 100,
  );

  const japanModules: LearningModule[] = [
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
          <h1 className="text-2xl font-bold">
            {isJapanTrip || !hasTrip ? "일본어 학습" : "여행 회화"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isJapanTrip || !hasTrip
              ? "히라가나, 카타카나, 여행 회화"
              : "여행지에서 사용하는 기본 회화"}
          </p>
        </div>
        {(isJapanTrip || !hasTrip) && (
          <div className="flex flex-col items-center rounded-xl border bg-card p-3 shadow-sm">
            <span className="text-2xl">🔥</span>
            <span className="text-lg font-bold">{streak}</span>
            <span className="text-xs text-muted-foreground">연속 학습</span>
          </div>
        )}
      </div>

      {/* Japan content */}
      {(isJapanTrip || !hasTrip) && (
        <div className="grid gap-4">
          {japanModules.map((mod) => (
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
      )}

      {/* Non-Japan content */}
      {hasTrip && !isJapanTrip && (
        <>
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardContent className="pt-4 pb-3">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                현재 일본어 학습 콘텐츠가 제공됩니다. 다른 언어는 준비 중입니다.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {GENERAL_PHRASE_SECTIONS.map((section) => (
              <Card key={section.title}>
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="text-2xl">{section.emoji}</span>
                    <span>{section.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4 pt-0">
                  <ul className="space-y-2">
                    {section.phrases.map((phrase) => (
                      <li
                        key={phrase.text}
                        className="flex flex-col text-sm border-b last:border-0 pb-2 last:pb-0"
                      >
                        <span className="font-medium">{phrase.text}</span>
                        <span className="text-xs text-muted-foreground">
                          {phrase.romanization}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="pt-2">
            <Link href="/learn/hiragana">
              <Card className="cursor-pointer border transition-all hover:shadow-md bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="text-2xl text-rose-500">あ</span>
                    <span>일본어도 배워보기</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    히라가나, 카타카나 학습 시작하기
                  </p>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
