"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { QuizCard } from "@/components/learn/quiz-card";
import { ALL_HIRAGANA } from "@/lib/data/hiragana";
import { ALL_KATAKANA } from "@/lib/data/katakana";
import type { QuizQuestion } from "@/types/learn";

const QUIZ_COUNT = 20;
const OPTIONS_COUNT = 4;
const ALL_KANA = [...ALL_HIRAGANA, ...ALL_KATAKANA];

function shuffle<T>(arr: ReadonlyArray<T>): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

function generateQuestions(): QuizQuestion[] {
  const shuffled = shuffle(ALL_KANA);
  const selected = shuffled.slice(0, QUIZ_COUNT);
  const allRomaji = Array.from(new Set(ALL_KANA.map((k) => k.romaji)));

  return selected.map((kana) => {
    const distractors = shuffle(
      allRomaji.filter((r) => r !== kana.romaji),
    ).slice(0, OPTIONS_COUNT - 1);

    const options = shuffle([kana.romaji, ...distractors]);

    return {
      question: kana.char,
      correctAnswer: kana.romaji,
      options,
    };
  });
}

type GameState = "playing" | "finished";

export default function QuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    generateQuestions(),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameState, setGameState] = useState<GameState>("playing");

  const progress = useMemo(
    () => Math.round((currentIndex / questions.length) * 100),
    [currentIndex, questions.length],
  );

  const handleAnswer = (correct: boolean) => {
    const nextCorrect = correct ? correctCount + 1 : correctCount;
    const nextIndex = currentIndex + 1;

    if (nextIndex >= questions.length) {
      setCorrectCount(nextCorrect);
      setGameState("finished");
    } else {
      setCorrectCount(nextCorrect);
      setCurrentIndex(nextIndex);
    }
  };

  const handleRestart = () => {
    setQuestions(generateQuestions());
    setCurrentIndex(0);
    setCorrectCount(0);
    setGameState("playing");
  };

  const currentQuestion = questions[currentIndex];
  const accuracy =
    gameState === "finished"
      ? Math.round((correctCount / questions.length) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-md space-y-6 p-4">
      <div className="flex items-center justify-between">
        <Link href="/learn">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">퀴즈</h1>
        <Badge variant="secondary">
          {correctCount}/{currentIndex}
        </Badge>
      </div>

      {gameState === "playing" && currentQuestion && (
        <>
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {currentIndex + 1} / {questions.length}
              </span>
              <span>정답률 {currentIndex > 0 ? Math.round((correctCount / currentIndex) * 100) : 0}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <QuizCard
            key={currentIndex}
            question={currentQuestion.question}
            correctAnswer={currentQuestion.correctAnswer}
            options={[...currentQuestion.options]}
            onAnswer={handleAnswer}
          />
        </>
      )}

      {gameState === "finished" && (
        <div className="flex flex-col items-center gap-6 py-8 text-center">
          <div className="text-6xl">
            {accuracy >= 80 ? "🎉" : accuracy >= 60 ? "👍" : "💪"}
          </div>
          <div>
            <p className="text-2xl font-bold">퀴즈 완료!</p>
            <p className="text-muted-foreground">
              {questions.length}문제 중 {correctCount}개 정답
            </p>
          </div>

          <div className="w-full space-y-2 rounded-xl border bg-card p-4">
            <div className="flex justify-between text-sm">
              <span>정확도</span>
              <span className="font-bold">{accuracy}%</span>
            </div>
            <Progress value={accuracy} className="h-3" />
          </div>

          <div className="flex gap-3">
            <Link href="/learn">
              <Button variant="outline">
                <ArrowLeft className="mr-1 h-4 w-4" />
                학습으로
              </Button>
            </Link>
            <Button onClick={handleRestart}>
              <RotateCcw className="mr-1 h-4 w-4" />
              다시 풀기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
