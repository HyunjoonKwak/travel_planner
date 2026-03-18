"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTripConfig } from "@/hooks/use-trip-config";

interface SeasonHighlight {
  readonly icon: string;
  readonly title: string;
  readonly items: ReadonlyArray<string>;
  readonly color: string;
  readonly borderColor: string;
  readonly titleColor: string;
  readonly gradient: string;
  readonly decorEmojis: ReadonlyArray<string>;
}

function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

function getSeasonHighlights(
  country: string,
  destinations: ReadonlyArray<string>,
  theme: string,
  month: number,
): SeasonHighlight | null {
  if (country === "JP") {
    if (month >= 3 && month <= 4) {
      return {
        icon: "🌸", title: "벚꽃 시즌",
        items: ["만개 예상: 3월 말~4월 초", "인기 명소는 일찍 방문 추천", "야간 라이트업 장소 확인", "돗자리 + 도시락 준비"],
        color: "bg-pink-50 dark:bg-pink-950/30", borderColor: "border-pink-200 dark:border-pink-800", titleColor: "text-pink-700 dark:text-pink-300",
        gradient: "bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 dark:from-pink-950/40 dark:via-rose-950/30 dark:to-fuchsia-950/20",
        decorEmojis: ["🌸", "🌺", "🌷", "💮", "🌸"],
      };
    }
    if (month >= 6 && month <= 8) {
      return {
        icon: "🎆", title: "여름 축제 시즌",
        items: ["하나비(불꽃놀이) 대회 일정 확인", "유카타 체험 추천", "자외선 차단 + 수분 보충 필수", "빙수·카키고오리 맛집 탐방"],
        color: "bg-blue-50 dark:bg-blue-950/30", borderColor: "border-blue-200 dark:border-blue-800", titleColor: "text-blue-700 dark:text-blue-300",
        gradient: "bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-sky-950/20",
        decorEmojis: ["🎆", "🎇", "🏮", "🎐", "✨"],
      };
    }
    if (month >= 10 && month <= 11) {
      return {
        icon: "🍁", title: "단풍 시즌",
        items: ["교토 단풍 명소 예약 필수", "야간 라이트업 확인", "단풍+온천 코스 추천", "가벼운 겉옷 준비"],
        color: "bg-orange-50 dark:bg-orange-950/30", borderColor: "border-orange-200 dark:border-orange-800", titleColor: "text-orange-700 dark:text-orange-300",
        gradient: "bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/40 dark:via-amber-950/30 dark:to-yellow-950/20",
        decorEmojis: ["🍁", "🍂", "🍃", "🌾", "🍁"],
      };
    }
    if (month === 12 || month <= 2) {
      return {
        icon: "♨️", title: "온천 시즌",
        items: ["노천탕 눈 구경 추천", "료칸 예약은 일찍", "스키 리조트 오픈 확인", "방한용품 필수"],
        color: "bg-cyan-50 dark:bg-cyan-950/30", borderColor: "border-cyan-200 dark:border-cyan-800", titleColor: "text-cyan-700 dark:text-cyan-300",
        gradient: "bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 dark:from-cyan-950/40 dark:via-sky-950/30 dark:to-blue-950/20",
        decorEmojis: ["❄️", "♨️", "🏔", "⛷", "🌨"],
      };
    }
    return {
      icon: "🏯", title: "일본 여행 팁",
      items: ["IC 카드(Suica/ICOCA) 준비", "현금 준비 (소규모 가게)", "신발 벗는 장소 많음 (깔끔한 양말)", "쓰레기통이 없으니 비닐봉지 필수"],
      color: "bg-rose-50 dark:bg-rose-950/30", borderColor: "border-rose-200 dark:border-rose-800", titleColor: "text-rose-700 dark:text-rose-300",
      gradient: "bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 dark:from-rose-950/40 dark:via-pink-950/30 dark:to-red-950/20",
      decorEmojis: ["🏯", "⛩", "🎎", "🗾", "🗻"],
    };
  }

  if (country === "TH") {
    const isChiangmai = destinations.includes("chiangmai");
    const isGolf = theme === "골프여행";

    if (isGolf) {
      return {
        icon: "⛳", title: isChiangmai ? "치앙마이 골프" : "태국 골프",
        items: [isChiangmai ? "치앙마이 인기 코스: 알파인 GC, 로얄 치앙마이 GC" : "방콕 인근 인기 코스 다수", "그린피 ₩3~8만원대 (캐디 포함)", "캐디팁 300~500바트 준비", month >= 3 && month <= 5 ? "건기 시즌 (골프 최적)" : "우기 대비 우산 필수", "새벽 티오프 추천 (오후 스콜)"],
        color: "bg-green-50 dark:bg-green-950/30", borderColor: "border-green-200 dark:border-green-800", titleColor: "text-green-700 dark:text-green-300",
        gradient: "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/40 dark:via-emerald-950/30 dark:to-teal-950/20",
        decorEmojis: ["⛳", "🏌️", "🌴", "☀️", "🏖"],
      };
    }
    if (isChiangmai) {
      return {
        icon: "🐘", title: "치앙마이 하이라이트",
        items: ["올드시티 사원 투어 (왓 프라싱, 왓 체디루앙)", "일요 나이트마켓 (선데이 워킹스트리트)", "코끼리 보호소 체험", "카오소이 (치앙마이 대표 국수)", month >= 11 && month <= 2 ? "건기 시즌 (여행 최적)" : "우기 대비 우의 준비"],
        color: "bg-amber-50 dark:bg-amber-950/30", borderColor: "border-amber-200 dark:border-amber-800", titleColor: "text-amber-700 dark:text-amber-300",
        gradient: "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/20",
        decorEmojis: ["🐘", "🛕", "🌺", "🪷", "🏮"],
      };
    }
    return {
      icon: "🇹🇭", title: "태국 여행 팁",
      items: ["왕궁·사원 방문 시 긴 바지 필수", "길거리 음식은 현지인이 많은 곳", "택시 미터기 확인 (흥정 주의)", "자외선 차단 필수"],
      color: "bg-amber-50 dark:bg-amber-950/30", borderColor: "border-amber-200 dark:border-amber-800", titleColor: "text-amber-700 dark:text-amber-300",
      gradient: "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-orange-950/20",
      decorEmojis: ["🇹🇭", "🛕", "🌴", "🥥", "☀️"],
    };
  }

  if (country === "TW") {
    return {
      icon: "🧋", title: "대만 여행 팁",
      items: ["야시장은 저녁 6시 이후 활발", "YouBike 자전거 대여 편리", "MRT + 이지카드로 이동", "샤오롱바오·버블티 필수 체험"],
      color: "bg-red-50 dark:bg-red-950/30", borderColor: "border-red-200 dark:border-red-800", titleColor: "text-red-700 dark:text-red-300",
      gradient: "bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-red-950/40 dark:via-rose-950/30 dark:to-pink-950/20",
      decorEmojis: ["🧋", "🏮", "🥟", "🎋", "🌃"],
    };
  }

  if (country === "VN") {
    return {
      icon: "🏍", title: "베트남 여행 팁",
      items: ["길 건널 때 멈추지 말고 일정 속도로", "쌀국수·반미는 아침 일찍 먹는 로컬 식당", "Grab 택시 앱 필수 설치", "흥정 문화 (시장 40~60% 제시)"],
      color: "bg-yellow-50 dark:bg-yellow-950/30", borderColor: "border-yellow-200 dark:border-yellow-800", titleColor: "text-yellow-700 dark:text-yellow-300",
      gradient: "bg-gradient-to-br from-yellow-50 via-lime-50 to-green-50 dark:from-yellow-950/40 dark:via-lime-950/30 dark:to-green-950/20",
      decorEmojis: ["🏍", "🍜", "🌾", "🎋", "🏖"],
    };
  }

  return null;
}

