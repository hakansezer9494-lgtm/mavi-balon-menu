"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, Check, ChevronDown, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getStoredAdminPassword } from "@/hooks/use-menu";
import { formatPrice } from "@/lib/menu";
import type { Order } from "@/lib/orders";
import { cn } from "@/lib/utils";

function playOrderChime() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);

    const pattern: Array<{ freq: number; type: OscillatorType; at: number; dur: number; peak: number }> = [
      { freq: 660, type: "square", at: 0, dur: 0.22, peak: 0.38 },
      { freq: 880, type: "sawtooth", at: 0.12, dur: 0.28, peak: 0.42 },
      { freq: 1175, type: "square", at: 0.26, dur: 0.32, peak: 0.48 },
      { freq: 1568, type: "triangle", at: 0.4, dur: 0.4, peak: 0.36 },
    ];

    for (const tone of pattern) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = tone.type;
      osc.frequency.value = tone.freq;
      const start = now + tone.at;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(tone.peak, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.dur);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + tone.dur + 0.02);
    }
  } catch {
    // ignore audio failures
  }
}

function statusLabel(status: Order["status"]) {
  if (status === "paid") return "Ödendi";
  if (status === "sent") return "Gönderildi";
  return "Yeni";
}

function OrderCard({
  order,
  active,
  onSelect,
}: {
  order: Order;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-2xl bg-white/5 p-3 text-left ring-1 ring-white/10 transition hover:bg-white/10",
        active && "bg-white/10 ring-sky-300/50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-white">
            Masa {order.tableNumber}
          </p>
          <p className="text-[11px] text-sky-100/55">
            {new Date(order.createdAt).toLocaleString("tr-TR")}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
            order.status === "new" && "bg-amber-400/20 text-amber-200",
            order.status === "sent" && "bg-sky-400/20 text-sky-200",
            order.status === "paid" && "bg-emerald-400/20 text-emerald-200"
          )}
        >
          {statusLabel(order.status)}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-sky-100/70">
        {order.items
          .map((item) => `${item.quantity}× ${item.name}`)
          .join(" · ")}
      </p>
      <p className="mt-2 text-sm font-bold text-sky-200">
        {formatPrice(order.total)}
      </p>
    </button>
  );
}

