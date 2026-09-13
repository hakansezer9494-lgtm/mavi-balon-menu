import { NextResponse } from "next/server";
import { adminPasswordConfigured, isAdminAuthorized } from "@/lib/admin-auth";
import { updateOrderStatus } from "@/lib/order-store";
import type { OrderStatus } from "@/lib/orders";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
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

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }

  const status =
    body && typeof body === "object"
      ? (body as { status?: unknown }).status
      : undefined;

  if (status !== "sent" && status !== "paid" && status !== "new") {
    return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
  }

  try {
    const order = await updateOrderStatus(id, status as OrderStatus);
    if (!order) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı." },
        { status: 404 }
      );
    }
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Sipariş güncellenemedi.",
        detail: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 }
    );
  }
}
