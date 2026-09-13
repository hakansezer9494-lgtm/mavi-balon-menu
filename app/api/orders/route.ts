import { NextResponse } from "next/server";
import { adminPasswordConfigured, isAdminAuthorized } from "@/lib/admin-auth";
import {
  clearGuestSessionCookieOptions,
  GUEST_SESSION_COOKIE,
  readGuestSessionCookie,
  STAFF_PREVIEW_COOKIE,
  verifyGuestSession,
  verifyStaffPreview,
} from "@/lib/guest-session";
import { createOrder, listOrders } from "@/lib/order-store";
import { isOrderItem, type OrderItem } from "@/lib/orders";
import {
  isTakeawayTable,
  isValidCustomerName,
  sanitizeCustomerName,
} from "@/lib/table-qr";

function readCookie(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

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

  const cookieHeader = request.headers.get("cookie");
  const guestToken = readGuestSessionCookie(cookieHeader);
  const guestSession = await verifyGuestSession(guestToken);
  const staffPreview = await verifyStaffPreview(
    readCookie(cookieHeader, STAFF_PREVIEW_COOKIE)
  );

  if (!guestSession && !staffPreview) {
    return NextResponse.json(
      {
        error:
          "Oturum yok veya süresi doldu. Sipariş için masadaki QR kodu tekrar okutun.",
        code: "guest_session_required",
      },
      { status: 401 }
    );
  }
  if (
    guestSession &&
    !staffPreview &&
    guestSession.tableNumber !== tableNumber
  ) {
    return NextResponse.json(
      {
        error:
          "QR oturumu bu masa ile uyuşmuyor. Lütfen doğru QR kodu okutun.",
        code: "guest_session_mismatch",
      },
      { status: 403 }
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
    // Personel portal siparişinde oturum açık kalsın; misafir QR oturumu kapanır.
    const endGuestSession = Boolean(guestSession) && !staffPreview;
    const response = NextResponse.json(
      { order, sessionEnded: endGuestSession, staffOrder: Boolean(staffPreview) },
      { status: 201 }
    );
    if (endGuestSession) {
      response.cookies.set(
        GUEST_SESSION_COOKIE,
        "",
        clearGuestSessionCookieOptions()
      );
    }
    return response;
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
