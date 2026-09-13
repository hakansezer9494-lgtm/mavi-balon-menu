import { NextResponse } from "next/server";
import { listOccupiedTables } from "@/lib/order-store";

export const dynamic = "force-dynamic";

/** Public: tables that currently have unpaid orders. */
export async function GET() {
  try {
    const occupied = await listOccupiedTables();
    return NextResponse.json({ occupied });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Masa durumu okunamadı.",
        detail: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 }
    );
  }
}
