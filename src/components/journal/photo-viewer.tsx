"use client";

import { useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhotoThumbnail } from "./photo-thumbnail";
import { cn } from "@/lib/utils";

interface PhotoViewerProps {
  readonly photos: string[];
  readonly initialIndex: number;
  readonly currentIndex: number;
  readonly onIndexChange: (index: number) => void;
  readonly onClose: () => void;
}

export function PhotoViewer({
  photos,
  currentIndex,
  onIndexChange,
  onClose,
}: PhotoViewerProps) {
  const total = photos.length;

  const goNext = useCallback(() => {
    onIndexChange((currentIndex + 1) % total);
  }, [currentIndex, total, onIndexChange]);

  const goPrev = useCallback(() => {
    onIndexChange((currentIndex - 1 + total) % total);
  }, [currentIndex, total, onIndexChange]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goNext, goPrev]);

  // Touch swipe support
  let touchStartX = 0;

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) {
      if (delta < 0) goNext();
      else goPrev();
    }
  }

  if (total === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <span className="text-sm text-white/70">
          {currentIndex + 1} / {total}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Image area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <div className="h-full w-full">
          <PhotoThumbnail
            photoRef={photos[currentIndex]}
            alt={`사진 ${currentIndex + 1}`}
            className="h-full w-full object-contain"
          />
        </div>

        {/* Prev button */}
        {total > 1 && (
          <button
            onClick={goPrev}
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2",
              "rounded-full bg-black/40 p-2 text-white",
              "hover:bg-black/60 transition-colors",
            )}
            aria-label="이전 사진"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Next button */}
        {total > 1 && (
          <button
            onClick={goNext}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2",
              "rounded-full bg-black/40 p-2 text-white",
              "hover:bg-black/60 transition-colors",
            )}
            aria-label="다음 사진"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Dot indicators */}
      {total > 1 && (
        <div className="flex justify-center gap-1.5 py-4 shrink-0">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => onIndexChange(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/40",
              )}
              aria-label={`사진 ${i + 1}로 이동`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
