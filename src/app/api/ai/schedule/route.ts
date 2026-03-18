import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { ScheduleItem } from "@/types/schedule";
import { generateId } from "@/lib/utils/date";

interface AIScheduleRequest {
  readonly destinations: string[];
  readonly startDate: string;
  readonly endDate: string;
  readonly theme?: string;
  readonly preferences?: string;
}

const SYSTEM_PROMPT = `당신은 여행 일정 전문가입니다. 사용자의 여행 정보를 바탕으로 최적의 일정을 JSON 배열로 생성합니다.

각 일정 항목은 다음 형식입니다:
{
  "date": "YYYY-MM-DD",
  "startTime": "HH:MM",
  "endTime": "HH:MM",
  "title": "한국어 제목",
  "titleJa": "일본어 제목",
  "location": "한국어 장소명",
  "locationJa": "일본어 장소명",
  "category": "sightseeing|food|shopping|transport|accommodation|other",
  "transport": "이동수단 (선택)",
  "transportDuration": "소요시간 (선택)",
  "memo": "팁이나 메모 (선택)"
}

규칙:
- 하루 일정은 09:00~21:00 사이로 구성
- 식사 시간 포함 (아침/점심/저녁)
- 이동시간 고려하여 현실적인 일정 구성
- 유명 관광지, 맛집, 쇼핑 장소 포함
- 각 장소의 일본어 이름을 정확히 작성
- JSON 배열만 반환 (다른 텍스트 없이)`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY가 설정되지 않았습니다", items: [] },
        { status: 500 },
      );
    }

    const body = (await request.json()) as AIScheduleRequest;
    if (!body.destinations?.length || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { error: "여행지, 출발일, 귀국일을 입력해주세요", items: [] },
        { status: 400 },
      );
    }

    const openai = new OpenAI({ apiKey });

    const userPrompt = `여행 정보:
- 여행지: ${body.destinations.join(", ")}
- 기간: ${body.startDate} ~ ${body.endDate}
${body.theme ? `- 테마: ${body.theme}` : ""}
${body.preferences ? `- 요청사항: ${body.preferences}` : ""}

위 정보로 상세 여행 일정을 JSON 배열로 생성해주세요.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content ?? "[]";

    // Extract JSON array from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AI 응답을 파싱할 수 없습니다", items: [] },
        { status: 500 },
      );
    }

    const rawItems = JSON.parse(jsonMatch[0]) as Record<string, unknown>[];
    const now = new Date().toISOString();

    const items: ScheduleItem[] = rawItems.map((raw) => ({
      id: generateId(),
      date: String(raw.date ?? ""),
      startTime: String(raw.startTime ?? ""),
      endTime: String(raw.endTime ?? ""),
      title: String(raw.title ?? ""),
      titleJa: raw.titleJa ? String(raw.titleJa) : undefined,
      location: raw.location ? String(raw.location) : undefined,
      locationJa: raw.locationJa ? String(raw.locationJa) : undefined,
      category: (raw.category as ScheduleItem["category"]) ?? "other",
      transport: raw.transport ? String(raw.transport) : undefined,
      transportDuration: raw.transportDuration
        ? String(raw.transportDuration)
        : undefined,
      memo: raw.memo ? String(raw.memo) : undefined,
      createdAt: now,
      updatedAt: now,
    }));

    return NextResponse.json({ items, status: "OK" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: message, items: [] },
      { status: 500 },
    );
  }
}
