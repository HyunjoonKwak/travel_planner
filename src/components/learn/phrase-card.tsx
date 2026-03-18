"use client";

import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/learn/speak-button";
import { cn } from "@/lib/utils";
import type { Phrase } from "@/types/learn";

interface PhraseCardProps {
  phrase: Phrase;
  saved: boolean;
  onToggleSave: (id: string) => void;
}

export function PhraseCard({ phrase, saved, onToggleSave }: PhraseCardProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-foreground">{phrase.korean}</p>
            <p className="text-lg font-bold">{phrase.japanese}</p>
            <p className="text-sm text-muted-foreground">{phrase.reading}</p>
            <p className="text-xs text-muted-foreground/70">{phrase.romaji}</p>
          </div>
          <div className="flex flex-col items-center gap-1 pt-1">
            <SpeakButton text={phrase.japanese} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleSave(phrase.id)}
              className={cn(
                "h-8 w-8",
                saved ? "text-yellow-500" : "text-muted-foreground",
              )}
              aria-label={saved ? "저장 취소" : "저장"}
            >
              <Star className={cn("h-4 w-4", saved && "fill-current")} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
