"use client";

import Link from "next/link";
import { Plus, Camera } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JournalEntry } from "@/components/journal/journal-entry";
import { PhotoThumbnail } from "@/components/journal/photo-thumbnail";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { JournalEntry as JournalEntryType } from "@/types/journal";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "journal_entries";

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
      <span className="text-4xl">📖</span>
      <p className="text-sm">아직 작성한 일기가 없어요.</p>
      <Link
        href="/journal/write"
        className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
      >
        첫 일기 쓰기
      </Link>
    </div>
  );
}

interface PhotoEntry {
  readonly photoRef: string;
  readonly entry: JournalEntryType;
}

function GalleryView({ entries }: { readonly entries: JournalEntryType[] }) {
  const photos: PhotoEntry[] = entries.flatMap((entry) => {
    const ids = (entry.photoIds ?? []).map((photoRef) => ({ photoRef, entry }));
    const legacy = (entry.photos ?? []).map((photoRef) => ({ photoRef, entry }));
    return [...ids, ...legacy];
  });

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
        <Camera className="h-10 w-10" />
        <p className="text-sm">사진이 없어요.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {photos.map(({ photoRef, entry }, index) => (
        <div
          key={`${entry.id}-${index}`}
          className="relative aspect-square overflow-hidden bg-muted"
        >
          <PhotoThumbnail
            photoRef={photoRef}
            alt={`${entry.date} 사진`}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}

export default function JournalPage() {
  const [entries] = useLocalStorage<JournalEntryType[]>(STORAGE_KEY, []);

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const totalPhotos = entries.reduce(
    (sum, e) =>
      sum +
      (e.photoIds?.length ?? 0) +
      (e.photos?.length ?? 0),
    0,
  );

  return (
    <div className="relative min-h-screen pb-24">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold">여행 일기</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {entries.length}개의 기록 · 사진 {totalPhotos}장
        </p>
      </div>

      <Tabs defaultValue="timeline" className="px-4">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="timeline" className="flex-1">
            타임라인
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex-1">
            갤러리
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          {sortedEntries.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {sortedEntries.map((entry) => (
                <JournalEntry key={entry.id} entry={entry} truncate />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="gallery">
          <GalleryView entries={sortedEntries} />
        </TabsContent>
      </Tabs>

      {/* FAB */}
      <div className="fixed bottom-20 right-4 z-50">
        <Link
          href="/journal/write"
          aria-label="일기 작성"
          className={cn(
            buttonVariants({ size: "icon" }),
            "h-14 w-14 rounded-full shadow-lg",
          )}
        >
          <Plus className="h-6 w-6" />
        </Link>
      </div>
    </div>
  );
}
