"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AttractionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as Record<string, unknown>).__attractions_error = error.message;
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <p className="text-3xl mb-3">⚠️</p>
      <p className="text-sm font-medium">명소 페이지에서 오류가 발생했습니다</p>
      <p className="text-xs text-muted-foreground mt-1 mb-4">{error.message}</p>
      <Button size="sm" variant="outline" onClick={reset}>
        다시 시도
      </Button>
    </div>
  );
}
