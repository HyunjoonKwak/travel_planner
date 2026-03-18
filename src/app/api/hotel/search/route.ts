import { NextRequest, NextResponse } from "next/server";

interface GooglePlaceCandidate {
  displayName?: { text?: string; languageCode?: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  internationalPhoneNumber?: string;
  nationalPhoneNumber?: string;
  googleMapsUri?: string;
  id?: string;
}

interface HotelSearchResult {
  readonly placeId: string;
  readonly name: string;
  readonly nameJa: string;
  readonly address: string;
  readonly rating: number;
  readonly reviewCount: number;
  readonly phone?: string;
  readonly city: string;
  readonly googleMapsUrl?: string;
}

async function searchGooglePlaces(
  query: string,
  apiKey: string,
): Promise<HotelSearchResult[]> {
  const url = "https://places.googleapis.com/v1/places:searchText";

  const body = {
    textQuery: `${query} ホテル`,
    languageCode: "ja",
    maxResultCount: 8,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.internationalPhoneNumber,places.nationalPhoneNumber,places.googleMapsUri",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  const places: GooglePlaceCandidate[] = data.places ?? [];

  // Fetch Korean names
  const bodyKo = {
    textQuery: `${query} ホテル`,
    languageCode: "ko",
    maxResultCount: 8,
  };

  const resKo = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName",
    },
    body: JSON.stringify(bodyKo),
  });

  const dataKo = await resKo.json();
  const placesKo: GooglePlaceCandidate[] = dataKo.places ?? [];
  const koNameMap = new Map<string, string>();
  for (const p of placesKo) {
    if (p.id && p.displayName?.text) {
      koNameMap.set(p.id, p.displayName.text);
    }
  }

  return places.map((place) => {
    const jaName = place.displayName?.text ?? "";
    const koName = koNameMap.get(place.id ?? "") ?? jaName;
    const addr = place.formattedAddress ?? "";

    let city = "";
    if (addr.includes("大阪") || addr.includes("오사카")) city = "오사카";
    else if (addr.includes("京都") || addr.includes("교토")) city = "교토";
    else if (addr.includes("東京") || addr.includes("도쿄")) city = "도쿄";
    else if (addr.includes("福岡") || addr.includes("후쿠오카")) city = "후쿠오카";
    else if (addr.includes("札幌")) city = "삿포로";
    else if (addr.includes("名古屋")) city = "나고야";
    else if (addr.includes("神戸")) city = "고베";
    else if (addr.includes("奈良")) city = "나라";
    else city = "일본";

    return {
      placeId: place.id ?? "",
      name: koName,
      nameJa: jaName,
      address: addr,
      rating: place.rating ?? 0,
      reviewCount: place.userRatingCount ?? 0,
      phone:
        place.nationalPhoneNumber ??
        place.internationalPhoneNumber ??
        undefined,
      city,
      googleMapsUrl: place.googleMapsUri ?? undefined,
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = (body.query ?? "").trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [], status: "NEED_MORE_INPUT" });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { results: [], status: "NO_API_KEY" },
        { status: 500 },
      );
    }

    const results = await searchGooglePlaces(query, apiKey);

    return NextResponse.json({
      results,
      status: results.length > 0 ? "OK" : "ZERO_RESULTS",
    });
  } catch {
    return NextResponse.json(
      { results: [], status: "ERROR" },
      { status: 500 },
    );
  }
}
