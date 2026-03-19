"use client";

import { useState, useEffect } from "react";
import { CalendarPlus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { formatDateKo } from "@/lib/utils/date";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 10, 20, 30, 40, 50];

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function parseTime(time: string): { h: number; m: number } {
  const [hStr, mStr] = time.split(":");
  return { h: parseInt(hStr, 10), m: parseInt(mStr, 10) };
}

function TimePickerGrid({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (time: string) => void;
}) {
  const { h: selectedH, m: selectedM } = parseTime(value);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>

      {/* 시간 선택 */}
      <div>
        <p className="text-[10px] text-muted-foreground mb-1">시간</p>
        <div className="grid grid-cols-8 gap-1">
          {HOURS.map((h) => (
            <button
              key={h}
              type="button"
              className={cn(
                "h-8 rounded-md text-xs font-medium transition-colors",
                h === selectedH
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 hover:bg-muted text-foreground",
              )}
              onClick={() => onChange(`${pad(h)}:${pad(selectedM)}`)}
            >
              {pad(h)}
            </button>
          ))}
        </div>
      </div>

      {/* 분 선택 */}
      <div>
        <p className="text-[10px] text-muted-foreground mb-1">분</p>
        <div className="grid grid-cols-6 gap-1">
          {MINUTES.map((m) => (
            <button
              key={m}
              type="button"
              className={cn(
                "h-8 rounded-md text-xs font-medium transition-colors",
                m === selectedM
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 hover:bg-muted text-foreground",
              )}
              onClick={() => onChange(`${pad(selectedH)}:${pad(m)}`)}
            >
              :{pad(m)}
            </button>
          ))}
        </div>
      </div>

      {/* 현재 선택된 시간 표시 */}
      <div className="text-center">
        <span className="text-lg font-bold tabular-nums">{value}</span>
      </div>
    </div>
  );
}

interface ScheduleDatePickerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripDates: string[];
  itemTitle: string;
  itemTitleJa?: string;
  defaultStartTime: string;
  defaultEndTime: string;
  onConfirm: (date: string, startTime: string, endTime: string) => void;
}

export function ScheduleDatePickerDrawer({
  open,
  onOpenChange,
  tripDates,
  itemTitle,
  itemTitleJa,
  defaultStartTime,
  defaultEndTime,
  onConfirm,
}: ScheduleDatePickerDrawerProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Reset state when drawer opens with new defaults
  useEffect(() => {
    if (open) {
      setSelectedDate(null);
      setStartTime(defaultStartTime);
      setEndTime(defaultEndTime);
      setShowTimePicker(false);
    }
  }, [open, defaultStartTime, defaultEndTime]);

  function handleConfirm() {
    if (!selectedDate) return;
    onConfirm(selectedDate, startTime, endTime);
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setSelectedDate(null);
      setShowTimePicker(false);
    }
    onOpenChange(next);
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5" />
            일정에 추가
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-8 space-y-4 overflow-y-auto max-h-[80vh]">
          <div className="text-sm">
            <p className="font-medium">{itemTitle}</p>
            {itemTitleJa && itemTitleJa !== itemTitle && (
              <p className="text-xs text-muted-foreground">{itemTitleJa}</p>
            )}
          </div>

          {tripDates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg bg-muted/20">
              <p className="text-3xl mb-2">📅</p>
              <p className="text-sm text-muted-foreground">
                여행 날짜가 설정되지 않았습니다
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                설정에서 출발일/귀국일을 입력해주세요
              </p>
            </div>
          ) : (
            <>
              {/* 날짜 선택 */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">날짜</p>
                <div className="grid grid-cols-3 gap-2">
                  {tripDates.map((date) => (
                    <Button
                      key={date}
                      variant={selectedDate === date ? "default" : "outline"}
                      size="sm"
                      className="h-auto py-2 flex flex-col"
                      onClick={() => setSelectedDate(date)}
                    >
                      <span className="text-xs">{formatDateKo(date)}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* 시간 요약 + 토글 */}
              <button
                type="button"
                className="w-full flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors"
                onClick={() => setShowTimePicker(!showTimePicker)}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium tabular-nums">
                    {startTime} ~ {endTime}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {showTimePicker ? "접기" : "시간 변경"}
                </span>
              </button>

              {/* 시간 선택 (펼쳤을 때) */}
              {showTimePicker && (
                <div className="space-y-4 border rounded-lg p-3 bg-muted/10">
                  <TimePickerGrid
                    label="시작 시간"
                    value={startTime}
                    onChange={setStartTime}
                  />
                  <div className="border-t" />
                  <TimePickerGrid
                    label="종료 시간"
                    value={endTime}
                    onChange={setEndTime}
                  />
                </div>
              )}

              <Button
                className="w-full"
                disabled={!selectedDate}
                onClick={handleConfirm}
              >
                {selectedDate
                  ? `${formatDateKo(selectedDate)} ${startTime}~${endTime} 추가`
                  : "날짜를 선택하세요"}
              </Button>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
