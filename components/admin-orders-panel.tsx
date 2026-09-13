"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Clock3,
  RotateCcw,
  Send,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStoredAdminPassword } from "@/hooks/use-menu";
import { formatPrice } from "@/lib/menu";
import type { Order } from "@/lib/orders";
import { cn } from "@/lib/utils";

function statusLabel(status: Order["status"]) {
  if (status === "paid") return "Ödendi";
  if (status === "sent") return "Gönderildi";
  return "Yeni";
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function OrderCard({
  order,
  active,
  onSelect,
  tone,
}: {
  order: Order;
  active: boolean;
  onSelect: () => void;
  tone: "active" | "past";
}) {
  const isNew = order.status === "new";
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative overflow-hidden rounded-3xl p-4 text-left transition duration-300",
        "bg-gradient-to-br from-white/[0.09] to-white/[0.03] ring-1 ring-white/10",
        "hover:-translate-y-0.5 hover:from-white/[0.14] hover:to-white/[0.05] hover:ring-white/20",
        active &&
          (tone === "active"
            ? "from-sky-400/20 to-sky-500/5 ring-sky-300/50 shadow-[0_12px_40px_rgba(56,189,248,0.18)]"
            : "from-emerald-400/20 to-emerald-500/5 ring-emerald-300/45 shadow-[0_12px_40px_rgba(52,211,153,0.16)]"),
        isNew && tone === "active" && "animate-[pulse_2.8s_ease-in-out_infinite]"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 size-28 rounded-full blur-2xl",
          tone === "active" ? "bg-sky-400/15" : "bg-emerald-400/15"
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="font-heading text-lg tracking-tight text-white">
            Masa {order.tableNumber}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-sky-100/55">
            <Clock3 className="size-3 opacity-70" />
            {timeLabel(order.updatedAt || order.createdAt)}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase",
            order.status === "new" &&
              "bg-amber-300/20 text-amber-100 ring-1 ring-amber-200/30",
            order.status === "sent" &&
              "bg-sky-300/20 text-sky-100 ring-1 ring-sky-200/30",
            order.status === "paid" &&
              "bg-emerald-300/20 text-emerald-100 ring-1 ring-emerald-200/30"
          )}
        >
          {statusLabel(order.status)}
        </span>
      </div>
      <p className="relative mt-3 line-clamp-2 text-sm leading-relaxed text-sky-50/75">
        {order.items
          .map((item) => `${item.quantity}× ${item.name}`)
          .join(" · ")}
      </p>
      <div className="relative mt-4 flex items-end justify-between gap-2">
        <p className="text-[11px] text-sky-100/45">
          {order.items.reduce((sum, item) => sum + item.quantity, 0)} kalem
        </p>
        <p
          className={cn(
            "text-base font-bold tabular-nums",
            tone === "past" ? "text-emerald-200" : "text-sky-200"
          )}
        >
          {formatPrice(order.total)}
        </p>
      </div>
    </button>
  );
}

