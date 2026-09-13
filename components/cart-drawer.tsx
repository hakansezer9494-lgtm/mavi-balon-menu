"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/menu";
import type { OrderItem } from "@/lib/orders";
import { cn } from "@/lib/utils";

export type CartLine = OrderItem & {
  description?: string;
};

function cartLineKey(item: Pick<CartLine, "productId" | "note">) {
  return `${item.productId}::${item.note ?? ""}`;
}

export function CartFab({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-4 left-4 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-slate-900 px-4 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(15,23,42,0.35)] ring-1 ring-white/20 transition hover:bg-slate-800 active:scale-95"
    >
      <ShoppingBag className="size-4" />
      Sepetim
      {count > 0 ? (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#007AFF] px-1.5 text-[11px] font-bold">
          {count}
        </span>
      ) : null}
    </button>
  );
}

type CartDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartLine[];
  tables: string[];
  onChangeQty: (productId: string, quantity: number, note?: string) => void;
  onRemove: (productId: string, note?: string) => void;
  onClear: () => void;
};

export function CartDrawer({
  open,
  onOpenChange,
  items,
  tables,
  onChangeQty,
  onRemove,
  onClear,
}: CartDrawerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState("");
  const [tableOpen, setTableOpen] = useState(false);
  const [occupiedTables, setOccupiedTables] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const total = useMemo(
    () =>
      items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  );
  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    async function loadOccupied() {
      try {
        const response = await fetch("/api/orders/occupied", {
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = (await response.json()) as { occupied?: string[] };
        if (cancelled) return;
        const next = Array.isArray(data.occupied) ? data.occupied : [];
        setOccupiedTables(next);
        setTableNumber((current) =>
          current && next.includes(current) ? "" : current
        );
      } catch {
        // keep last known list
      }
    }

    void loadOccupied();
    const timer = window.setInterval(() => {
      void loadOccupied();
    }, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [open]);

  async function placeOrder() {
    setError("");
    setSuccess("");
    if (!tableNumber) {
      setError("Sipariş vermek için masa seçin.");
      return;
    }
    if (occupiedTables.includes(tableNumber)) {
      setError("Bu masa dolu. Ödeme alınmadan yeni sipariş verilemez.");
      return;
    }
    if (items.length === 0) {
      setError("Sepet boş.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber,
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            note: item.note,
          })),
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Sipariş gönderilemedi.");
      }
      onClear();
      setTableNumber("");
      setExpandedId(null);
      setSuccess("Siparişiniz alındı. Afiyet olsun!");
      setOccupiedTables((current) =>
        current.includes(tableNumber) ? current : [...current, tableNumber]
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sipariş gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-start sm:items-stretch">
      <button
        type="button"
        aria-label="Sepeti kapat"
        className="absolute inset-0 bg-slate-950/40"
        onClick={() => onOpenChange(false)}
      />
      <aside className="relative z-10 flex max-h-[88vh] w-full max-w-md flex-col rounded-t-3xl bg-white shadow-2xl sm:h-full sm:max-h-none sm:rounded-none sm:rounded-r-3xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Sepetim</p>
            <p className="text-xs text-slate-500">
              {count > 0 ? `${count} ürün` : "Henüz ürün yok"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex size-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              {success || "Ürün eklemek için menüden bir yemek seçin."}
            </p>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => {
                const key = cartLineKey(item);
                const descOpen = expandedId === key;
                return (
                  <li
                    key={key}
                    className="rounded-2xl bg-slate-50 ring-1 ring-slate-200/80"
                  >
                    <button
                      type="button"
                      className="flex w-full items-start justify-between gap-3 px-3 py-3 text-left"
                      onClick={() => setExpandedId(descOpen ? null : key)}
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">
                          {formatPrice(item.unitPrice)} × {item.quantity}
                        </p>
                        {item.note?.trim() ? (
                          <p className="mt-1 line-clamp-1 text-xs text-[#007AFF]">
                            Not: {item.note}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#007AFF]">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </span>
                        <ChevronDown
                          className={cn(
                            "size-4 text-slate-400 transition",
                            descOpen && "rotate-180"
                          )}
                        />
                      </div>
                    </button>
                    {descOpen ? (
                      <div className="space-y-3 border-t border-slate-200/80 px-3 py-3">
                        {item.note?.trim() ? (
                          <p className="rounded-xl bg-white px-3 py-2 text-sm leading-relaxed text-slate-700 ring-1 ring-slate-200">
                            <span className="font-medium text-slate-900">
                              Açıklama:{" "}
                            </span>
                            {item.note}
                          </p>
                        ) : null}
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                          {item.description?.trim() ||
                            "Bu ürün için menü açıklaması yok."}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <div className="inline-flex items-center gap-1 rounded-full bg-white p-1 ring-1 ring-slate-200">
                            <button
                              type="button"
                              className="inline-flex size-8 items-center justify-center rounded-full hover:bg-slate-100"
                              onClick={() =>
                                onChangeQty(
                                  item.productId,
                                  item.quantity - 1,
                                  item.note
                                )
                              }
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="min-w-6 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className="inline-flex size-8 items-center justify-center rounded-full hover:bg-slate-100"
                              onClick={() =>
                                onChangeQty(
                                  item.productId,
                                  item.quantity + 1,
                                  item.note
                                )
                              }
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            className="text-xs font-medium text-red-500 hover:underline"
                            onClick={() =>
                              onRemove(item.productId, item.note)
                            }
                          >
                            Kaldır
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-3 border-t border-slate-100 px-4 py-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => setTableOpen((current) => !current)}
              className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-3 py-3 text-left ring-1 ring-slate-200"
            >
              <div>
                <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
                  Masa no
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {tableNumber ? `Masa ${tableNumber}` : "Masa seçin"}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "size-4 text-slate-400 transition",
                  tableOpen && "rotate-180"
                )}
              />
            </button>
            {tableOpen ? (
              <div className="absolute bottom-full left-0 z-20 mb-2 max-h-48 w-full overflow-y-auto rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-200">
                {tables.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-slate-500">
                    Henüz masa tanımlanmamış. Yönetim panelinden masa ekleyin.
                  </p>
                ) : (
                  tables.map((table) => {
                    const occupied = occupiedTables.includes(table);
                    return (
                      <button
                        key={table}
                        type="button"
                        disabled={occupied}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium",
                          occupied
                            ? "cursor-not-allowed text-slate-400"
                            : "hover:bg-slate-50",
                          !occupied &&
                            tableNumber === table &&
                            "bg-[#007AFF]/10 text-[#007AFF]"
                        )}
                        onClick={() => {
                          if (occupied) return;
                          setTableNumber(table);
                          setTableOpen(false);
                          setError("");
                        }}
                      >
                        <span>Masa {table}</span>
                        {occupied ? (
                          <span className="text-[11px] font-semibold text-amber-600">
                            Dolu
                          </span>
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">Toplam</span>
            <span className="text-lg font-bold text-slate-900">
              {formatPrice(total)}
            </span>
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {success && items.length === 0 ? (
            <p className="text-sm text-emerald-600">{success}</p>
          ) : null}

          <Button
            className="h-12 w-full rounded-2xl bg-[#007AFF] text-base font-semibold hover:bg-[#0066d6]"
            disabled={submitting || items.length === 0}
            onClick={() => void placeOrder()}
          >
            {submitting ? "Gönderiliyor…" : "Sipariş Ver"}
          </Button>
        </div>
      </aside>
    </div>
  );
}
