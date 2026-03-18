import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { expenses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ tripId: string; expenseId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { expenseId } = await params;
    await db.delete(expenses).where(eq(expenses.id, expenseId));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}
