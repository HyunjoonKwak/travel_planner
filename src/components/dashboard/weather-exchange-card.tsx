"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTripConfig } from "@/hooks/use-trip-config";

interface WeatherData {
  readonly temp: number;
  readonly condition: string;
  readonly icon: string;
  readonly humidity: number;
  readonly city: string;
}

interface ExchangeData {
  readonly rate: number;
  readonly updatedAt: string;
}

const CITY_COORDS: Record<string, { lat: number; lng: number; name: string }> = {
  osaka: { lat: 34.69, lng: 135.50, name: "오사카" },
  kyoto: { lat: 35.01, lng: 135.77, name: "교토" },
  tokyo: { lat: 35.68, lng: 139.69, name: "도쿄" },
  fukuoka: { lat: 33.59, lng: 130.40, name: "후쿠오카" },
  nara: { lat: 34.68, lng: 135.80, name: "나라" },
  kobe: { lat: 34.69, lng: 135.20, name: "고베" },
  hiroshima: { lat: 34.40, lng: 132.46, name: "히로시마" },
  sapporo: { lat: 43.06, lng: 141.35, name: "삿포로" },
  okinawa: { lat: 26.33, lng: 127.80, name: "오키나와" },
  nagoya: { lat: 35.18, lng: 136.91, name: "나고야" },
};

const WMO_CODES: Record<number, { condition: string; icon: string }> = {
  0: { condition: "맑음", icon: "☀️" },
  1: { condition: "대체로 맑음", icon: "🌤" },
  2: { condition: "구름 조금", icon: "⛅" },
  3: { condition: "흐림", icon: "☁️" },
  45: { condition: "안개", icon: "🌫" },
  48: { condition: "안개", icon: "🌫" },
  51: { condition: "이슬비", icon: "🌦" },
  53: { condition: "이슬비", icon: "🌦" },
  55: { condition: "이슬비", icon: "🌦" },
  61: { condition: "비", icon: "🌧" },
  63: { condition: "비", icon: "🌧" },
  65: { condition: "폭우", icon: "🌧" },
  71: { condition: "눈", icon: "🌨" },
  73: { condition: "눈", icon: "🌨" },
  75: { condition: "폭설", icon: "🌨" },
  80: { condition: "소나기", icon: "🌦" },
  81: { condition: "소나기", icon: "🌦" },
  82: { condition: "폭우", icon: "⛈" },
  95: { condition: "뇌우", icon: "⛈" },
};

async function fetchWeather(
  lat: number,
  lng: number,
  cityName: string,
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`;
  const res = await globalThis.fetch(url);
  const data = await res.json();
  const current = data.current;
  const code = current?.weather_code ?? 0;
  const wmo = WMO_CODES[code] ?? { condition: "알 수 없음", icon: "🌡" };

  return {
    temp: Math.round(current?.temperature_2m ?? 0),
    condition: wmo.condition,
    icon: wmo.icon,
    humidity: Math.round(current?.relative_humidity_2m ?? 0),
    city: cityName,
  };
}

async function fetchExchangeRate(): Promise<ExchangeData> {
  const url = "https://open.er-api.com/v6/latest/JPY";
  const res = await globalThis.fetch(url);
  const data = await res.json();
  const krwRate = data.rates?.KRW ?? 9.4;
  return {
    rate: Math.round(krwRate * 100) / 100,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}

export function WeatherExchangeCard() {
  const { config } = useTripConfig();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [exchange, setExchange] = useState<ExchangeData | null>(null);
  const [loading, setLoading] = useState(true);

  const firstCity =
    (config.destinations ?? [])[0] ?? "osaka";
  const coords = CITY_COORDS[firstCity] ?? CITY_COORDS.osaka;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchWeather(coords.lat, coords.lng, coords.name).catch(() => null),
      fetchExchangeRate().catch(() => null),
    ]).then(([w, e]) => {
      setWeather(w);
      setExchange(e);
      setLoading(false);
    });
  }, [coords.lat, coords.lng, coords.name]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">날씨 &amp; 환율</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const krwPer100 = exchange ? Math.round(exchange.rate * 100) : 890;

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
              {weather?.city ?? coords.name} 날씨
            </p>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{weather?.icon ?? "🌡"}</span>
              <div>
                <p className="text-xl font-bold">{weather?.temp ?? 0}°C</p>
                <p className="text-xs text-muted-foreground">
                  {weather?.condition ?? "불러오는 중"}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              습도 {weather?.humidity ?? 0}%
            </p>
          </div>

          {/* Exchange */}
          <div className="flex flex-col gap-1 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
            <p className="text-xs text-muted-foreground font-medium">
              실시간 환율
            </p>
            <div className="flex flex-col gap-0.5">
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                ¥100
              </p>
              <p className="text-sm font-medium">
                = ₩{krwPer100.toLocaleString()}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {exchange?.updatedAt ?? "-"} 기준
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
