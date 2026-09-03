"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { BalloonField, BalloonMark } from "@/components/balloon-mark";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function subscribe() {
  return () => {};
}

const FALLBACK_ORIGIN = "http://127.0.0.1:43123";

export function QrPage() {
  const url = useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => FALLBACK_ORIGIN
  );
  const isLocal =
    url.includes("127.0.0.1") || url.includes("localhost");

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div className="print:hidden">
        <BalloonField />
      </div>
      <div className="print:hidden">
        <SiteHeader eyebrow="Masa QR" compact />
      </div>

      <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-4 pb-16 text-center">
        <p className="text-sm text-sky-100/70 print:hidden">
          Menüyü yayınladıktan sonra bu kodu yazdırıp masaya veya kapıya koyun.
          Okutulunca Mavi Balon menüsü açılır.
        </p>

        {isLocal ? (
          <p className="mt-4 max-w-md rounded-xl bg-amber-400/15 px-3 py-2 text-sm text-amber-100 ring-1 ring-amber-200/30 print:hidden">
            Bu adres yalnızca bu bilgisayarda çalışır. Müşteri telefonu için
            siteyi önce internete yayınlayın; sonra buradaki QR’ı tekrar alın.
          </p>
        ) : null}

        <div className="mt-8 w-full max-w-sm rounded-3xl bg-white p-8 text-[oklch(0.18_0.05_250)] shadow-[0_20px_60px_rgba(59,158,255,0.18)] print:shadow-none">
          <div className="mb-4 flex items-center justify-center gap-2">
            <BalloonMark className="h-10 w-8" />
            <div className="text-left">
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase">
                Dijital menü
              </p>
              <p className="font-heading text-2xl leading-none">Mavi Balon</p>
            </div>
          </div>
          <div className="flex justify-center">
            <QRCodeSVG
              value={url}
              size={240}
              bgColor="#ffffff"
              fgColor="#0b1f3a"
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
            onClick={() => window.print()}
            className={cn(
              buttonVariants({ variant: "default" }),
              "bg-sky-400 text-[oklch(0.18_0.05_250)] hover:bg-sky-300"
            )}
          >
            Yazdır
          </button>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
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
