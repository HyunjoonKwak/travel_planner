"use client";

import { useState, useRef, ChangeEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MapPin, Camera, Image, X, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { usePhotos } from "@/hooks/use-photos";
import { JournalEntry, Mood, MOOD_CONFIG } from "@/types/journal";
import { formatDateKo, generateId } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import { PhotoThumbnail } from "@/components/journal/photo-thumbnail";

const STORAGE_KEY = "journal_entries";
const MOOD_KEYS = Object.keys(MOOD_CONFIG) as Mood[];

interface PendingPhoto {
  readonly id: string;
  readonly previewUrl: string;
}

function JournalWriteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [entries, setEntries] = useLocalStorage<JournalEntry[]>(STORAGE_KEY, []);
  const { upload } = usePhotos();

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [mood, setMood] = useState<Mood>("happy");
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [existingPhotoIds, setExistingPhotoIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (initialized) return;
    if (editId) {
      const target = entries.find((e) => e.id === editId);
      if (target) {
        setDate(target.date);
        setContent(target.content);
        setLocation(target.location ?? "");
        setMood(target.mood);
        setExistingPhotoIds([...(target.photoIds ?? [])]);
      }
    }
    setInitialized(true);
  }, [editId, entries, initialized]);

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const results = await Promise.all(
        files.map(async (file) => {
          const previewUrl = URL.createObjectURL(file);
          const meta = await upload(file);
          return { id: meta.id, previewUrl };
        }),
      );
      setPendingPhotos((prev) => [...prev, ...results]);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeNewPhoto(id: string) {
    setPendingPhotos((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  function removeExistingPhoto(id: string) {
    setExistingPhotoIds((prev) => prev.filter((p) => p !== id));
  }

  function handleSave() {
    if (!content.trim()) return;

    const now = new Date().toISOString();
    const allPhotoIds = [
      ...existingPhotoIds,
      ...pendingPhotos.map((p) => p.id),
    ];

    if (editId) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === editId
            ? {
                ...e,
                date,
                content: content.trim(),
                location: location.trim() || undefined,
                mood,
                photoIds: allPhotoIds,
                photos: undefined,
                updatedAt: now,
              }
            : e,
        ),
      );
      pendingPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      router.push(`/journal/${editId}`);
    } else {
      const newEntry: JournalEntry = {
        id: generateId(),
        date,
        content: content.trim(),
        location: location.trim() || undefined,
        mood,
        photoIds: allPhotoIds,
        createdAt: now,
        updatedAt: now,
      };
      setEntries((prev) => [newEntry, ...prev]);
      pendingPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      router.push("/journal");
    }
  }

  function handleCancel() {
    pendingPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    if (editId) {
      router.push(`/journal/${editId}`);
    } else {
      router.push("/journal");
    }
  }

  const isEditing = Boolean(editId);

  return (
    <div className="min-h-screen pb-10">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">
          {isEditing ? "일기 수정" : "일기 쓰기"}
        </h1>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!content.trim() || uploading}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "저장"}
        </Button>
      </div>

      <div className="px-4 space-y-4">
        {/* Date picker */}
        <div className="space-y-2">
          <Label htmlFor="date">날짜</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-9"
            />
          </div>
          <p className="text-xs text-muted-foreground">{formatDateKo(date)}</p>
        </div>

        {/* Mood selector */}
        <div className="space-y-2">
          <Label>기분</Label>
          <div className="flex gap-2">
            {MOOD_KEYS.map((m) => {
              const config = MOOD_CONFIG[m];
              return (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border p-2 flex-1 transition-colors",
                    mood === m
                      ? "border-primary bg-primary/10"
                      : "border-border bg-transparent",
                  )}
                >
                  <span className="text-xl">{config.emoji}</span>
                  <span className="text-xs text-muted-foreground">
                    {config.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">장소</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              placeholder="방문한 장소를 입력하세요"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">기록</Label>
          <Textarea
            id="content"
            placeholder="오늘 하루를 기록해보세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="resize-none"
          />
        </div>

        {/* Photo upload */}
        <div className="space-y-2">
          <Label>사진</Label>

          {/* Existing photos (edit mode) */}
          {existingPhotoIds.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {existingPhotoIds.map((id, index) => (
                <div
                  key={id}
                  className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-muted"
                >
                  <PhotoThumbnail
                    photoRef={id}
                    alt={`기존 사진 ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeExistingPhoto(id);
                    }}
                    className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5"
                    aria-label={`사진 ${index + 1} 삭제`}
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Camera / Gallery buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Card
              className="border-dashed cursor-pointer"
              onClick={() => cameraInputRef.current?.click()}
            >
              <CardContent className="flex flex-col items-center justify-center py-4 gap-1">
                <Camera className="h-5 w-5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">카메라 촬영</p>
              </CardContent>
            </Card>

            <Card
              className="border-dashed cursor-pointer"
              onClick={() => galleryInputRef.current?.click()}
            >
              <CardContent className="flex flex-col items-center justify-center py-4 gap-1">
                <Image className="h-5 w-5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">갤러리</p>
              </CardContent>
            </Card>
          </div>

          {/* Hidden inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoChange}
          />

          {/* Upload indicator */}
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              사진 업로드 중...
            </div>
          )}

          {/* New photo previews */}
          {pendingPhotos.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {pendingPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-muted"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.previewUrl}
                    alt={`새 사진 ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNewPhoto(photo.id);
                    }}
                    className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5"
                    aria-label={`사진 ${index + 1} 삭제`}
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cancel */}
        <Button variant="outline" className="w-full" onClick={handleCancel}>
          취소
        </Button>
      </div>
    </div>
  );
}


export default function JournalWritePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <JournalWriteForm />
    </Suspense>
  );
}
