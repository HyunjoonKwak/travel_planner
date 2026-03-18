import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WEATHER_DATA = {
  location: "도쿄",
  temp: 18,
  condition: "맑음",
  icon: "☀️",
  humidity: 52,
} as const;

const EXCHANGE_DATA = {
  jpy: 100,
  krw: 890,
  trend: "up",
  updatedAt: "2026-03-18",
} as const;

export function WeatherExchangeCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">날씨 &amp; 환율</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Weather */}
          <div className="flex flex-col gap-1 p-3 rounded-lg bg-sky-50 dark:bg-sky-950/30">
            <p className="text-xs text-muted-foreground font-medium">
              {WEATHER_DATA.location} 날씨
            </p>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{WEATHER_DATA.icon}</span>
              <div>
                <p className="text-xl font-bold">{WEATHER_DATA.temp}°C</p>
                <p className="text-xs text-muted-foreground">
                  {WEATHER_DATA.condition}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              습도 {WEATHER_DATA.humidity}%
            </p>
          </div>

          {/* Exchange */}
          <div className="flex flex-col gap-1 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
            <p className="text-xs text-muted-foreground font-medium">
              오늘 환율
            </p>
            <div className="flex flex-col gap-0.5">
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                ¥{EXCHANGE_DATA.jpy}
              </p>
              <p className="text-sm font-medium">
                = ₩{EXCHANGE_DATA.krw.toLocaleString()}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              기준일 {EXCHANGE_DATA.updatedAt}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
