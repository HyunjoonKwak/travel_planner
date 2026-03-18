"use client";

import Link from "next/link";
import { Plus, Camera, Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JournalEntry } from "@/components/journal/journal-entry";
import { PhotoThumbnail } from "@/components/journal/photo-thumbnail";
import { useActiveTrip } from "@/hooks/use-trip";
import { useTripJournal } from "@/hooks/use-trip-data";
import { JournalEntry as JournalEntryType } from "@/types/journal";
import { cn } from "@/lib/utils";

// Adapter: DB JournalEntry -> local JournalEntry type
function adaptDbEntry(dbEntry: {
  id: string;
  date: string;
  content: string;
  location: string | null;
  mood: string;
  photoIds: string | null;
  createdAt: string;
  updatedAt: string;
}): JournalEntryType {
  let photoIds: string[] = [];
  if (dbEntry.photoIds) {
    try {
      const parsed = JSON.parse(dbEntry.photoIds);
      photoIds = Array.isArray(parsed) ? parsed : [];
    } catch {
      photoIds = [];
    }
  }
  return {
    id: dbEntry.id,
    date: dbEntry.date,
    content: dbEntry.content,
    location: dbEntry.location ?? undefined,
    mood: (dbEntry.mood as JournalEntryType["mood"]) ?? "neutral",
    photoIds,
    createdAt: dbEntry.createdAt,
    updatedAt: dbEntry.updatedAt,
  };
}

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

function NoTripState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
      <span className="text-4xl">🗺️</span>
      <p className="text-sm">활성화된 여행이 없어요.</p>
      <Link
        href="/settings"
        className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
      >
        여행 설정하기
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
        <Link
          key={`${entry.id}-${index}`}
          href={`/journal/${entry.id}`}
          className="relative aspect-square overflow-hidden bg-muted group"
        >
          <PhotoThumbnail
            photoRef={photoRef}
            alt={`${entry.date} 사진`}
            className="h-full w-full object-cover transition-opacity group-active:opacity-80"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-white text-[10px] leading-tight truncate">
              {entry.date.slice(5).replace("-", "/")}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function TimelineView({ entries }: { readonly entries: JournalEntryType[] }) {
  const grouped = entries.reduce<Record<string, JournalEntryType[]>>((acc, entry) => {
    const existing = acc[entry.date] ?? [];
    return { ...acc, [entry.date]: [...existing, entry] };
  }, {});

  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  return (
    <div className="space-y-4">
      {sortedDates.map((date) => {
        const dayEntries = grouped[date];
        return (
          <div key={date} className="space-y-2">
            {dayEntries.length > 1 && (
              <p className="text-xs text-muted-foreground px-1">
                {date} · {dayEntries.length}개
              </p>
            )}
            {dayEntries.map((entry) => (
              <JournalEntry key={entry.id} entry={entry} truncate />
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default function JournalPage() {
  const { activeTrip, loading: tripLoading } = useActiveTrip();
  const { items: dbEntries, loading: journalLoading } = useTripJournal(activeTrip?.id ?? "");

  if (tripLoading || journalLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!activeTrip) {
    return (
      <div className="relative min-h-screen pb-24">
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold">여행 일기</h1>
        </div>
        <NoTripState />
      </div>
    );
  }

  const entries = dbEntries.map(adaptDbEntry);

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
            <TimelineView entries={sortedEntries} />
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
