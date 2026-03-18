export interface FlightRoute {
  readonly flightNumber: string;
  readonly airline: string;
  readonly departureAirport: string;
  readonly departureCity: string;
  readonly arrivalAirport: string;
  readonly arrivalCity: string;
  readonly departureTime: string;
  readonly arrivalTime: string;
}

export const FLIGHT_ROUTES: ReadonlyArray<FlightRoute> = [
  // Asiana - Osaka KIX
  { flightNumber: "OZ111", airline: "아시아나항공", departureAirport: "ICN", departureCity: "인천", arrivalAirport: "KIX", arrivalCity: "오사카", departureTime: "08:50", arrivalTime: "10:45" },
  { flightNumber: "OZ112", airline: "아시아나항공", departureAirport: "KIX", departureCity: "오사카", arrivalAirport: "ICN", arrivalCity: "인천", departureTime: "12:00", arrivalTime: "14:00" },
  { flightNumber: "OZ113", airline: "아시아나항공", departureAirport: "ICN", departureCity: "인천", arrivalAirport: "KIX", arrivalCity: "오사카", departureTime: "13:00", arrivalTime: "14:55" },
  { flightNumber: "OZ114", airline: "아시아나항공", departureAirport: "KIX", departureCity: "오사카", arrivalAirport: "ICN", arrivalCity: "인천", departureTime: "16:00", arrivalTime: "18:00" },
  // Korean Air - Osaka KIX
  { flightNumber: "KE723", airline: "대한항공", departureAirport: "ICN", departureCity: "인천", arrivalAirport: "KIX", arrivalCity: "오사카", departureTime: "09:30", arrivalTime: "11:25" },
  { flightNumber: "KE724", airline: "대한항공", departureAirport: "KIX", departureCity: "오사카", arrivalAirport: "ICN", arrivalCity: "인천", departureTime: "12:40", arrivalTime: "14:40" },
  { flightNumber: "KE725", airline: "대한항공", departureAirport: "ICN", departureCity: "인천", arrivalAirport: "KIX", arrivalCity: "오사카", departureTime: "14:20", arrivalTime: "16:15" },
  { flightNumber: "KE726", airline: "대한항공", departureAirport: "KIX", departureCity: "오사카", arrivalAirport: "ICN", arrivalCity: "인천", departureTime: "17:30", arrivalTime: "19:30" },
  // Korean Air - Tokyo NRT
  { flightNumber: "KE701", airline: "대한항공", departureAirport: "ICN", departureCity: "인천", arrivalAirport: "NRT", arrivalCity: "도쿄", departureTime: "09:00", arrivalTime: "11:25" },
  { flightNumber: "KE702", airline: "대한항공", departureAirport: "NRT", departureCity: "도쿄", arrivalAirport: "ICN", arrivalCity: "인천", departureTime: "13:00", arrivalTime: "15:40" },
  // Asiana - Tokyo NRT
  { flightNumber: "OZ101", airline: "아시아나항공", departureAirport: "ICN", departureCity: "인천", arrivalAirport: "NRT", arrivalCity: "도쿄", departureTime: "10:00", arrivalTime: "12:25" },
  { flightNumber: "OZ102", airline: "아시아나항공", departureAirport: "NRT", departureCity: "도쿄", arrivalAirport: "ICN", arrivalCity: "인천", departureTime: "14:00", arrivalTime: "16:40" },
  // Korean Air - Fukuoka
  { flightNumber: "KE787", airline: "대한항공", departureAirport: "ICN", departureCity: "인천", arrivalAirport: "FUK", arrivalCity: "후쿠오카", departureTime: "08:40", arrivalTime: "10:10" },
  { flightNumber: "KE788", airline: "대한항공", departureAirport: "FUK", departureCity: "후쿠오카", arrivalAirport: "ICN", arrivalCity: "인천", departureTime: "11:20", arrivalTime: "12:50" },
  // Asiana - Fukuoka
  { flightNumber: "OZ131", airline: "아시아나항공", departureAirport: "ICN", departureCity: "인천", arrivalAirport: "FUK", arrivalCity: "후쿠오카", departureTime: "09:10", arrivalTime: "10:40" },
  { flightNumber: "OZ132", airline: "아시아나항공", departureAirport: "FUK", departureCity: "후쿠오카", arrivalAirport: "ICN", arrivalCity: "인천", departureTime: "11:50", arrivalTime: "13:20" },
  // Jeju Air - Osaka
  { flightNumber: "7C1302", airline: "제주항공", departureAirport: "ICN", departureCity: "인천", arrivalAirport: "KIX", arrivalCity: "오사카", departureTime: "07:30", arrivalTime: "09:25" },
  { flightNumber: "7C1301", airline: "제주항공", departureAirport: "KIX", departureCity: "오사카", arrivalAirport: "ICN", arrivalCity: "인천", departureTime: "10:15", arrivalTime: "12:15" },
  // Jin Air - Osaka
  { flightNumber: "LJ201", airline: "진에어", departureAirport: "ICN", departureCity: "인천", arrivalAirport: "KIX", arrivalCity: "오사카", departureTime: "08:00", arrivalTime: "09:55" },
  { flightNumber: "LJ202", airline: "진에어", departureAirport: "KIX", departureCity: "오사카", arrivalAirport: "ICN", arrivalCity: "인천", departureTime: "10:55", arrivalTime: "12:55" },
  // T'way - Osaka
  { flightNumber: "TW271", airline: "티웨이항공", departureAirport: "ICN", departureCity: "인천", arrivalAirport: "KIX", arrivalCity: "오사카", departureTime: "09:20", arrivalTime: "11:15" },
  { flightNumber: "TW272", airline: "티웨이항공", departureAirport: "KIX", departureCity: "오사카", arrivalAirport: "ICN", arrivalCity: "인천", departureTime: "12:15", arrivalTime: "14:15" },
  // Air Busan - Osaka
  { flightNumber: "BX141", airline: "에어부산", departureAirport: "PUS", departureCity: "부산", arrivalAirport: "KIX", arrivalCity: "오사카", departureTime: "09:00", arrivalTime: "10:30" },
  { flightNumber: "BX142", airline: "에어부산", departureAirport: "KIX", departureCity: "오사카", arrivalAirport: "PUS", arrivalCity: "부산", departureTime: "11:30", arrivalTime: "13:00" },
  // Peach - Osaka
  { flightNumber: "MM12", airline: "피치항공", departureAirport: "ICN", departureCity: "인천", arrivalAirport: "KIX", arrivalCity: "오사카", departureTime: "11:30", arrivalTime: "13:25" },
  { flightNumber: "MM11", airline: "피치항공", departureAirport: "KIX", departureCity: "오사카", arrivalAirport: "ICN", arrivalCity: "인천", departureTime: "08:15", arrivalTime: "10:15" },
  // Eastar Jet - Osaka
  { flightNumber: "ZE611", airline: "이스타항공", departureAirport: "ICN", departureCity: "인천", arrivalAirport: "KIX", arrivalCity: "오사카", departureTime: "08:20", arrivalTime: "10:15" },
  { flightNumber: "ZE612", airline: "이스타항공", departureAirport: "KIX", departureCity: "오사카", arrivalAirport: "ICN", arrivalCity: "인천", departureTime: "11:15", arrivalTime: "13:15" },
  // Eastar Jet - Fukuoka
  { flightNumber: "ZE631", airline: "이스타항공", departureAirport: "ICN", departureCity: "인천", arrivalAirport: "FUK", arrivalCity: "후쿠오카", departureTime: "09:30", arrivalTime: "11:00" },
  { flightNumber: "ZE632", airline: "이스타항공", departureAirport: "FUK", departureCity: "후쿠오카", arrivalAirport: "ICN", arrivalCity: "인천", departureTime: "12:00", arrivalTime: "13:30" },
  // Eastar Jet - Tokyo NRT
  { flightNumber: "ZE601", airline: "이스타항공", departureAirport: "ICN", departureCity: "인천", arrivalAirport: "NRT", arrivalCity: "도쿄", departureTime: "10:10", arrivalTime: "12:35" },
  { flightNumber: "ZE602", airline: "이스타항공", departureAirport: "NRT", departureCity: "도쿄", arrivalAirport: "ICN", arrivalCity: "인천", departureTime: "13:40", arrivalTime: "16:20" },
  // Fly Gangwon (플라이강원/피라타) - Osaka
  { flightNumber: "4V801", airline: "플라이강원", departureAirport: "ICN", departureCity: "인천", arrivalAirport: "KIX", arrivalCity: "오사카", departureTime: "07:50", arrivalTime: "09:45" },
  { flightNumber: "4V802", airline: "플라이강원", departureAirport: "KIX", departureCity: "오사카", arrivalAirport: "ICN", arrivalCity: "인천", departureTime: "10:45", arrivalTime: "12:45" },
  // Fly Gangwon - Fukuoka
  { flightNumber: "4V811", airline: "플라이강원", departureAirport: "ICN", departureCity: "인천", arrivalAirport: "FUK", arrivalCity: "후쿠오카", departureTime: "08:30", arrivalTime: "10:00" },
  { flightNumber: "4V812", airline: "플라이강원", departureAirport: "FUK", departureCity: "후쿠오카", arrivalAirport: "ICN", arrivalCity: "인천", departureTime: "11:00", arrivalTime: "12:30" },
  // Korean Air - Sapporo
  { flightNumber: "KE765", airline: "대한항공", departureAirport: "ICN", departureCity: "인천", arrivalAirport: "CTS", arrivalCity: "삿포로", departureTime: "10:00", arrivalTime: "12:50" },
  { flightNumber: "KE766", airline: "대한항공", departureAirport: "CTS", departureCity: "삿포로", arrivalAirport: "ICN", arrivalCity: "인천", departureTime: "14:00", arrivalTime: "17:10" },
  // Korean Air - Nagoya
  { flightNumber: "KE741", airline: "대한항공", departureAirport: "ICN", departureCity: "인천", arrivalAirport: "NGO", arrivalCity: "나고야", departureTime: "09:15", arrivalTime: "11:15" },
  { flightNumber: "KE742", airline: "대한항공", departureAirport: "NGO", departureCity: "나고야", arrivalAirport: "ICN", arrivalCity: "인천", departureTime: "12:30", arrivalTime: "14:30" },
  // Korean Air - Okinawa
  { flightNumber: "KE733", airline: "대한항공", departureAirport: "ICN", departureCity: "인천", arrivalAirport: "OKA", arrivalCity: "오키나와", departureTime: "10:10", arrivalTime: "12:30" },
  { flightNumber: "KE734", airline: "대한항공", departureAirport: "OKA", departureCity: "오키나와", arrivalAirport: "ICN", arrivalCity: "인천", departureTime: "13:40", arrivalTime: "15:50" },
];

export function searchFlights(query: string): ReadonlyArray<FlightRoute> {
  const q = query.toUpperCase().replace(/\s+/g, "");
  if (!q) return [];
  return FLIGHT_ROUTES.filter(
    (f) =>
      f.flightNumber.toUpperCase().includes(q) ||
      f.airline.includes(query) ||
      f.departureAirport.includes(q) ||
      f.arrivalAirport.includes(q),
  );
}
