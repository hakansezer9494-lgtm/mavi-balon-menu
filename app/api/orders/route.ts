import { NextResponse } from "next/server";
import { adminPasswordConfigured, isAdminAuthorized } from "@/lib/admin-auth";
import { createOrder, listOrders } from "@/lib/order-store";
import { isOrderItem, type OrderItem } from "@/lib/orders";
import {
  isTakeawayTable,
  isValidCustomerName,
  sanitizeCustomerName,
} from "@/lib/table-qr";

export const dynamic = "force-dynamic";

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

  try {
    const orders = await listOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Siparişler okunamadı.",
        detail: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }

  const payload = body as {
    tableNumber?: unknown;
    customerName?: unknown;
    items?: unknown;
  };

  const tableNumber = String(payload.tableNumber ?? "").trim();
  if (!tableNumber) {
    return NextResponse.json(
      { error: "Masa seçmeden sipariş verilemez." },
      { status: 400 }
    );
  }

  const customerName = sanitizeCustomerName(
    typeof payload.customerName === "string" ? payload.customerName : ""
  );
  if (isTakeawayTable(tableNumber) && !isValidCustomerName(customerName)) {
    return NextResponse.json(
      { error: "Ayakta/Paket için ad ve soyad gerekli." },
      { status: 400 }
    );
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return NextResponse.json({ error: "Sepet boş." }, { status: 400 });
  }

  const items: OrderItem[] = [];
  for (const row of payload.items) {
    if (!isOrderItem(row)) {
      return NextResponse.json(
        { error: "Sipariş kalemi hatalı." },
        { status: 400 }
      );
    }
    items.push({
      productId: row.productId,
      name: row.name.trim(),
      unitPrice: row.unitPrice,
      quantity: Math.max(1, Math.floor(row.quantity)),
      note: row.note?.trim() || undefined,
    });
  }

  try {
    const order = await createOrder({
      tableNumber,
      customerName: customerName || undefined,
      items,
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Sipariş kaydedilemedi.",
        detail: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 }
    );
  }
}
