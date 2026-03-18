export interface KanaChar {
  readonly char: string;
  readonly romaji: string;
  readonly row: string;
  readonly type: "basic" | "dakuten" | "handakuten" | "combo";
}

export interface Phrase {
  readonly id: string;
  readonly category: PhraseCategory;
  readonly korean: string;
  readonly japanese: string;
  readonly reading: string;
  readonly romaji: string;
}

export type PhraseCategory =
  | "restaurant"
  | "shopping"
  | "transport"
  | "greeting"
  | "hotel"
  | "emergency";

export const PHRASE_CATEGORY_CONFIG: Record<
  PhraseCategory,
  { label: string; icon: string }
> = {
  restaurant: { label: "식당", icon: "🍽" },
  shopping: { label: "쇼핑", icon: "🛍" },
  transport: { label: "교통", icon: "🚇" },
  greeting: { label: "인사", icon: "👋" },
  hotel: { label: "숙소", icon: "🏨" },
  emergency: { label: "긴급", icon: "🚨" },
};

export type LearningStatus = "not_started" | "learning" | "completed";

export interface QuizQuestion {
  readonly question: string;
  readonly correctAnswer: string;
  readonly options: ReadonlyArray<string>;
}
