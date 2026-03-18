"use client";

import { useState } from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { useTripConfig } from "@/hooks/use-trip-config";
import { getCityById } from "@/lib/data/destinations";
import type { ScheduleItem } from "@/types/schedule";

interface AIScheduleDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (items: ScheduleItem[]) => void;
}

export function AIScheduleDrawer({
  open,
  onOpenChange,
  onApply,
}: AIScheduleDrawerProps) {
  const { config, getTripName } = useTripConfig();
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ScheduleItem[]>([]);

  const destinations =
    config.destinations
      ?.map((id) => getCityById(id)?.name)
      .filter(Boolean) ?? [];

  const canGenerate =
    destinations.length > 0 && config.startDate && config.endDate;

  async function handleGenerate() {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    setPreview([]);

    try {
      const res = await fetch("/api/ai/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinations,
          startDate: config.startDate,
          endDate: config.endDate,
          theme: config.theme,
          preferences: preferences.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "일정 생성에 실패했습니다");
        return;
      }

      setPreview(data.items ?? []);
    } catch {
      setError("네트워크 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }

  function handleApply() {
    onApply(preview);
    setPreview([]);
    setPreferences("");
    onOpenChange(false);
  }

  function handleClose() {
    setPreview([]);
    setError(null);
    onOpenChange(false);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI 일정 생성
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-8 overflow-y-auto max-h-[70vh] space-y-4">
          {/* Trip info summary */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
            <p className="text-xs text-muted-foreground">여행 정보</p>
            <p className="text-sm font-medium">{getTripName()}</p>
            <div className="flex flex-wrap gap-1">
              {destinations.map((city) => (
                <Badge key={city} variant="secondary" className="text-xs">
                  {city}
                </Badge>
              ))}
            </div>
            {config.startDate && config.endDate && (
              <p className="text-xs text-muted-foreground">
                {config.startDate} ~ {config.endDate}
              </p>
            )}
          </div>

          {!canGenerate && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              설정에서 여행지와 날짜를 먼저 입력해주세요
            </div>
          )}

          {/* Preferences */}
          <div className="space-y-1.5">
            <Label htmlFor="ai-prefs">추가 요청사항 (선택)</Label>
            <Textarea
              id="ai-prefs"
              placeholder="예: 맛집 위주로 짜줘, 아이와 함께라 천천히, 쇼핑 시간 많이"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              rows={3}
              className="text-sm"
            />
          </div>

          {/* Generate button */}
          <Button
            className="w-full gap-2"
            onClick={handleGenerate}
            disabled={loading || !canGenerate}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                AI가 일정을 생성하고 있어요...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                일정 생성하기
              </>
            )}
          </Button>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  생성된 일정 ({preview.length}개)
                </p>
                <Badge variant="outline" className="text-xs">미리보기</Badge>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {preview.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border p-2.5 text-sm space-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.date?.slice(5)}
                      </span>
                    </div>
                    {item.titleJa && (
                      <p className="text-xs text-muted-foreground">
                        {item.titleJa}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {item.startTime}~{item.endTime}
                      </span>
                      {item.location && <span>📍 {item.location}</span>}
                    </div>
                    {item.memo && (
                      <p className="text-xs text-primary/80 mt-1">
                        💡 {item.memo}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                >
                  취소
                </Button>
                <Button className="flex-1" onClick={handleApply}>
                  이 일정 적용하기
                </Button>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
