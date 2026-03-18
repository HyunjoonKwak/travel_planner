import { NextRequest, NextResponse } from "next/server";

interface HotelSearchResult {
  readonly placeId: string;
  readonly name: string;
  readonly nameJa: string;
  readonly address: string;
  readonly rating: number;
  readonly reviewCount: number;
  readonly phone?: string;
  readonly priceLevel?: number;
  readonly city: string;
}

const MOCK_HOTELS: ReadonlyArray<HotelSearchResult> = [
  // Osaka
  { placeId: "h_dormy_namba", name: "도미인 프리미엄 난바", nameJa: "ドーミーイン プレミアム なんば", address: "大阪市中央区心斎橋筋2-5-15", rating: 4.4, reviewCount: 3421, phone: "06-6211-5489", city: "오사카" },
  { placeId: "h_cross_osaka", name: "크로스호텔 오사카", nameJa: "クロスホテル大阪", address: "大阪市中央区心斎橋筋2-5-15", rating: 4.3, reviewCount: 2876, phone: "06-6213-8281", city: "오사카" },
  { placeId: "h_monterey_osaka", name: "호텔 몬테레이 그라스미어 오사카", nameJa: "ホテルモントレ グラスミア大阪", address: "大阪市浪速区湊町1-2-3", rating: 4.2, reviewCount: 1543, phone: "06-6645-7111", city: "오사카" },
  { placeId: "h_nikko_osaka", name: "호텔 닛코 오사카", nameJa: "ホテル日航大阪", address: "大阪市中央区西心斎橋1-3-3", rating: 4.5, reviewCount: 4102, phone: "06-6244-1111", city: "오사카" },
  { placeId: "h_swissotel_osaka", name: "스위소텔 난카이 오사카", nameJa: "スイスホテル南海大阪", address: "大阪市中央区難波5-1-60", rating: 4.4, reviewCount: 5234, phone: "06-6646-1111", city: "오사카" },
  { placeId: "h_apa_namba", name: "APA 호텔 난바역 히가시", nameJa: "APAホテル なんば駅東", address: "大阪市浪速区日本橋3-4-8", rating: 3.8, reviewCount: 987, phone: "06-6630-1511", city: "오사카" },
  { placeId: "h_toyoko_shin", name: "토요코인 신사이바시", nameJa: "東横INN 心斎橋", address: "大阪市中央区心斎橋筋1-9-22", rating: 3.7, reviewCount: 1234, phone: "06-6258-1045", city: "오사카" },
  { placeId: "h_intercontinental", name: "인터컨티넨탈 오사카", nameJa: "インターコンチネンタルホテル大阪", address: "大阪市北区大深町3-60", rating: 4.6, reviewCount: 3890, phone: "06-6374-5700", city: "오사카" },
  { placeId: "h_marriott_osaka", name: "오사카 매리어트 미야코 호텔", nameJa: "大阪マリオット都ホテル", address: "大阪市阿倍野区阿倍野筋1-1-43", rating: 4.6, reviewCount: 2987, phone: "06-6628-6111", city: "오사카" },
  { placeId: "h_rihga_osaka", name: "리가로열호텔 오사카", nameJa: "リーガロイヤルホテル大阪", address: "大阪市北区中之島5-3-68", rating: 4.3, reviewCount: 3456, phone: "06-6448-1121", city: "오사카" },
  // Kyoto
  { placeId: "h_granvia_kyoto", name: "호텔 그란비아 교토", nameJa: "ホテルグランヴィア京都", address: "京都市下京区烏丸通塩小路下ル", rating: 4.4, reviewCount: 4567, phone: "075-344-8888", city: "교토" },
  { placeId: "h_mitsui_kyoto", name: "미쓰이 가든 호텔 교토역전", nameJa: "三井ガーデンホテル京都駅前", address: "京都市下京区東塩小路町846-3", rating: 4.2, reviewCount: 2341, phone: "075-361-5531", city: "교토" },
  { placeId: "h_dormy_kyoto", name: "도미인 프리미엄 교토 에키마에", nameJa: "ドーミーイン プレミアム京都駅前", address: "京都市下京区東洞院通七条下ル", rating: 4.3, reviewCount: 1876, phone: "075-371-5489", city: "교토" },
  { placeId: "h_hyatt_kyoto", name: "파크 하얏트 교토", nameJa: "パーク ハイアット 京都", address: "京都市東山区高台寺桝屋町360", rating: 4.8, reviewCount: 1234, phone: "075-531-1234", city: "교토" },
  { placeId: "h_apa_kyoto", name: "APA 호텔 교토 기온", nameJa: "APAホテル 京都祇園", address: "京都市東山区祇園町南側555", rating: 3.9, reviewCount: 876, phone: "075-551-2111", city: "교토" },
  // Tokyo
  { placeId: "h_shinjuku_granbell", name: "신주쿠 그란벨 호텔", nameJa: "新宿グランベルホテル", address: "東京都新宿区歌舞伎町2-14-5", rating: 4.1, reviewCount: 3210, phone: "03-5155-2666", city: "도쿄" },
  { placeId: "h_apa_shinjuku", name: "APA 호텔 신주쿠 가부키초", nameJa: "APAホテル 新宿歌舞伎町", address: "東京都新宿区歌舞伎町1-20-2", rating: 3.8, reviewCount: 2345, phone: "03-5155-5111", city: "도쿄" },
  { placeId: "h_dormy_ueno", name: "도미인 우에노 오카치마치", nameJa: "ドーミーイン上野・御徒町", address: "東京都台東区上野6-7-22", rating: 4.2, reviewCount: 1987, phone: "03-5816-5489", city: "도쿄" },
  // Fukuoka
  { placeId: "h_dormy_hakata", name: "도미인 프리미엄 하카타 캐널시티마에", nameJa: "ドーミーイン プレミアム博多キャナルシティ前", address: "福岡市博多区祇園町9-1", rating: 4.3, reviewCount: 1654, phone: "092-272-5489", city: "후쿠오카" },
  { placeId: "h_nishitetsu_hakata", name: "니시테츠 호텔 크룸 하카타", nameJa: "西鉄ホテルクルーム博多", address: "福岡市博多区博多駅前1-17-6", rating: 4.4, reviewCount: 2109, phone: "092-413-5454", city: "후쿠오카" },
];

function normalize(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = (body.query ?? "").trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [], status: "NEED_MORE_INPUT" });
    }

    const q = normalize(query);
    const results = MOCK_HOTELS.filter((h) =>
      normalize(h.name).includes(q) ||
      normalize(h.nameJa).includes(q) ||
      normalize(h.city).includes(q) ||
      normalize(h.address).includes(q),
    );

    return NextResponse.json({
      results,
      status: results.length > 0 ? "OK" : "ZERO_RESULTS",
    });
  } catch {
    return NextResponse.json({ results: [], status: "ERROR" }, { status: 500 });
  }
}
