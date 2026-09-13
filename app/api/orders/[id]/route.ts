import { NextResponse } from "next/server";
import { adminPasswordConfigured, isAdminAuthorized } from "@/lib/admin-auth";
import { confirmOrder, updateOrderStatus } from "@/lib/order-store";
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

  const confirm =
    body && typeof body === "object"
      ? Boolean((body as { confirm?: unknown }).confirm)
      : false;

  if (confirm) {
    try {
      const order = await confirmOrder(id);
      if (!order) {
        return NextResponse.json(
          { error: "Sipariş bulunamadı." },
          { status: 404 }
        );
      }
      return NextResponse.json({ order });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Sipariş onaylanamadı.";
      return NextResponse.json({ error: message, detail: message }, { status: 400 });
    }
  }

  const status =
    body && typeof body === "object"
      ? (body as { status?: unknown }).status
      : undefined;

  if (
    status !== "sent" &&
    status !== "paid" &&
    status !== "new" &&
    status !== "cancelled"
  ) {
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
    const message =
      error instanceof Error ? error.message : "Sipariş güncellenemedi.";
    const isRule =
      message.includes("Gönderildi") || message.includes("onaylayın");
    return NextResponse.json(
      {
        error: message,
        detail: message,
      },
      { status: isRule ? 400 : 500 }
    );
  }
}
