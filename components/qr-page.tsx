"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ChevronDown, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { tableMenuUrl } from "@/lib/table-qr";
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
  const [openTable, setOpenTable] = useState<string | null>(null);

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
        const next = Array.isArray(menu.venue?.tables)
          ? menu.venue.tables.map((table) => String(table).trim()).filter(Boolean)
          : [];
        setTables(next);
        setOpenTable(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadTables();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedUrl = useMemo(() => {
    if (!openTable) return "";
    return tableMenuUrl(origin, openTable);
  }, [origin, openTable]);

  const handleDownload = useCallback(() => {
    if (!openTable) return;
    void downloadQrPng(
      `menu-qr-svg-${openTable}`,
      `masa-${openTable}-qr.png`
    );
  }, [openTable]);

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div className="print:hidden">
        <SiteHeader eyebrow="Masa QR" compact />
      </div>

      <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-16">
        <p className="text-center text-sm text-slate-600 print:hidden">
          Masayı açın, o masaya özel QR’ı indirip yazdırın. Misafir kodu
          okutunca menü o masa ile açılır; masa seçemez.
        </p>

        {isLocal ? (
          <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-center text-sm text-amber-800 ring-1 ring-amber-200 print:hidden">
            Bu adres yalnızca bu bilgisayarda çalışır. Müşteri telefonu için
            siteyi önce internete yayınlayın; sonra buradaki QR’ı tekrar alın.
          </p>
        ) : null}

        <div className="mt-6 space-y-2 print:hidden">
          {loading ? (
            <p className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">
              Masalar yükleniyor…
            </p>
          ) : tables.length === 0 ? (
            <p className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">
              Henüz masa yok. Yönetim panelinden masa ekleyip kaydedin.
            </p>
          ) : (
            tables.map((table) => {
              const open = openTable === table;
              const url = tableMenuUrl(origin, table);
              return (
                <div
                  key={table}
                  className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenTable((current) => (current === table ? null : table))
                    }
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <div>
                      <p className="text-[11px] font-medium tracking-wide text-[#007AFF] uppercase">
                        Masa çekmecesi
                      </p>
                      <p className="font-heading text-xl text-slate-900">
                        Masa {table}
                      </p>
                    </div>
                    <ChevronDown
                      className={cn(
                        "size-5 text-slate-400 transition",
                        open && "rotate-180"
                      )}
                    />
                  </button>
                  {open ? (
                    <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                      <div className="mx-auto max-w-xs rounded-[1.5rem] bg-slate-50 p-5 text-center ring-1 ring-slate-200">
                        <p className="text-[10px] font-medium tracking-[0.22em] text-[#007AFF] uppercase">
                          Dijital menü
                        </p>
                        <p className="font-heading text-2xl leading-none text-slate-900">
                          Masa {table}
                        </p>
                        <div className="mt-3 flex justify-center">
                          <QRCodeSVG
                            id={`menu-qr-svg-${table}`}
                            value={url}
                            size={200}
                            bgColor="#ffffff"
                            fgColor="#0f172a"
                            level="M"
                            includeMargin={false}
                          />
                        </div>
                        <p className="mt-3 text-xs break-all text-slate-500">
                          {url}
                        </p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
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
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        {openTable && selectedUrl ? (
          <div className="mt-8 hidden print:block">
            <div className="mx-auto max-w-sm rounded-[2rem] bg-white p-8 text-center text-slate-900">
              <p className="text-[10px] font-medium tracking-[0.22em] text-[#007AFF] uppercase">
                Dijital menü
              </p>
              <p className="font-heading text-3xl leading-none">
                Masa {openTable}
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
