"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TRIP_THEMES } from "@/lib/data/trip-themes";
import { cn } from "@/lib/utils";

interface ThemeSelectorProps {
  readonly value: string;
  readonly onChange: (theme: string) => void;
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  const [showCustom, setShowCustom] = useState(
    () => !!value && !TRIP_THEMES.some((t) => t.name === value),
  );
  const [customValue, setCustomValue] = useState(
    () => (TRIP_THEMES.some((t) => t.name === value) ? "" : value),
  );

  function handlePresetClick(name: string) {
    setShowCustom(false);
    onChange(value === name ? "" : name);
  }

  function handleCustomApply() {
    if (customValue.trim()) {
      onChange(customValue.trim());
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">여행 테마</p>
        <button
          type="button"
          onClick={() => setShowCustom((prev) => !prev)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pencil className="h-3 w-3" />
          {showCustom ? "프리셋 선택" : "직접 입력"}
        </button>
      </div>

      {showCustom ? (
        <div className="flex gap-2">
          <Input
            placeholder="테마를 직접 입력하세요"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCustomApply();
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleCustomApply}
            disabled={!customValue.trim()}
          >
            적용
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TRIP_THEMES.map((theme) => {
            const isSelected = value === theme.name;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handlePresetClick(theme.name)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/40 hover:bg-muted/50",
                )}
              >
                <span className="text-lg shrink-0">{theme.icon}</span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium leading-tight",
                      isSelected ? "text-primary" : "",
                    )}
                  >
                    {theme.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight truncate">
                    {theme.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
