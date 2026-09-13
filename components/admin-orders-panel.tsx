"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Check, Send } from "lucide-react";
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
    const tones = [880, 1174.7, 1568];
    tones.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02 + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28 + index * 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + index * 0.08);
      osc.stop(now + 0.35 + index * 0.08);
    });
  } catch {
    // ignore audio failures
  }
}

function statusLabel(status: Order["status"]) {
  if (status === "paid") return "Ödendi";
  if (status === "sent") return "Gönderildi";
  return "Yeni";
}

export function AdminOrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const knownIdsRef = useRef<Set<string> | null>(null);
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
      if (announceNew && knownIdsRef.current) {
        const fresh = next.filter((order) => !knownIdsRef.current!.has(order.id));
        if (fresh.some((order) => order.status === "new")) {
          playOrderChime();
        }
      }
      knownIdsRef.current = new Set(next.map((order) => order.id));
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Güncellenemedi.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="bg-[oklch(0.22_0.04_250)] text-white ring-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Bell className="size-4 text-sky-300" />
          Siparişler
        </CardTitle>
        <CardDescription className="text-sky-100/60">
          Gelen siparişler burada listelenir. Yeni siparişte bildirim sesi çalar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {loading ? (
          <p className="text-sm text-sky-100/60">Siparişler yükleniyor…</p>
        ) : orders.length === 0 ? (
          <p className="rounded-xl bg-white/5 px-4 py-8 text-center text-sm text-sky-100/60">
            Henüz sipariş yok.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {orders.map((order) => {
              const active = selectedId === order.id;
              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelectedId(active ? null : order.id)}
                  className={cn(
                    "rounded-2xl bg-white/5 p-3 text-left ring-1 ring-white/10 transition hover:bg-white/10",
                    active && "ring-sky-300/50 bg-white/10"
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
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        order.status === "new" && "bg-amber-400/20 text-amber-200",
                        order.status === "sent" && "bg-sky-400/20 text-sky-200",
                        order.status === "paid" &&
                          "bg-emerald-400/20 text-emerald-200"
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
            })}
          </div>
        )}

        {selected ? (
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
                  key={`${selected.id}-${item.productId}`}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <span className="text-sky-50">
                    {item.quantity}× {item.name}
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
                disabled={busyId === selected.id || selected.status === "paid"}
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
  );
}
