"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { JournalEntry as JournalEntryType, MOOD_CONFIG } from "@/types/journal";
import { formatDateKo } from "@/lib/utils/date";
import { Camera, MapPin, Cloud, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhotoThumbnail } from "./photo-thumbnail";

interface JournalEntryProps {
  readonly entry: JournalEntryType;
  readonly truncate?: boolean;
}

function WeatherIcon({ weather }: { readonly weather?: string }) {
  if (!weather) return null;
  const isCloud = weather.toLowerCase().includes("cloud") || weather.includes("흐");
  const Icon = isCloud ? Cloud : Sun;
  return <Icon className="h-4 w-4 text-muted-foreground" />;
}

export function JournalEntry({ entry, truncate = true }: JournalEntryProps) {
  const moodConfig = MOOD_CONFIG[entry.mood];

  // Combine both legacy base64 photos and new photo IDs into one list
  const photoRefs: ReadonlyArray<string> = [
    ...(entry.photoIds ?? []),
    ...(entry.photos ?? []),
  ];
  const photoCount = photoRefs.length;

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {formatDateKo(entry.date)}
            </span>
            <WeatherIcon weather={entry.weather} />
            {entry.temperature !== undefined && (
              <span className="text-xs text-muted-foreground">
                {entry.temperature}°C
              </span>
            )}
          </div>
          <Badge variant="secondary" className="text-sm">
            {moodConfig.emoji} {moodConfig.label}
          </Badge>
        </div>

        {/* Content */}
        <p
          className={cn(
            "text-sm text-foreground/80 leading-relaxed",
            truncate && "line-clamp-3",
          )}
        >
          {entry.content}
        </p>

        {/* Photos */}
        {photoCount > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photoRefs.map((ref, index) => (
              <div
                key={`${ref.slice(0, 16)}-${index}`}
                className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-muted"
              >
                <PhotoThumbnail
                  photoRef={ref}
                  alt={`사진 ${index + 1}`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {entry.location && (
            <Badge variant="outline" className="text-xs gap-1">
              <MapPin className="h-3 w-3" />
              {entry.location}
            </Badge>
          )}
          {photoCount > 0 && (
            <Badge variant="outline" className="text-xs gap-1">
              <Camera className="h-3 w-3" />
              {photoCount}장
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
