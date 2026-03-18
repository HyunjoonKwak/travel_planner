"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDday } from "@/lib/utils/date";
import { useTripConfig } from "@/hooks/use-trip-config";
import { Plane } from "lucide-react";

export function CountdownCard() {
  const { config, getTripName } = useTripConfig();
  const startDate = config.startDate;
  const endDate = config.endDate;
  const dday = startDate ? getDday(startDate) : null;

  const label =
    dday === null
      ? null
      : dday > 0
        ? `D-${dday}`
        : dday === 0
          ? "D-Day!"
          : `D+${Math.abs(dday)}`;

  const startShort = startDate ? startDate.slice(5).replace("-", "/") : "";
  const endShort = endDate ? endDate.slice(5).replace("-", "/") : "";

  const outbound = config.outboundFlight;
  const hotel = config.hotel;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Plane className="h-5 w-5" />
          <span>{getTripName()} 카운트다운</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-3 py-2">
          {label ? (
            <div className="text-5xl font-bold text-primary">{label}</div>
          ) : (
            <div className="text-base font-medium text-muted-foreground">
              출발일을 설정해주세요
            </div>
          )}
          {startDate && endDate && (
            <div className="text-sm text-muted-foreground">
              여행 기간:{" "}
              <span className="font-medium text-primary">
                {startShort} ~ {endShort}
              </span>
            </div>
          )}
          {(outbound || hotel) && (
            <div className="w-full space-y-1 pt-1 border-t border-primary/20">
              {outbound && (
                <p className="text-xs text-center text-primary">
                  ✈ {outbound.flightNumber} {outbound.departureAirport}→
                  {outbound.arrivalAirport} {outbound.departureTime}
                </p>
              )}
              {hotel && (
                <p className="text-xs text-center text-primary">
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
