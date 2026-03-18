"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function FoodError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging
    if (typeof window !== "undefined") {
      (window as Record<string, unknown>).__food_error = error.message;
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <p className="text-3xl mb-3">⚠️</p>
      <p className="text-sm font-medium">맛집 페이지에서 오류가 발생했습니다</p>
      <p className="text-xs text-muted-foreground mt-1 mb-4">{error.message}</p>
      <Button size="sm" variant="outline" onClick={reset}>
        다시 시도
      </Button>
    </div>
  );
}
