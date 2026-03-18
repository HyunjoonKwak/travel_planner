"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NoTripPromptProps {
  readonly icon?: string;
  readonly message?: string;
}

export function NoTripPrompt({
  icon = "✈️",
  message = "여행이 설정되지 않았습니다",
}: NoTripPromptProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <p className="text-3xl mb-3">{icon}</p>
      <p className="text-sm font-medium">{message}</p>
      <p className="text-xs text-muted-foreground mt-1 mb-4">
        설정에서 여행을 먼저 만들어주세요
      </p>
      <Link href="/settings">
        <Button size="sm" variant="outline">
          설정으로 이동
        </Button>
      </Link>
    </div>
  );
}
