"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ChevronDown, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { MENU_UPDATED_EVENT } from "@/lib/menu";
import {
  qrTableOptions,
  tableDisplayName,
  tableMenuUrl,
  TAKEAWAY_TABLE_ID,
} from "@/lib/table-qr";
import { cn } from "@/lib/utils";

function subscribe() {
  return () => {};
}

const FALLBACK_ORIGIN = "http://127.0.0.1:43123";

async function downloadQrPng(elementId: string, filename: string) {
  const svg = document.getElementById(elementId);
  if (!(svg instanceof SVGSVGElement)) return;
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svg);
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("QR yüklenemedi"));
      img.src = url;
    });
    const size = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(image, 64, 64, size - 128, size - 128);
    const png = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = png;
    anchor.download = filename;
    anchor.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function QrPage() {
  const origin = useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => FALLBACK_ORIGIN
  );
  const isLocal =
    origin.includes("127.0.0.1") || origin.includes("localhost");
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState("");
  const [tableMenuOpen, setTableMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadTables() {
      try {
        const response = await fetch("/api/menu", { cache: "no-store" });
        if (!response.ok) return;
        const menu = (await response.json()) as {
          venue?: { tables?: string[] };
        };
        if (cancelled) return;
        const raw = Array.isArray(menu.venue?.tables)
          ? menu.venue.tables.map((table) => String(table).trim()).filter(Boolean)
          : [];
        const next = qrTableOptions(raw);
        setTables(next);
        setSelectedTable((current) =>
          current && next.includes(current) ? current : next[0] ?? ""
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadTables();
    const onUpdate = () => {
      void loadTables();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void loadTables();
      }
    };
    window.addEventListener(MENU_UPDATED_EVENT, onUpdate);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener(MENU_UPDATED_EVENT, onUpdate);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onUpdate);
    };
  }, []);

  const selectedUrl = useMemo(() => {
    if (!selectedTable) return "";
    return tableMenuUrl(origin, selectedTable);
  }, [origin, selectedTable]);

  const handleDownload = useCallback(() => {
    if (!selectedTable) return;
    void downloadQrPng("menu-qr-svg", `${selectedTable === TAKEAWAY_TABLE_ID ? "ayakta-paket" : `masa-${selectedTable}`}-qr.png`);
  }, [selectedTable]);

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div className="print:hidden">
        <SiteHeader eyebrow="Masa QR" compact />
      </div>

      <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-16">
        <p className="text-center text-sm text-slate-600 print:hidden">
          Masayı seçin; alttaki QR yalnızca seçili masaya aittir. Misafir kodu
          okutunca menü o masa ile açılır.
        </p>

        {isLocal ? (
          <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-center text-sm text-amber-800 ring-1 ring-amber-200 print:hidden">
            Bu adres yalnızca bu bilgisayarda çalışır. Müşteri telefonu için
            siteyi önce internete yayınlayın; sonra buradaki QR’ı tekrar alın.
          </p>
        ) : null}

        <div className="mt-6 space-y-4 print:hidden">
          {loading ? (
            <p className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">
              Masalar yükleniyor…
            </p>
          ) : tables.length === 0 ? (
            <p className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">
              QR seçenekleri yüklenemedi. Sayfayı yenileyin.
            </p>
          ) : (
            <>
              <div className="grid gap-1.5">
                <p className="text-sm font-medium text-slate-800">Masa seçimi</p>
                <p className="text-xs text-slate-500">
                  Masayı seçin; alttaki QR yalnızca seçili masaya aittir.
                </p>
                <div className="relative">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 rounded-xl bg-white px-3 py-2.5 text-left text-sm font-medium text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                    onClick={() => setTableMenuOpen((open) => !open)}
                    aria-expanded={tableMenuOpen}
                  >
                    <span>{tableDisplayName(selectedTable)}</span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-slate-400 transition",
                        tableMenuOpen ? "rotate-180" : ""
                      )}
                    />
                  </button>
                  {tableMenuOpen ? (
                    <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200">
                      {tables.map((table) => (
                        <button
                          key={table}
                          type="button"
                          className={cn(
                            "flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-slate-800 hover:bg-slate-50",
                            table === selectedTable
                              ? "bg-[#007AFF]/10 font-semibold text-[#007AFF]"
                              : ""
                          )}
                          onClick={() => {
                            setSelectedTable(table);
                            setTableMenuOpen(false);
                          }}
                        >
                          <span>{tableDisplayName(table)}</span>
                          {table === selectedTable ? (
                            <span className="text-[10px] tracking-wide text-[#007AFF] uppercase">
                              Seçili
                            </span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              {selectedTable && selectedUrl ? (
                <div className="rounded-[1.75rem] bg-white p-6 text-center text-slate-900 shadow-[0_20px_60px_rgba(0,122,255,0.12)] ring-1 ring-slate-200">
                  <p className="text-[10px] font-medium tracking-[0.22em] text-[#007AFF] uppercase">
                    Dijital menü
                  </p>
                  <p className="font-heading text-3xl leading-none">
                    {tableDisplayName(selectedTable)}
                  </p>
                  <div className="mt-4 flex justify-center">
                    <QRCodeSVG
                      id="menu-qr-svg"
                      value={selectedUrl}
                      size={240}
                      bgColor="#ffffff"
                      fgColor="#0f172a"
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <p className="mt-4 text-sm font-medium">Kamerayı bu koda tutun</p>
                  <p className="mt-1 break-all text-xs text-slate-500">
                    {selectedUrl}
                  </p>
                </div>
              ) : null}

              {selectedTable ? (
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "bg-[#007AFF] text-white hover:bg-[#0066d6]"
                    )}
                  >
                    <Download className="size-4" />
                    QR indir
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className={cn(buttonVariants({ variant: "outline" }))}
                  >
                    Yazdır
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>

        {selectedTable && selectedUrl ? (
          <div className="mt-8 hidden print:block">
            <div className="mx-auto max-w-sm rounded-[2rem] bg-white p-8 text-center text-slate-900">
              <p className="text-[10px] font-medium tracking-[0.22em] text-[#007AFF] uppercase">
                Dijital menü
              </p>
              <p className="font-heading text-3xl leading-none">
                {tableDisplayName(selectedTable)}
              </p>
              <div className="mt-4 flex justify-center">
                <QRCodeSVG
                  value={selectedUrl}
                  size={240}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                  level="M"
                  includeMargin={false}
                />
              </div>
              <p className="mt-4 text-sm font-medium">Kamerayı bu koda tutun</p>
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap justify-center gap-2 print:hidden">
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
            Müşteri menüsü
          </Link>
          <Link
            href="/portal"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Portal
          </Link>
          <Link
            href="/yonetim"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Yönetim
          </Link>
        </div>
      </main>
    </div>
  );
}
