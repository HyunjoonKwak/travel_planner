"use client";

import { CountdownCard } from "@/components/dashboard/countdown-card";
import { SakuraStatusCard } from "@/components/dashboard/sakura-status-card";
import { WeatherExchangeCard } from "@/components/dashboard/weather-exchange-card";
import { TodaySchedule } from "@/components/dashboard/today-schedule";
import { ExpenseSummary } from "@/components/dashboard/expense-summary";
import { LearnProgress } from "@/components/dashboard/learn-progress";
import { QuickMemo } from "@/components/dashboard/quick-memo";
import { useActiveTrip } from "@/hooks/use-trip";
import { useTripConfig } from "@/hooks/use-trip-config";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function DashboardPage() {
  const { activeTrip, loading } = useActiveTrip();
  const { getTripName } = useTripConfig();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!activeTrip) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">대시보드</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
          <span className="text-4xl">🗺️</span>
          <p className="text-sm">활성화된 여행이 없어요.</p>
          <Link href="/settings" className={buttonVariants({ variant: "outline", size: "sm" })}>
            여행 설정하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {getTripName()} 준비 현황을 한눈에 확인하세요
        </p>
      </div>

      <div className="space-y-4">
        <CountdownCard />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SakuraStatusCard />
          <WeatherExchangeCard />
        </div>

        <TodaySchedule startDate={activeTrip.startDate ?? undefined} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ExpenseSummary />
          <LearnProgress />
        </div>

        <QuickMemo />
      </div>
    </div>
  );
}
