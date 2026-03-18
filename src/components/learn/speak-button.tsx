"use client";

import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeech } from "@/hooks/use-speech";
import { cn } from "@/lib/utils";

interface SpeakButtonProps {
  text: string;
  className?: string;
}

export function SpeakButton({ text, className }: SpeakButtonProps) {
  const { speak } = useSpeech();

  const handleClick = () => {
    speak(text, "ja-JP");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={cn("h-8 w-8 shrink-0", className)}
      aria-label="발음 듣기"
    >
      <Volume2 className="h-4 w-4" />
    </Button>
  );
}
