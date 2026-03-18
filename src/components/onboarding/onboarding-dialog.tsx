"use client";

import { useState } from "react";
import {
  Plane,
  CalendarDays,
  UtensilsCrossed,
  BookOpen,
  GraduationCap,
  Wallet,
  CheckSquare,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useTripConfig } from "@/hooks/use-trip-config";
import { cn } from "@/lib/utils";

const GUIDE_FEATURES = [
  {
    icon: CalendarDays,
    title: "일정 관리",
    desc: "일정 탭에서 날짜별 여행 일정을 추가/편집할 수 있어요.",
    where: "일정 페이지 > + 버튼",
  },
  {
    icon: UtensilsCrossed,
    title: "맛집 가이드",
    desc: "맛집 탭에서 카테고리별 맛집을 검색하고, 방문 후 리뷰를 남겨보세요.",
    where: "맛집 페이지 > 카드 클릭",
  },
  {
    icon: BookOpen,
    title: "여행 일기",
    desc: "일기 탭에서 매일의 여행 경험을 사진과 함께 기록하세요.",
    where: "일기 페이지 > + 버튼",
  },
  {
    icon: GraduationCap,
    title: "일본어 학습",
    desc: "히라가나/가타카나 학습, 여행 회화 연습, 퀴즈로 준비하세요.",
    where: "학습 페이지 > 카테고리 선택",
  },
  {
    icon: Wallet,
    title: "가계부",
    desc: "여행 중 지출을 기록하고 예산 대비 사용 현황을 확인하세요.",
    where: "더보기 > 가계부 > + 버튼",
  },
  {
    icon: CheckSquare,
    title: "준비물 체크",
    desc: "여행 전 준비물을 체크리스트로 관리하세요. 항목 추가도 가능해요.",
    where: "더보기 > 준비물",
  },
] as const;

type Step = "welcome" | "trip-setup" | "guide" | "done";

export function OnboardingDialog() {
  const { config, updateConfig } = useTripConfig();
  const [step, setStep] = useState<Step>("welcome");
  const [destination, setDestination] = useState("");
  const [tripTheme, setTripTheme] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  if (config.onboarded) {
    return null;
  }

  function handleSetup() {
    updateConfig({
      // Onboarding keeps a free-text destination; stored as theme until
      // the user visits settings and selects cities properly.
      theme: destination ? `${destination}${tripTheme ? ` ${tripTheme}` : ""}` : tripTheme,
      startDate,
      endDate,
    });
    setStep("guide");
  }

  function handleComplete() {
    updateConfig({ onboarded: true });
  }

  function handleSkip() {
    updateConfig({ onboarded: true });
  }

  const tripName =
    destination && tripTheme
      ? `${destination} ${tripTheme}`
      : destination
        ? `${destination} 여행`
        : tripTheme
          ? `${tripTheme} 여행`
          : "여행 플래너";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          {step === "welcome" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Plane className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold">여행 플래너에 오신 걸 환영합니다!</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  여행 일정, 맛집, 일기, 가계부, 일본어 학습까지
                  한 곳에서 관리하세요.
                </p>
              </div>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => setStep("trip-setup")}>
                  여행 설정하기
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={handleSkip}
                >
                  나중에 할게요
                </Button>
              </div>
            </div>
          )}

          {step === "trip-setup" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold">어디로 떠나시나요?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  여행 정보를 입력하면 앱 이름이 자동으로 바뀌어요.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ob-dest">여행지</Label>
                  <Input
                    id="ob-dest"
                    placeholder="예: 오사카, 도쿄, 교토, 후쿠오카"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ob-theme">여행 테마</Label>
                  <Input
                    id="ob-theme"
                    placeholder="예: 벚꽃여행, 미식투어, 온천여행"
                    value={tripTheme}
                    onChange={(e) => setTripTheme(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="ob-start">출발일</Label>
                    <Input
                      id="ob-start"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ob-end">귀국일</Label>
                    <Input
                      id="ob-end"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {(destination || tripTheme) && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">앱 이름 미리보기</p>
                    <p className="font-semibold text-primary">{tripName}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Button className="w-full" onClick={handleSetup}>
                  다음: 기능 가이드
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => {
                    handleSetup();
                    handleComplete();
                  }}
                >
                  건너뛰기
                </Button>
              </div>
            </div>
          )}

          {step === "guide" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold">이렇게 사용하세요</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  각 기능별 데이터 입력 방법을 안내합니다.
                </p>
              </div>

              <div className="space-y-3">
                {GUIDE_FEATURES.map((feature) => (
                  <div
                    key={feature.title}
                    className="flex gap-3 rounded-lg border p-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                      <feature.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{feature.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {feature.desc}
                      </p>
                      <p className="text-xs text-primary/80 mt-1 font-medium">
                        {feature.where}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full" onClick={handleComplete}>
                시작하기!
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
