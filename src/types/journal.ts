export interface JournalEntry {
  readonly id: string;
  readonly date: string;
  readonly content: string;
  readonly location?: string;
  readonly mood: Mood;
  readonly weather?: string;
  readonly temperature?: number;
  /** @deprecated Use photoIds instead. Legacy base64 strings. */
  readonly photos?: ReadonlyArray<string>;
  /** New: photo IDs stored in photo provider (IndexedDB) */
  readonly photoIds?: ReadonlyArray<string>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type Mood = "amazing" | "happy" | "neutral" | "sad" | "angry";

export const MOOD_CONFIG: Record<Mood, { emoji: string; label: string }> = {
  amazing: { emoji: "🤩", label: "최고!" },
  happy: { emoji: "😊", label: "좋아!" },
  neutral: { emoji: "😐", label: "보통" },
  sad: { emoji: "😢", label: "슬퍼" },
  angry: { emoji: "😡", label: "화나" },
};
