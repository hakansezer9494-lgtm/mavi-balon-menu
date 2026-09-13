"use client";

import { tableDisplayName } from "@/lib/table-qr";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Ban,
  Check,
  Clock3,
  RotateCcw,
  Send,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getStoredAdminPassword } from "@/hooks/use-menu";
import { formatPrice } from "@/lib/menu";
import type { Order } from "@/lib/orders";
import { cn } from "@/lib/utils";

export type OrdersTheme = "light" | "dark";

function statusLabel(status: Order["status"]) {
  if (status === "paid") return "Ödendi";
  if (status === "sent") return "Gönderildi";
  if (status === "cancelled") return "İptal";
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
  theme,
}: {
  order: Order;
  active: boolean;
  onSelect: () => void;
  tone: "active" | "past";
  theme: OrdersTheme;
  }) {
  const light = theme === "light";
  const isNew = order.status === "new";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative overflow-hidden rounded-3xl p-4 text-left transition-all duration-300",
        light
          ? "bg-white ring-1 ring-slate-200/90 shadow-sm hover:-translate-y-0.5 hover:shadow-md"
          : "bg-gradient-to-br from-white/[0.09] to-white/[0.03] ring-1 ring-white/10 hover:-translate-y-0.5 hover:from-white/[0.14]",
        active &&
          (light
            ? cn(
                "z-[1] scale-[1.02] shadow-[0_18px_40px_rgba(14,165,233,0.22)]",
                "ring-2 ring-sky-500 bg-sky-50",
                tone === "past" &&
                  "ring-emerald-500 bg-emerald-50 shadow-[0_18px_40px_rgba(16,185,129,0.2)]"
              )
            : cn(
                "z-[1] scale-[1.02]",
                tone === "active"
                  ? "from-sky-400/35 to-sky-500/10 ring-2 ring-sky-300 shadow-[0_16px_44px_rgba(56,189,248,0.35)]"
                  : "from-emerald-400/35 to-emerald-500/10 ring-2 ring-emerald-300 shadow-[0_16px_44px_rgba(52,211,153,0.3)]"
              )),
        isNew &&
          tone === "active" &&
          !active &&
          "animate-[pulse_2.8s_ease-in-out_infinite]"
      )}
    >
      {active ? (
        <span
          className={cn(
            "absolute inset-y-3 left-0 w-1.5 rounded-full",
            tone === "past"
              ? light
                ? "bg-emerald-500"
                : "bg-emerald-300"
              : light
                ? "bg-sky-500"
                : "bg-sky-300"
          )}
        />
      ) : null}
      <div className="relative flex items-start justify-between gap-3 pl-1">
        <div>
          <p
            className={cn(
              "font-heading text-lg tracking-tight",
              light ? "text-slate-900" : "text-white",
              active && (light ? "text-sky-950" : "text-white")
            )}
          >
            {order.customerName ? `${tableDisplayName(order.tableNumber)} · ${order.customerName}` : tableDisplayName(order.tableNumber)}
          </p>
          <p
            className={cn(
              "mt-1 flex items-center gap-1.5 text-[11px]",
              light ? "text-slate-500" : "text-sky-100/55"
            )}
          >
            <Clock3 className="size-3 opacity-70" />
            {timeLabel(order.updatedAt || order.createdAt)}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase",
            order.status === "new" &&
              (light
                ? "bg-amber-100 text-amber-800 ring-1 ring-amber-200"
                : "bg-amber-300/20 text-amber-100 ring-1 ring-amber-200/30"),
            order.status === "sent" &&
              (light
                ? "bg-sky-100 text-sky-800 ring-1 ring-sky-200"
                : "bg-sky-300/20 text-sky-100 ring-1 ring-sky-200/30"),
            order.status === "paid" &&
              (light
                ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
                : "bg-emerald-300/20 text-emerald-100 ring-1 ring-emerald-200/30")
          )}
        >
          {statusLabel(order.status)}
        </span>
      </div>
      <p
        className={cn(
          "relative mt-3 line-clamp-2 text-sm leading-relaxed",
          light ? "text-slate-600" : "text-sky-50/75"
        )}
      >
        {order.items
          .map((item) => `${item.quantity}× ${item.name}`)
          .join(" · ")}
      </p>
      <div className="relative mt-4 flex items-end justify-between gap-2">
        <p
          className={cn(
            "text-[11px]",
            light ? "text-slate-400" : "text-sky-100/45"
          )}
        >
          {order.items.reduce((sum, item) => sum + item.quantity, 0)} kalem
        </p>
        <p
          className={cn(
            "text-base font-bold tabular-nums",
            tone === "past"
              ? light
                ? "text-emerald-700"
                : "text-emerald-200"
              : light
                ? "text-sky-700"
                : "text-sky-200"
          )}
        >
          {formatPrice(order.total)}
        </p>
      </div>
      {active ? (
        <p
          className={cn(
            "relative mt-3 text-[11px] font-semibold tracking-wide uppercase",
            tone === "past"
              ? light
                ? "text-emerald-600"
                : "text-emerald-200"
              : light
                ? "text-sky-600"
                : "text-sky-200"
          )}
        >
          Seçili masa
        </p>
      ) : null}
    </button>
  );
}

