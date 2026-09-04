"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function subscribe() {
  return () => {};
}

const FALLBACK_ORIGIN = "http://127.0.0.1:43123";

async function downloadQrPng(filename: string) {
  const svg = document.getElementById("menu-qr-svg");
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
  const url = useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => FALLBACK_ORIGIN
  );
  const isLocal =
    url.includes("127.0.0.1") || url.includes("localhost");

  const handleDownload = useCallback(() => {
    void downloadQrPng("mavi-balloon-menu-qr.png");
  }, []);

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div className="print:hidden">
        <SiteHeader eyebrow="Masa QR" compact />
      </div>

      <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-4 pb-16 text-center">
        <p className="text-sm text-slate-600 print:hidden">
          Menüyü yayınladıktan sonra bu kodu indirip yazdırın veya masaya koyun.
          Okutulunca Mavi Balloon menüsü açılır.
        </p>

        {isLocal ? (
          <p className="mt-4 max-w-md rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-200 print:hidden">
            Bu adres yalnızca bu bilgisayarda çalışır. Müşteri telefonu için
            siteyi önce internete yayınlayın; sonra buradaki QR’ı tekrar alın.
          </p>
        ) : null}

        <div className="mt-8 w-full max-w-sm rounded-[2rem] bg-white p-8 text-slate-900 shadow-[0_20px_60px_rgba(0,122,255,0.12)] ring-1 ring-slate-200 print:shadow-none">
          <div className="mb-4 text-center">
            <p className="text-[10px] font-medium tracking-[0.22em] text-[#007AFF] uppercase">
              Dijital menü
            </p>
            <p className="font-heading text-3xl leading-none">Mavi Balloon</p>
          </div>
          <div className="flex justify-center">
            <QRCodeSVG
              id="menu-qr-svg"
              value={url}
              size={240}
              bgColor="#ffffff"
              fgColor="#0f172a"
              level="M"
              includeMargin={false}
            />
          </div>
          <p className="mt-4 text-sm font-medium">Kamerayı bu koda tutun</p>
          <p className="mt-1 break-all text-xs text-slate-500">{url}</p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2 print:hidden">
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
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
            Müşteri menüsü
          </Link>
          <Link href="/portal" className={cn(buttonVariants({ variant: "outline" }))}>
            Portal
          </Link>
        </div>
      </main>
    </div>
  );
}
