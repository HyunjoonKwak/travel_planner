import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

interface AIJournalRequest {
  readonly content: string;
  readonly location?: string;
  readonly mood?: string;
  readonly expenses?: string;
}

const SYSTEM_PROMPT =
  "당신은 여행 일기 작가입니다. 사용자가 작성한 여행 일기를 문장을 더 생생하고 감성적으로 다듬어 주세요. 원래 내용과 의미를 유지하되, 표현을 풍부하게 해주세요. 장소, 기분, 지출 정보가 제공되면 자연스럽게 녹여주세요.";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY가 설정되지 않았습니다" },
        { status: 500 },
      );
    }

    const body = (await request.json()) as AIJournalRequest;
    if (!body.content?.trim()) {
      return NextResponse.json(
        { error: "내용을 입력해주세요" },
        { status: 400 },
      );
    }

    const openai = new OpenAI({ apiKey });

    const contextLines: string[] = [];
    if (body.location) contextLines.push(`장소: ${body.location}`);
    if (body.mood) contextLines.push(`기분: ${body.mood}`);
    if (body.expenses) contextLines.push(`오늘의 지출: ${body.expenses}`);

    const userPrompt =
      contextLines.length > 0
        ? `${contextLines.join("\n")}\n\n일기 내용:\n${body.content}`
        : body.content;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const polished = completion.choices[0]?.message?.content ?? body.content;

    return NextResponse.json({ polished });
  } catch (err) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