export function AdminOrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pastOpen, setPastOpen] = useState(false);
  /** id → updatedAt; merge updates keep the same id so we track timestamps. */
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

  const fetchOrders = useCallback(async (announceNew: boolean) => {
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
      if (announceNew && knownVersionsRef.current) {
        const shouldChime = next.some((order) => {
          if (order.status !== "new") return false;
          const prev = knownVersionsRef.current!.get(order.id);
          return prev === undefined || prev !== order.updatedAt;
        });
        if (shouldChime) {
          playOrderChime();
        }
      }
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
    void fetchOrders(false);
    const timer = window.setInterval(() => {
      void fetchOrders(true);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [fetchOrders]);

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
    <div className="space-y-6">
      <Card className="bg-[oklch(0.22_0.04_250)] text-white ring-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Bell className="size-4 text-sky-300" />
            Aktif siparişler
          </CardTitle>
          <CardDescription className="text-sky-100/60">
            Masa ödenene kadar aynı oturumda tutulur; ek siparişler tutarı
            günceller ve durumu Yeniyi getirir. Ödenenler geçmişe düşer.
            Liste sabah 08:00 – gece 03:00 arası tutulur, sonra sıfırlanır.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          {loading ? (
            <p className="text-sm text-sky-100/60">Siparişler yükleniyor…</p>
          ) : activeOrders.length === 0 ? (
            <p className="rounded-xl bg-white/5 px-4 py-8 text-center text-sm text-sky-100/60">
              Aktif sipariş yok.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {activeOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  active={selectedId === order.id}
                  onSelect={() =>
                    setSelectedId(selectedId === order.id ? null : order.id)
                  }
                />
              ))}
            </div>
          )}

          {selected && selected.status !== "paid" ? (
            <div className="space-y-3 rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold text-white">
                    Masa {selected.tableNumber}
                  </p>
                  <p className="text-xs text-sky-100/55">
                    {new Date(selected.createdAt).toLocaleString("tr-TR")} ·{" "}
                    {statusLabel(selected.status)}
                  </p>
                </div>
                <p className="text-lg font-bold text-sky-200">
                  {formatPrice(selected.total)}
                </p>
              </div>
              <ul className="space-y-2">
                {selected.items.map((item) => (
                  <li
                    key={`${selected.id}-${item.productId}-${item.note ?? ""}`}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <span className="text-sky-50">
                      {item.quantity}× {item.name}
                      {item.note?.trim() ? (
                        <span className="mt-0.5 block text-xs text-sky-200/70">
                          Not: {item.note}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 tabular-nums text-sky-100/80">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                  disabled={busyId === selected.id || selected.status === "sent"}
                  onClick={() => void patchStatus(selected.id, "sent")}
                >
                  <Send className="size-4" />
                  Gönderildi
                </Button>
                <Button
                  type="button"
                  className="ml-auto bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
                  disabled={busyId === selected.id}
                  onClick={() => void patchStatus(selected.id, "paid")}
                >
                  <Check className="size-4" />
                  Ödendi
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="bg-[oklch(0.22_0.04_250)] text-white ring-white/10">
        <button
          type="button"
          onClick={() => setPastOpen((current) => !current)}
          className="flex w-full items-start justify-between gap-3 px-6 py-6 text-left"
          aria-expanded={pastOpen}
        >
          <div className="min-w-0">
            <CardTitle className="text-white">Geçmiş siparişler</CardTitle>
            <CardDescription className="mt-1.5 text-sky-100/60">
              Ödendi işaretlenen siparişler
              {pastOrders.length > 0 ? ` · ${pastOrders.length}` : ""}. İstersen
              geri alıp aktif listeye çekebilirsin. Sabah 08:00 – gece 03:00
              arası saklanır.
            </CardDescription>
          </div>
          <ChevronDown
            className={cn(
              "mt-1 size-5 shrink-0 text-sky-200/70 transition",
              pastOpen && "rotate-180"
            )}
          />
        </button>
        {pastOpen ? (
          <CardContent className="space-y-4 pt-0">
            {pastOrders.length === 0 ? (
              <p className="rounded-xl bg-white/5 px-4 py-8 text-center text-sm text-sky-100/60">
                Henüz ödenmiş sipariş yok.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {pastOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    active={selectedId === order.id}
                    onSelect={() =>
                      setSelectedId(selectedId === order.id ? null : order.id)
                    }
                  />
                ))}
              </div>
            )}

            {selected && selected.status === "paid" ? (
              <div className="space-y-3 rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-semibold text-white">
                      Masa {selected.tableNumber}
                    </p>
                    <p className="text-xs text-sky-100/55">
                      {new Date(selected.createdAt).toLocaleString("tr-TR")} ·
                      Ödendi
                    </p>
                  </div>
                  <p className="text-lg font-bold text-sky-200">
                    {formatPrice(selected.total)}
                  </p>
                </div>
                <ul className="space-y-2">
                  {selected.items.map((item) => (
                    <li
                      key={`${selected.id}-${item.productId}-past-${item.note ?? ""}`}
                      className="flex items-start justify-between gap-3 text-sm"
                    >
                      <span className="text-sky-50">
                        {item.quantity}× {item.name}
                        {item.note?.trim() ? (
                          <span className="mt-0.5 block text-xs text-sky-200/70">
                            Not: {item.note}
                          </span>
                        ) : null}
                      </span>
                      <span className="shrink-0 tabular-nums text-sky-100/80">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                    disabled={busyId === selected.id}
                    onClick={() => void patchStatus(selected.id, "new")}
                  >
                    <RotateCcw className="size-4" />
                    Geri al
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
}
