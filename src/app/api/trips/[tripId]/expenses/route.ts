import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { expenses } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateId } from "@/lib/utils/date";

type Params = { params: Promise<{ tripId: string }> };

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const result = await db
      .select()
      .from(expenses)
      .where(eq(expenses.tripId, tripId))
      .orderBy(desc(expenses.date), desc(expenses.createdAt));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    const body = await req.json();
    const now = new Date().toISOString();

    const newExpense = {
      id: generateId(),
      tripId,
      date: body.date as string,
      amount: body.amount as number,
      currency: body.currency as string,
      category: body.category as string,
      description: body.description as string,
      memo: (body.memo as string) ?? null,
      createdAt: now,
    };

    await db.insert(expenses).values(newExpense);
    return NextResponse.json({ success: true, data: newExpense }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
