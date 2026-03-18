export interface ChecklistItem {
  readonly id: string;
  readonly label: string;
  readonly checked: boolean;
}

export interface ChecklistGroup {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly items: ReadonlyArray<ChecklistItem>;
}

export const DEFAULT_CHECKLIST: ReadonlyArray<ChecklistGroup> = [
  {
    id: "documents",
    title: "필수 서류",
    icon: "📄",
    items: [
      { id: "d1", label: "여권 (유효기간 확인)", checked: false },
      { id: "d2", label: "항공권 예약 확인서", checked: false },
      { id: "d3", label: "숙소 예약 확인서", checked: false },
      { id: "d4", label: "해외여행자보험", checked: false },
    ],
  },
  {
    id: "electronics",
    title: "전자기기",
    icon: "📱",
    items: [
      { id: "e1", label: "스마트폰 충전기", checked: false },
      { id: "e2", label: "보조배터리", checked: false },
      { id: "e3", label: "변환 어댑터 (Type A)", checked: false },
      { id: "e4", label: "카메라", checked: false },
      { id: "e5", label: "이어폰", checked: false },
    ],
  },
  {
    id: "apps",
    title: "앱/서비스",
    icon: "📲",
    items: [
      { id: "a1", label: "NAVITIME 설치", checked: false },
      { id: "a2", label: "PayPay 설정", checked: false },
      { id: "a3", label: "Google Maps 오프라인 다운로드", checked: false },
      { id: "a4", label: "포켓 와이파이 예약/수령", checked: false },
      { id: "a5", label: "Suica/ICOCA 앱 설정", checked: false },
    ],
  },
  {
    id: "clothing",
    title: "의류/용품",
    icon: "👕",
    items: [
      { id: "c1", label: "우산/우비 (4월 비 대비)", checked: false },
      { id: "c2", label: "가벼운 자켓 (15~20°C)", checked: false },
      { id: "c3", label: "편한 운동화", checked: false },
      { id: "c4", label: "세면도구", checked: false },
      { id: "c5", label: "상비약", checked: false },
    ],
  },
  {
    id: "money",
    title: "금융",
    icon: "💰",
    items: [
      { id: "m1", label: "엔화 환전", checked: false },
      { id: "m2", label: "해외결제 카드 확인", checked: false },
      { id: "m3", label: "해외 ATM 인출 한도 확인", checked: false },
    ],
  },
  {
    id: "emergency",
    title: "긴급 연락처",
    icon: "🚨",
    items: [
      { id: "em1", label: "주오사카 대사관: 06-6213-1401", checked: false },
      { id: "em2", label: "경찰: 110", checked: false },
      { id: "em3", label: "소방/구급: 119", checked: false },
      { id: "em4", label: "한국 영사 콜센터: +82-2-3210-0404", checked: false },
    ],
  },
];