function OrderDetail({
  order,
  mode,
  busy,
  theme,
  onSent,
  onPaid,
  onRestore,
  onCancel,
}: {
  order: Order;
  mode: "active" | "past";
  busy: boolean;
  theme: OrdersTheme;
  onSent: () => void;
  onPaid: () => void;
  onRestore: () => void;
  onCancel: () => void;
}) {
  const light = theme === "light";
  const [cancelOpen, setCancelOpen] = useState(false);
  const canMarkPaid = order.status === "sent";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] p-5 ring-2",
        light
          ? mode === "active"
            ? "bg-white ring-sky-400 shadow-[0_20px_50px_rgba(14,165,233,0.18)]"
            : "bg-white ring-emerald-400 shadow-[0_20px_50px_rgba(16,185,129,0.16)]"
          : mode === "active"
            ? "bg-[linear-gradient(160deg,rgba(14,165,233,0.22),rgba(2,8,23,0.7))] ring-sky-300/60"
            : "bg-[linear-gradient(160deg,rgba(16,185,129,0.22),rgba(2,8,23,0.7))] ring-emerald-300/60"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px",
          light
            ? "bg-gradient-to-r from-transparent via-slate-300 to-transparent"
            : "bg-gradient-to-r from-transparent via-white/40 to-transparent"
        )}
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p
            className={cn(
              "font-heading text-2xl",
              light ? "text-slate-900" : "text-white"
            )}
          >
            {order.customerName ? `${tableDisplayName(order.tableNumber)} · ${order.customerName}` : tableDisplayName(order.tableNumber)}
          </p>
          <p
            className={cn(
              "mt-1 text-xs",
              light ? "text-slate-500" : "text-sky-100/55"
            )}
          >
            {timeLabel(order.createdAt)} · {statusLabel(order.status)}
          </p>
        </div>
        <p
          className={cn(
            "font-heading text-2xl tabular-nums",
            mode === "past"
              ? light
                ? "text-emerald-700"
                : "text-emerald-200"
              : light
                ? "text-sky-700"
                : "text-sky-200"
          )}
        >
          {formatPrice(order.total)}
        </p>
      </div>

      <ul className="mt-5 space-y-2.5">
        {order.items.map((item) => (
          <li
            key={`${order.id}-${item.productId}-${item.note ?? ""}-${mode}`}
            className={cn(
              "flex items-start justify-between gap-3 rounded-2xl px-3.5 py-3 ring-1",
              light
                ? "bg-slate-50 ring-slate-200"
                : "bg-black/20 ring-white/5"
            )}
          >
            <span
              className={cn("text-sm", light ? "text-slate-700" : "text-sky-50")}
            >
              <span
                className={cn(
                  "font-semibold",
                  light ? "text-slate-900" : "text-white"
                )}
              >
                {item.quantity}×
              </span>{" "}
              {item.name}
              {item.note?.trim() ? (
                <span
                  className={cn(
                    "mt-1 block text-xs",
                    light ? "text-slate-500" : "text-sky-200/70"
                  )}
                >
                  Not: {item.note}
                </span>
              ) : null}
            </span>
            <span
              className={cn(
                "shrink-0 text-sm tabular-nums",
                light ? "text-slate-600" : "text-sky-100/80"
              )}
            >
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
              className={
                light
                  ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
                  : "border-rose-300/40 bg-rose-500/15 text-rose-100 hover:bg-rose-500/25"
              }
              disabled={busy}
              onClick={() => setCancelOpen(true)}
            >
              <Ban className="size-4" />
              İptal
            </Button>
            <Button
              type="button"
              className={
                order.status === "sent"
                  ? "bg-amber-600/70 text-white hover:bg-amber-600/70"
                  : "bg-amber-500 text-white hover:bg-amber-400"
              }
              disabled={busy || order.status === "sent"}
              onClick={onSent}
            >
              <Send className="size-4" />
              Gönderildi
            </Button>
            <Button
              type="button"
              className="ml-auto bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-45"
              disabled={busy || !canMarkPaid}
              title={
                canMarkPaid
                  ? undefined
                  : "Önce Gönderildi’ye basmalısınız."
              }
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
            className={
              light
                ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                : "border-white/25 bg-white/10 text-white hover:bg-white/20"
            }
            disabled={busy}
            onClick={onRestore}
          >
            <RotateCcw className="size-4" />
            Geri al
          </Button>
        )}
      </div>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent
          className={
            light
              ? "bg-white text-slate-900 sm:max-w-md"
              : "bg-[oklch(0.2_0.04_250)] text-white sm:max-w-md"
          }
        >
          <DialogHeader>
            <DialogTitle className={light ? "text-slate-900" : "text-white"}>
              Siparişi iptal et
            </DialogTitle>
            <DialogDescription
              className={light ? "text-slate-600" : "text-sky-100/60"}
            >
              Siparişi iptal etmek istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className={
                light
                  ? "border-slate-300 bg-white text-slate-800"
                  : "border-white/25 bg-white/10 text-white"
              }
              onClick={() => setCancelOpen(false)}
            >
              Hayır
            </Button>
            <Button
              type="button"
              className="bg-rose-600 text-white hover:bg-rose-500"
              disabled={busy}
              onClick={() => {
                setCancelOpen(false);
                onCancel();
              }}
            >
              Evet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AdminOrdersPanel({
  mode = "active",
  theme = "light",
}: {
  mode?: "active" | "past";
  theme?: OrdersTheme;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const knownVersionsRef = useRef<Map<string, string> | null>(null);
  const light = theme === "light";

  const activeOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.status !== "paid" && order.status !== "cancelled"
      ),
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
      if (status === "cancelled") {
        setOrders((current) => current.filter((order) => order.id !== id));
        setSelectedId((current) => (current === id ? null : current));
      } else {
        setOrders((current) =>
          current.map((order) => (order.id === id ? data.order! : order))
        );
        if (knownVersionsRef.current && data.order) {
          knownVersionsRef.current.set(data.order.id, data.order.updatedAt);
        }
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
        "relative overflow-hidden rounded-[2rem] p-5 sm:p-6 ring-1",
        light
          ? showActive
            ? "bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.45),transparent_36%),linear-gradient(165deg,#f8fafc_0%,#eef6ff_55%,#f8fafc_100%)] ring-sky-200/80"
            : "bg-[radial-gradient(circle_at_top_left,rgba(167,243,208,0.4),transparent_36%),linear-gradient(165deg,#f8fafc_0%,#eefbf5_55%,#f8fafc_100%)] ring-emerald-200/80"
          : showActive
            ? "bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_34%),linear-gradient(165deg,#0b1c33_0%,#07101d_55%,#0a1628_100%)] ring-white/10"
            : "bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.2),transparent_34%),linear-gradient(165deg,#0b2430_0%,#07141c_55%,#0a1c22_100%)] ring-white/10"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-8 top-0 h-px",
          light
            ? "bg-gradient-to-r from-transparent via-slate-300 to-transparent"
            : "bg-gradient-to-r from-transparent via-white/35 to-transparent"
        )}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium tracking-wide ring-1",
              light
                ? "bg-white/80 text-slate-600 ring-slate-200"
                : "bg-white/5 text-sky-100/70 ring-white/10"
            )}
          >
            {showActive ? (
              <Sparkles
                className={cn(
                  "size-3.5",
                  light ? "text-sky-600" : "text-sky-300"
                )}
              />
            ) : (
              <UtensilsCrossed
                className={cn(
                  "size-3.5",
                  light ? "text-emerald-600" : "text-emerald-300"
                )}
              />
            )}
            {showActive ? "Canlı mutfak" : "Kapanmış hesaplar"}
          </div>
          <h3
            className={cn(
              "font-heading mt-3 text-2xl sm:text-3xl",
              light ? "text-slate-900" : "text-white"
            )}
          >
            {showActive ? "Aktif siparişler" : "Geçmiş siparişler"}
          </h3>
          <p
            className={cn(
              "mt-1.5 max-w-xl text-sm leading-relaxed",
              light ? "text-slate-600" : "text-sky-100/60"
            )}
          >
            {showActive
              ? "Masa ödenene kadar aynı oturumda kalır. İptal edilenler listeden düşer."
              : "Ödenen siparişler burada. Geri al ile aktife çekebilir, iptal ile silebilirsin."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div
            className={cn(
              "rounded-2xl px-4 py-3 ring-1",
              light
                ? "bg-white/90 ring-slate-200"
                : "bg-white/5 ring-white/10"
            )}
          >
            <p
              className={cn(
                "text-[11px]",
                light ? "text-slate-500" : "text-sky-100/55"
              )}
            >
              Toplam
            </p>
            <p
              className={cn(
                "text-lg font-semibold",
                light ? "text-slate-900" : "text-white"
              )}
            >
              {list.length}
            </p>
          </div>
          {showActive ? (
            <div
              className={cn(
                "rounded-2xl px-4 py-3 ring-1",
                light
                  ? "bg-amber-50 ring-amber-200"
                  : "bg-amber-300/10 ring-amber-200/20"
              )}
            >
              <p
                className={cn(
                  "text-[11px]",
                  light ? "text-amber-700" : "text-amber-100/70"
                )}
              >
                Yeni
              </p>
              <p
                className={cn(
                  "text-lg font-semibold",
                  light ? "text-amber-900" : "text-amber-100"
                )}
              >
                {newCount}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {error ? (
          <p className={cn("text-sm", light ? "text-red-600" : "text-red-300")}>
            {error}
          </p>
        ) : null}
        {loading ? (
          <p
            className={cn(
              "rounded-2xl px-4 py-10 text-center text-sm",
              light
                ? "bg-white/70 text-slate-500"
                : "bg-white/5 text-sky-100/60"
            )}
          >
            Siparişler yükleniyor…
          </p>
        ) : list.length === 0 ? (
          <div
            className={cn(
              "rounded-[1.5rem] border border-dashed px-4 py-14 text-center",
              light
                ? "border-slate-300 bg-white/60"
                : "border-white/15 bg-white/[0.03]"
            )}
          >
            <p
              className={cn(
                "font-heading text-lg",
                light ? "text-slate-800" : "text-white/90"
              )}
            >
              {showActive ? "Şu an açık sipariş yok" : "Geçmiş henüz boş"}
            </p>
            <p
              className={cn(
                "mx-auto mt-2 max-w-sm text-sm",
                light ? "text-slate-500" : "text-sky-100/50"
              )}
            >
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
                  theme={theme}
                  active={selectedId === order.id}
                  onSelect={() =>
                    setSelectedId(selectedId === order.id ? null : order.id)
                  }
                />
              ))}
            </div>
            <div className="lg:sticky lg:top-4 lg:self-start">
              {selected &&
              ((showActive &&
                selected.status !== "paid" &&
                selected.status !== "cancelled") ||
                (!showActive && selected.status === "paid")) ? (
                <OrderDetail
                  order={selected}
                  mode={showActive ? "active" : "past"}
                  theme={theme}
                  busy={busyId === selected.id}
                  onSent={() => void patchStatus(selected.id, "sent")}
                  onPaid={() => void patchStatus(selected.id, "paid")}
                  onRestore={() => void patchStatus(selected.id, "new")}
                  onCancel={() => void patchStatus(selected.id, "cancelled")}
                />
              ) : (
                <div
                  className={cn(
                    "rounded-[1.75rem] px-5 py-12 text-center ring-1",
                    light
                      ? "bg-white/70 ring-slate-200"
                      : "bg-white/[0.03] ring-white/10"
                  )}
                >
                  <p
                    className={cn(
                      "text-sm",
                      light ? "text-slate-500" : "text-sky-100/55"
                    )}
                  >
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
