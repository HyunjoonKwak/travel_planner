import { NextRequest, NextResponse } from "next/server";
import { getCityById } from "@/lib/data/destinations";
import type { RecommendationResult, RecommendationResponse } from "@/types/recommendation";

const CITY_LOCAL_MAP: Record<string, { localName: string; lang: string; country: string }> = {
  // Japan
  osaka: { localName: "大阪", lang: "ja", country: "JP" },
  kyoto: { localName: "京都", lang: "ja", country: "JP" },
  tokyo: { localName: "東京", lang: "ja", country: "JP" },
  fukuoka: { localName: "福岡", lang: "ja", country: "JP" },
  nara: { localName: "奈良", lang: "ja", country: "JP" },
  kobe: { localName: "神戸", lang: "ja", country: "JP" },
  hiroshima: { localName: "広島", lang: "ja", country: "JP" },
  sapporo: { localName: "札幌", lang: "ja", country: "JP" },
  okinawa: { localName: "沖縄", lang: "ja", country: "JP" },
  nagoya: { localName: "名古屋", lang: "ja", country: "JP" },
  yokohama: { localName: "横浜", lang: "ja", country: "JP" },
  hakone: { localName: "箱根", lang: "ja", country: "JP" },
  // Taiwan
  taipei: { localName: "台北", lang: "zh-TW", country: "TW" },
  kaohsiung: { localName: "高雄", lang: "zh-TW", country: "TW" },
  tainan: { localName: "台南", lang: "zh-TW", country: "TW" },
  taichung: { localName: "台中", lang: "zh-TW", country: "TW" },
  jiufen: { localName: "九份", lang: "zh-TW", country: "TW" },
  // Thailand
  bangkok: { localName: "กรุงเทพ", lang: "th", country: "TH" },
  chiangmai: { localName: "เชียงใหม่", lang: "th", country: "TH" },
  phuket: { localName: "ภูเก็ต", lang: "th", country: "TH" },
  pattaya: { localName: "พัทยา", lang: "th", country: "TH" },
  // Vietnam
  hanoi: { localName: "Hà Nội", lang: "vi", country: "VN" },
  hochiminh: { localName: "TP.Hồ Chí Minh", lang: "vi", country: "VN" },
  danang: { localName: "Đà Nẵng", lang: "vi", country: "VN" },
  hoian: { localName: "Hội An", lang: "vi", country: "VN" },
};

const FOOD_QUERY: Record<string, (localName: string) => string> = {
  JP: (n) => `${n} 人気 レストラン`,
  TW: (n) => `${n} 熱門 餐廳`,
  TH: (n) => `${n} restaurant popular`,
  VN: (n) => `${n} nhà hàng nổi tiếng`,
};

const ATTRACTION_QUERY: Record<string, (localName: string) => string> = {
  JP: (n) => `${n} 観光スポット`,
  TW: (n) => `${n} 觀光景點`,
  TH: (n) => `${n} tourist attraction`,
  VN: (n) => `${n} điểm du lịch`,
};

const FIELD_MASK =
  "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.googleMapsUri,places.nationalPhoneNumber,places.types,places.currentOpeningHours";

const PLACES_API_URL = "https://places.googleapis.com/v1/places:searchText";

interface PlaceApiResult {
  id?: string;
  displayName?: { text?: string; languageCode?: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  location?: { latitude?: number; longitude?: number };
  googleMapsUri?: string;
  nationalPhoneNumber?: string;
  types?: string[];
  currentOpeningHours?: { openNow?: boolean };
}

interface PlacesApiResponse {
  places?: PlaceApiResult[];
}

async function searchPlaces(
  query: string,
  apiKey: string,
  languageCode: string
): Promise<PlaceApiResult[]> {
  const response = await fetch(PLACES_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
      "Accept-Language": languageCode,
    },
    body: JSON.stringify({
      textQuery: query,
      maxResultCount: 20,
      languageCode,
    }),
  });

  if (!response.ok) {
    throw new Error(`Places API error: ${response.status}`);
  }

  const data: PlacesApiResponse = await response.json();
  return data.places ?? [];
}

function buildQuery(
  localName: string,
  country: string,
  type: "food" | "attraction"
): string {
  const queryMap = type === "food" ? FOOD_QUERY : ATTRACTION_QUERY;
  const builder = queryMap[country] ?? ((n) => `${n} ${type === "food" ? "restaurant" : "tourist attraction"}`);
  return builder(localName);
}

async function fetchCityRecommendations(
  cityId: string,
  type: "food" | "attraction",
  apiKey: string
): Promise<RecommendationResult[]> {
  const cityInfo = CITY_LOCAL_MAP[cityId];
  if (!cityInfo) return [];

  const { localName, lang, country } = cityInfo;
  const city = getCityById(cityId);
  const cityName = city?.name ?? cityId;
  const query = buildQuery(localName, country, type);

  const [localPlaces, koPlaces] = await Promise.all([
    searchPlaces(query, apiKey, lang),
    searchPlaces(query, apiKey, "ko"),
  ]);

  const koNameMap = new Map<string, string>(
    koPlaces
      .filter((p) => p.id)
      .map((p) => [p.id!, p.displayName?.text ?? ""])
  );

  return localPlaces
    .filter((place) => place.id && place.location)
    .map((place): RecommendationResult => ({
      placeId: place.id!,
      name: koNameMap.get(place.id!) || place.displayName?.text || "",
      nameJa: place.displayName?.text ?? "",
      nameLocal: place.displayName?.text ?? "",
      address: place.formattedAddress ?? "",
      rating: place.rating ?? 0,
      reviewCount: place.userRatingCount ?? 0,
      phone: place.nationalPhoneNumber,
      city: cityId,
      cityName,
      lat: place.location!.latitude ?? 0,
      lng: place.location!.longitude ?? 0,
      types: place.types ?? [],
      googleMapsUrl: place.googleMapsUri,
      openNow: place.currentOpeningHours?.openNow,
      category: type,
    }));
}

export async function POST(request: NextRequest): Promise<NextResponse<RecommendationResponse>> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ results: [], status: "NO_API_KEY" });
  }

  let body: { cities?: unknown; type?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ results: [], status: "ERROR" });
  }

  const { cities, type } = body;

  if (
    !Array.isArray(cities) ||
    cities.length === 0 ||
    (type !== "food" && type !== "attraction")
  ) {
    return NextResponse.json({ results: [], status: "ERROR" });
  }

  const validCities = cities.filter(
    (c): c is string => typeof c === "string" && c in CITY_LOCAL_MAP
  );

  try {
    const allResults = await Promise.all(
      validCities.map((cityId) =>
        fetchCityRecommendations(cityId, type as "food" | "attraction", apiKey)
      )
    );

    const results = allResults.flat();
    return NextResponse.json({ results, status: "OK" });
  } catch {
    return NextResponse.json({ results: [], status: "ERROR" });
  }
}
