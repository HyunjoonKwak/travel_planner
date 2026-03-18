"use client";

import { CountdownCard } from "@/components/dashboard/countdown-card";
import { SakuraStatusCard } from "@/components/dashboard/sakura-status-card";
import { WeatherExchangeCard } from "@/components/dashboard/weather-exchange-card";
import { TodaySchedule } from "@/components/dashboard/today-schedule";
import { ExpenseSummary } from "@/components/dashboard/expense-summary";
import { LearnProgress } from "@/components/dashboard/learn-progress";
import { QuickMemo } from "@/components/dashboard/quick-memo";
import { useTripConfig } from "@/hooks/use-trip-config";

export default function DashboardPage() {
  const { getTripName } = useTripConfig();

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

        <TodaySchedule />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ExpenseSummary />
          <LearnProgress />
        </div>

        <QuickMemo />
      </div>
    </div>
  );
}
