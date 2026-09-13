import { NextResponse } from "next/server";
import { adminPasswordConfigured, isAdminAuthorized } from "@/lib/admin-auth";
import {
  buildOrdersReport,
  resolveReportWindow,
  type ReportRange,
} from "@/lib/order-reports";
import { listPaidOrdersInRange } from "@/lib/order-store";

export const dynamic = "force-dynamic";

function parseRange(value: string | null): ReportRange {
  if (value === "day" || value === "month" || value === "year") return value;
  return "month";
}

export async function GET(request: Request) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json(
      {
        error: (await adminPasswordConfigured())
          ? "Yönetim şifresi gerekli."
          : "Canlı ortamda ADMIN_PASSWORD tanımlayın.",
      },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const range = parseRange(url.searchParams.get("range"));
  const anchor = url.searchParams.get("anchor") ?? undefined;

  try {
    const window = resolveReportWindow(range, anchor);
    const orders = await listPaidOrdersInRange(window.from, window.to);
    const report = buildOrdersReport(orders, range, window);
    return NextResponse.json({ report });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Rapor oluşturulamadı.",
        detail: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 }
    );
  }
}
