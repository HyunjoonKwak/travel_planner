"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  JournalEntry,
  MOOD_CONFIG,
} from "@/types/journal";
import { ScheduleItem, SCHEDULE_CATEGORY_CONFIG } from "@/types/schedule";
import { formatDateKo } from "@/lib/utils/date";
import { PhotoThumbnail } from "@/components/journal/photo-thumbnail";
import { PhotoViewer } from "@/components/journal/photo-viewer";

const JOURNAL_KEY = "journal_entries";
const SCHEDULE_KEY = "travel-schedule";

interface Props {
  readonly params: Promise<{ id: string }>;
}

function ScheduleSection({ date }: { readonly date: string }) {
  const [schedules] = useLocalStorage<ScheduleItem[]>(SCHEDULE_KEY, []);
  const dayItems = schedules.filter((s) => s.date === date);

  if (dayItems.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
        <Calendar className="h-4 w-4" />
        그날의 일정
      </h3>
      <div className="space-y-1.5">
        {dayItems.map((item) => {
          const cat = SCHEDULE_CATEGORY_CONFIG[item.category];
          return (
            <div
              key={item.id}
              className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-md bg-muted/50"
            >
              <span>{cat.icon}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {item.startTime}
              </span>
              <span className="font-medium truncate">{item.title}</span>
              {item.location && (
                <span className="text-xs text-muted-foreground truncate ml-auto">
                  {item.location}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function JournalDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>(
    JOURNAL_KEY,
    [],
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const entry = entries.find((e) => e.id === id);

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">일기를 찾을 수 없어요.</p>
        <Link
          href="/journal"
          className="text-sm text-primary underline underline-offset-2"
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const moodConfig = MOOD_CONFIG[entry.mood];
  const photoRefs: string[] = [
    ...(entry.photoIds ?? []),
    ...(entry.photos ?? []),
  ];

  function handleDelete() {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    router.push("/journal");
  }

  function openViewer(index: number) {
    setViewerIndex(index);
    setViewerOpen(true);
  }

  return (
    <div className="min-h-screen pb-10">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/journal")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/journal/write?edit=${id}`)}
            aria-label="일기 수정"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteOpen(true)}
            className="text-destructive hover:text-destructive"
            aria-label="일기 삭제"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 space-y-5">
        {/* Date & Mood */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {formatDateKo(entry.date)}
            </p>
            {entry.location && (
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {entry.location}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl">{moodConfig.emoji}</span>
            <Badge variant="secondary" className="text-xs mt-1">
              {moodConfig.label}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Content */}
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
          {entry.content}
        </p>

        {/* Photos grid */}
        {photoRefs.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">
              사진 {photoRefs.length}장
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {photoRefs.map((ref, index) => (
                <button
                  key={`${ref.slice(0, 16)}-${index}`}
                  onClick={() => openViewer(index)}
                  className="relative aspect-square overflow-hidden rounded-md bg-muted active:opacity-80"
                  aria-label={`사진 ${index + 1} 크게 보기`}
                >
                  <PhotoThumbnail
                    photoRef={ref}
                    alt={`사진 ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* That day's schedule */}
        <ScheduleSection date={entry.date} />
      </div>

      {/* Delete confirm dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-xs mx-auto rounded-xl">
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <h2 className="font-semibold text-base">일기를 삭제할까요?</h2>
              <p className="text-sm text-muted-foreground">
                삭제된 일기는 복구할 수 없어요.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteOpen(false)}
              >
                취소
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
              >
                삭제
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo viewer */}
      {viewerOpen && (
        <PhotoViewer
          photos={photoRefs}
          initialIndex={viewerIndex}
          currentIndex={viewerIndex}
          onIndexChange={setViewerIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
}
