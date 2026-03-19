"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { formatDateKo } from "@/lib/utils/date";

interface ScheduleDatePickerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripDates: string[];
  itemTitle: string;
  itemTitleJa?: string;
  onConfirm: (date: string) => void;
}

export function ScheduleDatePickerDrawer({
  open,
  onOpenChange,
  tripDates,
  itemTitle,
  itemTitleJa,
  onConfirm,
}: ScheduleDatePickerDrawerProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  function handleConfirm() {
    if (!selectedDate) return;
    onConfirm(selectedDate);
    setSelectedDate(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) setSelectedDate(null);
    onOpenChange(next);
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5" />
            날짜 선택
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-8 space-y-4">
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

              <Button
                className="w-full"
                disabled={!selectedDate}
                onClick={handleConfirm}
              >
                확인
              </Button>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
