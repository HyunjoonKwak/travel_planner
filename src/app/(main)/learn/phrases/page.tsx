"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhraseCard } from "@/components/learn/phrase-card";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { TRAVEL_PHRASES } from "@/lib/data/phrases";
import {
  PHRASE_CATEGORY_CONFIG,
  type PhraseCategory,
} from "@/types/learn";

const CATEGORIES = Object.keys(PHRASE_CATEGORY_CONFIG) as PhraseCategory[];

export default function PhrasesPage() {
  const [savedPhrases, setSavedPhrases] = useLocalStorage<string[]>(
    "saved-phrases",
    [],
  );
  const [activeCategory, setActiveCategory] = useState<PhraseCategory | "all">(
    "all",
  );

  const handleToggleSave = (id: string) => {
    setSavedPhrases((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const filteredPhrases =
    activeCategory === "all"
      ? TRAVEL_PHRASES
      : TRAVEL_PHRASES.filter((p) => p.category === activeCategory);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <div className="flex items-center gap-3">
        <Link href="/learn">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">여행 회화</h1>
          <p className="text-sm text-muted-foreground">
            실용 일본어 표현 모음
          </p>
        </div>
        <Badge variant="secondary">{savedPhrases.length} 저장됨</Badge>
      </div>

      <Tabs
        value={activeCategory}
        onValueChange={(v) => setActiveCategory(v as PhraseCategory | "all")}
      >
        <TabsList className="flex h-auto flex-wrap gap-1 bg-transparent p-0">
          <TabsTrigger
            value="all"
            className="rounded-full border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            전체
          </TabsTrigger>
          {CATEGORIES.map((cat) => {
            const config = PHRASE_CATEGORY_CONFIG[cat];
            return (
              <TabsTrigger
                key={cat}
                value={cat}
                className="rounded-full border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {config.icon} {config.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-4">
          <div className="space-y-3">
            {filteredPhrases.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                해당 카테고리의 표현이 없습니다.
              </p>
            ) : (
              filteredPhrases.map((phrase) => (
                <PhraseCard
                  key={phrase.id}
                  phrase={phrase}
                  saved={savedPhrases.includes(phrase.id)}
                  onToggleSave={handleToggleSave}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