function OrderDetail({
  order,
  mode,
  busy,
  onSent,
  onPaid,
  onRestore,
}: {
  order: Order;
  mode: "active" | "past";
  busy: boolean;
  onSent: () => void;
  onPaid: () => void;
  onRestore: () => void;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] p-5 ring-1",
        mode === "active"
          ? "bg-[linear-gradient(160deg,rgba(14,165,233,0.16),rgba(2,8,23,0.55))] ring-sky-300/25"
          : "bg-[linear-gradient(160deg,rgba(16,185,129,0.16),rgba(2,8,23,0.55))] ring-emerald-300/25"
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-heading text-2xl text-white">
            Masa {order.tableNumber}
          </p>
          <p className="mt-1 text-xs text-sky-100/55">
            {timeLabel(order.createdAt)} · {statusLabel(order.status)}
          </p>
        </div>
        <p
          className={cn(
            "font-heading text-2xl tabular-nums",
            mode === "past" ? "text-emerald-200" : "text-sky-200"
          )}
        >
          {formatPrice(order.total)}
        </p>
      </div>

      <ul className="mt-5 space-y-2.5">
        {order.items.map((item) => (
          <li
            key={`${order.id}-${item.productId}-${item.note ?? ""}-${mode}`}
            className="flex items-start justify-between gap-3 rounded-2xl bg-black/20 px-3.5 py-3 ring-1 ring-white/5"
          >
            <span className="text-sm text-sky-50">
              <span className="font-semibold text-white">{item.quantity}×</span>{" "}
              {item.name}
              {item.note?.trim() ? (
                <span className="mt-1 block text-xs text-sky-200/70">
                  Not: {item.note}
                </span>
              ) : null}
            </span>
            <span className="shrink-0 text-sm tabular-nums text-sky-100/80">
              {formatPrice(item.unitPrice * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap gap-2">
        {mode === "active" ? (
          <>
            <Button
              type="button"
              variant="outline"
              className="border-white/25 bg-white/10 text-white hover:bg-white/20"
              disabled={busy || order.status === "sent"}
              onClick={onSent}
            >
              <Send className="size-4" />
              Gönderildi
            </Button>
            <Button
              type="button"
              className="ml-auto bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
              disabled={busy}
              onClick={onPaid}
            >
              <Check className="size-4" />
              Ödendi
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="border-white/25 bg-white/10 text-white hover:bg-white/20"
            disabled={busy}
            onClick={onRestore}
          >
            <RotateCcw className="size-4" />
            Geri al
          </Button>
        )}
      </div>
    </div>
  );
}

export function AdminOrdersPanel({
  mode = "active",
}: {
  mode?: "active" | "past";
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const knownVersionsRef = useRef<Map<string, string> | null>(null);

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status !== "paid"),
    [orders]
  );
  const pastOrders = useMemo(
    () => orders.filter((order) => order.status === "paid"),
    [orders]
  );
  const selected = orders.find((order) => order.id === selectedId) ?? null;
  const showActive = mode === "active";
  const list = showActive ? activeOrders : pastOrders;
  const newCount = activeOrders.filter((order) => order.status === "new").length;

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch("/api/orders", {
        cache: "no-store",
        headers: {
          "x-admin-password": getStoredAdminPassword(),
        },
      });
      if (!response.ok) {
        throw new Error("Siparişler alınamadı.");
      }
      const data = (await response.json()) as { orders?: Order[] };
      const next = Array.isArray(data.orders) ? data.orders : [];
      knownVersionsRef.current = new Map(
        next.map((order) => [order.id, order.updatedAt])
      );
      setOrders(next);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Siparişler alınamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOrders();
    const timer = window.setInterval(() => {
      void fetchOrders();
    }, 4000);
    return () => window.clearInterval(timer);
  }, [fetchOrders]);

  useEffect(() => {
    setSelectedId(null);
  }, [mode]);

  async function patchStatus(id: string, status: Order["status"]) {
    setBusyId(id);
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": getStoredAdminPassword(),
        },
        body: JSON.stringify({ status }),
      });
      const data = (await response.json()) as { order?: Order; error?: string };
      if (!response.ok || !data.order) {
        throw new Error(data.error || "Güncellenemedi.");
      }
      setOrders((current) =>
        current.map((order) => (order.id === id ? data.order! : order))
      );
      if (knownVersionsRef.current && data.order) {
        knownVersionsRef.current.set(data.order.id, data.order.updatedAt);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Güncellenemedi.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2rem] p-5 sm:p-6",
        "ring-1 ring-white/10",
        showActive
          ? "bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_34%),linear-gradient(165deg,#0b1c33_0%,#07101d_55%,#0a1628_100%)]"
          : "bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.2),transparent_34%),linear-gradient(165deg,#0b2430_0%,#07141c_55%,#0a1c22_100%)]"
      )}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium tracking-wide text-sky-100/70 ring-1 ring-white/10">
            {showActive ? (
              <Sparkles className="size-3.5 text-sky-300" />
            ) : (
              <UtensilsCrossed className="size-3.5 text-emerald-300" />
            )}
            {showActive ? "Canlı mutfak" : "Kapanmış hesaplar"}
          </div>
          <h3 className="font-heading mt-3 text-2xl text-white sm:text-3xl">
            {showActive ? "Aktif siparişler" : "Geçmiş siparişler"}
          </h3>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-sky-100/60">
            {showActive
              ? "Masa ödenene kadar aynı oturumda kalır. Yeni gelenler nabız gibi yanıp söner."
              : "Ödenen siparişler burada. Geri al ile tekrar aktif listeye çekebilirsin."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
            <p className="text-[11px] text-sky-100/55">Toplam</p>
            <p className="text-lg font-semibold text-white">{list.length}</p>
          </div>
          {showActive ? (
            <div className="rounded-2xl bg-amber-300/10 px-4 py-3 ring-1 ring-amber-200/20">
              <p className="text-[11px] text-amber-100/70">Yeni</p>
              <p className="text-lg font-semibold text-amber-100">{newCount}</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {loading ? (
          <p className="rounded-2xl bg-white/5 px-4 py-10 text-center text-sm text-sky-100/60">
            Siparişler yükleniyor…
          </p>
        ) : list.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-white/[0.03] px-4 py-14 text-center">
            <p className="font-heading text-lg text-white/90">
              {showActive ? "Şu an açık sipariş yok" : "Geçmiş henüz boş"}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-sky-100/50">
              {showActive
                ? "Müşteri sipariş verdiğinde burada görünecek."
                : "Ödendi dediğin siparişler bu sekmede listelenir."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {list.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  tone={showActive ? "active" : "past"}
                  active={selectedId === order.id}
                  onSelect={() =>
                    setSelectedId(selectedId === order.id ? null : order.id)
                  }
                />
              ))}
            </div>
            <div className="lg:sticky lg:top-4 lg:self-start">
              {selected &&
              ((showActive && selected.status !== "paid") ||
                (!showActive && selected.status === "paid")) ? (
                <OrderDetail
                  order={selected}
                  mode={showActive ? "active" : "past"}
                  busy={busyId === selected.id}
                  onSent={() => void patchStatus(selected.id, "sent")}
                  onPaid={() => void patchStatus(selected.id, "paid")}
                  onRestore={() => void patchStatus(selected.id, "new")}
                />
              ) : (
                <div className="rounded-[1.75rem] bg-white/[0.03] px-5 py-12 text-center ring-1 ring-white/10">
                  <p className="text-sm text-sky-100/55">
                    Detay için bir sipariş seç.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
