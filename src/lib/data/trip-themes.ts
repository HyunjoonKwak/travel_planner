export interface TripThemePreset {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly description: string;
}

export const TRIP_THEMES: ReadonlyArray<TripThemePreset> = [
  { id: "cherry-blossom", name: "벚꽃여행", icon: "🌸", description: "봄 벚꽃 명소 탐방" },
  { id: "foodie", name: "미식투어", icon: "🍜", description: "현지 맛집·길거리 음식 탐방" },
  { id: "onsen", name: "온천여행", icon: "♨️", description: "온천·료칸 힐링 여행" },
  { id: "culture", name: "문화탐방", icon: "🏯", description: "사찰·신사·역사 유적지" },
  { id: "shopping", name: "쇼핑여행", icon: "🛍", description: "면세·아울렛·로컬 브랜드" },
  { id: "family", name: "가족여행", icon: "👨‍👩‍👧‍👦", description: "테마파크·체험 중심" },
  { id: "backpacking", name: "자유여행", icon: "🎒", description: "자유롭게 돌아다니기" },
  { id: "autumn", name: "단풍여행", icon: "🍁", description: "가을 단풍 명소 탐방" },
  { id: "festival", name: "축제여행", icon: "🎆", description: "마츠리·불꽃놀이·이벤트" },
  { id: "healing", name: "힐링여행", icon: "🧘", description: "자연·명상·느린 여행" },
  { id: "golf", name: "골프여행", icon: "⛳", description: "골프 코스·리조트 투어" },
];
