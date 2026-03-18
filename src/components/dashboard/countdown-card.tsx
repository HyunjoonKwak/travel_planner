"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDday } from "@/lib/utils/date";
import { useTripConfig } from "@/hooks/use-trip-config";
import { Plane } from "lucide-react";

export function CountdownCard() {
  const { config, getTripName } = useTripConfig();
  const startDate = config.startDate || "2026-04-01";
  const endDate = config.endDate || "2026-04-05";
  const dday = getDday(startDate);

  const label =
    dday > 0 ? `D-${dday}` : dday === 0 ? "D-Day!" : `D+${Math.abs(dday)}`;

  const startShort = startDate.slice(5).replace("-", "/");
  const endShort = endDate.slice(5).replace("-", "/");

  const outbound = config.outboundFlight;
  const hotel = config.hotel;

  return (
    <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 dark:border-pink-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-pink-700 dark:text-pink-300">
          <Plane className="h-5 w-5" />
          <span>{getTripName()} 카운트다운</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="text-5xl font-bold text-pink-600 dark:text-pink-400">
            {label}
          </div>
          {config.startDate && (
            <div className="text-sm text-muted-foreground">
              여행 기간:{" "}
              <span className="font-medium text-pink-600 dark:text-pink-400">
                {startShort} ~ {endShort}
              </span>
            </div>
          )}
          {!config.startDate && (
            <p className="text-sm text-muted-foreground">
              설정에서 여행 일정을 입력하세요
            </p>
          )}
          <p className="text-xs text-center text-muted-foreground">
            {startDate} ~ {endDate}
          </p>
          {(outbound || hotel) && (
            <div className="w-full space-y-1 pt-1 border-t border-pink-200 dark:border-pink-800">
              {outbound && (
                <p className="text-xs text-center text-pink-600 dark:text-pink-400">
                  ✈ {outbound.flightNumber} {outbound.departureAirport}→
                  {outbound.arrivalAirport} {outbound.departureTime}
                </p>
              )}
              {hotel && (
                <p className="text-xs text-center text-pink-600 dark:text-pink-400">
                  🏨 {hotel.name}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
