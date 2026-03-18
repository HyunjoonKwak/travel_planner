export interface Country {
  readonly code: string;
  readonly name: string;
  readonly nameLocal: string;
  readonly flag: string;
  readonly cities: ReadonlyArray<City>;
}

export interface City {
  readonly id: string;
  readonly name: string;
  readonly nameLocal: string;
  readonly country: string;
}

export const COUNTRIES: ReadonlyArray<Country> = [
  {
    code: "JP",
    name: "일본",
    nameLocal: "日本",
    flag: "🇯🇵",
    cities: [
      { id: "osaka", name: "오사카", nameLocal: "大阪", country: "JP" },
      { id: "kyoto", name: "교토", nameLocal: "京都", country: "JP" },
      { id: "tokyo", name: "도쿄", nameLocal: "東京", country: "JP" },
      { id: "fukuoka", name: "후쿠오카", nameLocal: "福岡", country: "JP" },
      { id: "nara", name: "나라", nameLocal: "奈良", country: "JP" },
      { id: "kobe", name: "고베", nameLocal: "神戸", country: "JP" },
      { id: "hiroshima", name: "히로시마", nameLocal: "広島", country: "JP" },
      { id: "sapporo", name: "삿포로", nameLocal: "札幌", country: "JP" },
      { id: "okinawa", name: "오키나와", nameLocal: "沖縄", country: "JP" },
      { id: "nagoya", name: "나고야", nameLocal: "名古屋", country: "JP" },
      { id: "yokohama", name: "요코하마", nameLocal: "横浜", country: "JP" },
      { id: "hakone", name: "하코네", nameLocal: "箱根", country: "JP" },
    ],
  },
  {
    code: "TW",
    name: "대만",
    nameLocal: "台灣",
    flag: "🇹🇼",
    cities: [
      { id: "taipei", name: "타이베이", nameLocal: "台北", country: "TW" },
      { id: "kaohsiung", name: "가오슝", nameLocal: "高雄", country: "TW" },
      { id: "tainan", name: "타이난", nameLocal: "台南", country: "TW" },
      { id: "taichung", name: "타이중", nameLocal: "台中", country: "TW" },
      { id: "jiufen", name: "지우펀", nameLocal: "九份", country: "TW" },
    ],
  },
  {
    code: "TH",
    name: "태국",
    nameLocal: "ประเทศไทย",
    flag: "🇹🇭",
    cities: [
      { id: "bangkok", name: "방콕", nameLocal: "กรุงเทพ", country: "TH" },
      { id: "chiangmai", name: "치앙마이", nameLocal: "เชียงใหม่", country: "TH" },
      { id: "phuket", name: "푸켓", nameLocal: "ภูเก็ต", country: "TH" },
      { id: "pattaya", name: "파타야", nameLocal: "พัทยา", country: "TH" },
    ],
  },
  {
    code: "VN",
    name: "베트남",
    nameLocal: "Việt Nam",
    flag: "🇻🇳",
    cities: [
      { id: "hanoi", name: "하노이", nameLocal: "Hà Nội", country: "VN" },
      { id: "hochiminh", name: "호치민", nameLocal: "TP.HCM", country: "VN" },
      { id: "danang", name: "다낭", nameLocal: "Đà Nẵng", country: "VN" },
      { id: "hoian", name: "호이안", nameLocal: "Hội An", country: "VN" },
    ],
  },
];

export function getAllCities(): ReadonlyArray<City> {
  return COUNTRIES.flatMap((country) => country.cities);
}

export function getCitiesByCountry(code: string): ReadonlyArray<City> {
  const country = COUNTRIES.find((c) => c.code === code);
  return country?.cities ?? [];
}

export function getCityById(id: string): City | undefined {
  return getAllCities().find((city) => city.id === id);
}
