"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";

const MEMO_KEY = "dashboard-quick-memo";

export function QuickMemo() {
  const [savedMemo, setSavedMemo] = useLocalStorage<string>(MEMO_KEY, "");
  const [draft, setDraft] = useState<string>(savedMemo);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setSavedMemo(draft);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    setIsSaved(false);
  };

  const isDirty = draft !== savedMemo;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span>📝</span>
          <span>빠른 메모</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={draft}
          onChange={handleChange}
          placeholder="여행 준비 메모, 아이디어, 할 일 등을 적어보세요..."
          className="min-h-[120px] resize-none text-sm"
        />
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-0">
        <span className="text-xs text-muted-foreground">
          {isSaved ? "저장되었습니다 ✓" : isDirty ? "저장되지 않은 변경사항" : "자동 저장 안됨"}
        </span>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!isDirty}
          variant={isDirty ? "default" : "outline"}
        >
          저장
        </Button>
      </CardFooter>
    </Card>
  );
}