export function SeasonTipsCard() {
  const { config } = useTripConfig();

  if (!config.country) return null;

  const month = getCurrentMonth();
  const highlight = getSeasonHighlights(
    config.country,
    config.destinations,
    config.theme,
    month,
  );

  if (!highlight) return null;

  return (
    <Card className={`${highlight.borderColor} overflow-hidden relative`}>
      {/* Decorative emoji background */}
      <div className="absolute top-0 right-0 flex gap-1 opacity-15 text-3xl pointer-events-none select-none p-2">
        {highlight.decorEmojis.map((emoji, i) => (
          <span
            key={i}
            className="inline-block"
            style={{
              transform: `rotate(${(i - 2) * 15}deg) translateY(${Math.sin(i) * 8}px)`,
              fontSize: i === 2 ? "2.5rem" : "1.5rem",
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      <div className={`${highlight.gradient} rounded-lg`}>
        <CardHeader className="pb-2">
          <CardTitle className={`flex items-center gap-2 ${highlight.titleColor}`}>
            <span className="text-2xl drop-shadow-sm">{highlight.icon}</span>
            <span>{highlight.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {highlight.items.map((item, i) => (
              <li key={item} className="flex items-start gap-2.5 text-sm">
                <span
                  className={`shrink-0 mt-0.5 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${highlight.color} ${highlight.titleColor}`}
                >
                  {i + 1}
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </div>
    </Card>
  );
}

/** @deprecated Use SeasonTipsCard */
export const SakuraStatusCard = SeasonTipsCard;
