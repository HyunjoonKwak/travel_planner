import { NextRequest, NextResponse } from "next/server";
import type { GooglePlaceResult, FoodSearchRequest, FoodSearchResponse } from "@/types/food-search";

const MOCK_PLACES: ReadonlyArray<GooglePlaceResult> = [
  {
    placeId: "ChIJmock_ichiran_dotonbori",
    name: "이치란 도톤보리점",
    nameJa: "一蘭 道頓堀店",
    rating: 4.3,
    userRatingsTotal: 8421,
    address: "大阪府大阪市中央区道頓堀1-7-26",
    priceLevel: 2,
    types: ["restaurant", "food", "ramen"],
    lat: 34.6687,
    lng: 135.5014,
    openNow: true,
  },
  {
    placeId: "ChIJmock_wanaka_takoyaki",
    name: "와나카 타코야키",
    nameJa: "わなか 千日前本店",
    rating: 4.1,
    userRatingsTotal: 5234,
    address: "大阪府大阪市中央区千日前1-7-19",
    priceLevel: 1,
    types: ["restaurant", "food", "takoyaki"],
    lat: 34.6685,
    lng: 135.5018,
    openNow: true,
  },
  {
    placeId: "ChIJmock_mizuno_okonomiyaki",
    name: "미즈노 오코노미야키",
    nameJa: "美津の",
    rating: 4.4,
    userRatingsTotal: 3892,
    address: "大阪府大阪市中央区道頓堀1-4-15",
    priceLevel: 2,
    types: ["restaurant", "food", "okonomiyaki"],
    lat: 34.6681,
    lng: 135.5007,
    openNow: false,
  },
  {
    placeId: "ChIJmock_daruma_kushikatsu",
    name: "다루마 신세카이 본점",
    nameJa: "だるま 新世界本店",
    rating: 4.2,
    userRatingsTotal: 6741,
    address: "大阪府大阪市浪速区恵美須東2-3-9",
    priceLevel: 2,
    types: ["restaurant", "food", "kushikatsu"],
    lat: 34.6523,
    lng: 135.5063,
    openNow: true,
  },
  {
    placeId: "ChIJmock_kani_doraku",
    name: "카니 도라쿠 도톤보리 본점",
    nameJa: "かに道楽 道頓堀本店",
    rating: 3.9,
    userRatingsTotal: 2143,
    address: "大阪府大阪市中央区道頓堀1-6-18",
    priceLevel: 4,
    types: ["restaurant", "food", "seafood"],
    lat: 34.6689,
    lng: 135.5011,
    openNow: true,
  },
  {
    placeId: "ChIJmock_menya_takuya",
    name: "멘야 타쿠야",
    nameJa: "麺家 拓や",
    rating: 4.5,
    userRatingsTotal: 1287,
    address: "大阪府大阪市北区角田町9-26",
    priceLevel: 2,
    types: ["restaurant", "food", "ramen"],
    lat: 34.7024,
    lng: 135.5002,
    openNow: true,
  },
  {
    placeId: "ChIJmock_endo_sushi",
    name: "엔도 스시 (오사카 중앙시장)",
    nameJa: "蛸之徹 大阪中央市場前店",
    rating: 4.6,
    userRatingsTotal: 987,
    address: "大阪府大阪市福島区野田1-1-86",
    priceLevel: 3,
    types: ["restaurant", "food", "sushi"],
    lat: 34.6896,
    lng: 135.4743,
    openNow: false,
  },
  {
    placeId: "ChIJmock_tsurukame_udon",
    name: "츠루카메 우동",
    nameJa: "鶴亀うどん",
    rating: 4.0,
    userRatingsTotal: 2341,
    address: "大阪府大阪市中央区心斎橋筋2-8-1",
    priceLevel: 1,
    types: ["restaurant", "food", "udon"],
    lat: 34.6731,
    lng: 135.5004,
    openNow: true,
  },
  {
    placeId: "ChIJmock_gion_matsuda_ramen",
    name: "기온 마츠다",
    nameJa: "祇園まつだ",
    rating: 4.4,
    userRatingsTotal: 1823,
    address: "京都市東山区",
    priceLevel: 2,
    types: ["restaurant", "ramen"],
    lat: 35.0036,
    lng: 135.7787,
    openNow: true,
  },
  {
    placeId: "ChIJmock_nishiki_market",
    name: "니시키 시장",
    nameJa: "錦市場",
    rating: 4.3,
    userRatingsTotal: 12540,
    address: "京都市中京区",
    priceLevel: 2,
    types: ["restaurant", "food", "market"],
    lat: 35.005,
    lng: 135.765,
    openNow: true,
  },
  {
    placeId: "ChIJmock_inoda_coffee",
    name: "이노다 커피",
    nameJa: "イノダコーヒ本店",
    rating: 4.4,
    userRatingsTotal: 3421,
    address: "京都市中京区",
    priceLevel: 2,
    types: ["cafe", "coffee"],
    lat: 35.0044,
    lng: 135.7597,
    openNow: true,
  },
  {
    placeId: "ChIJmock_gion_tsujiri_matcha",
    name: "기온 쯔지리",
    nameJa: "祇園辻利",
    rating: 4.5,
    userRatingsTotal: 5892,
    address: "京都市東山区",
    priceLevel: 2,
    types: ["cafe", "matcha", "dessert"],
    lat: 35.0035,
    lng: 135.7782,
    openNow: true,
  },
];

const KOREAN_TYPE_MAP: Record<string, string[]> = {
  "라멘": ["ramen"],
  "라면": ["ramen"],
  "타코야키": ["takoyaki"],
  "오코노미야키": ["okonomiyaki"],
  "쿠시카츠": ["kushikatsu"],
  "스시": ["sushi", "seafood"],
  "초밥": ["sushi"],
  "우동": ["udon"],
  "야키니쿠": ["yakiniku"],
  "카페": ["cafe", "coffee"],
  "해산물": ["seafood"],
  "도톤보리": [],
  "신세카이": [],
  "교토": [],
  "말차": ["matcha"],
  "시장": ["market"],
  "두부": ["tofu"],
};

function filterByQuery(
  places: ReadonlyArray<GooglePlaceResult>,
  query: string
): ReadonlyArray<GooglePlaceResult> {
  const normalized = query.toLowerCase().replace(/\s+/g, "");
  if (!normalized) return places;

  const mappedTypes = KOREAN_TYPE_MAP[query.trim()] ?? [];

  return places.filter((place) => {
    const nameMatch = place.name.toLowerCase().replace(/\s+/g, "").includes(normalized);
    const nameJaMatch = (place.nameJa ?? "").includes(query);
    const typeMatch = place.types.some((t) => t.includes(normalized));
    const mappedMatch = mappedTypes.length > 0 && place.types.some((t) => mappedTypes.includes(t));
    const addressMatch = place.address.includes(query.trim());
    return nameMatch || nameJaMatch || typeMatch || mappedMatch || addressMatch;
  });
}

export async function POST(request: NextRequest): Promise<NextResponse<FoodSearchResponse>> {
  try {
    const body = (await request.json()) as FoodSearchRequest;

    if (!body.query || typeof body.query !== "string") {
      return NextResponse.json(
        { results: [], status: "ERROR" },
        { status: 400 }
      );
    }

    const results = filterByQuery(MOCK_PLACES, body.query.trim());

    return NextResponse.json({
      results,
      status: results.length > 0 ? "OK" : "ZERO_RESULTS",
    });
  } catch {
    return NextResponse.json(
      { results: [], status: "ERROR" },
      { status: 500 }
    );
  }
}
