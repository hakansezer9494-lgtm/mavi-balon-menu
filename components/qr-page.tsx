"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { BalloonField } from "@/components/balloon-mark";
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

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <BalloonField />
      <SiteHeader eyebrow="Masa QR" compact />

      <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-4 pb-16 text-center">
        <p className="text-sm text-sky-100/70">
          Bu kodu masaya veya kapıya koyun. Okutulunca Mavi Balon menüsü açılır.
        </p>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(59,158,255,0.18)]">
          <QRCodeSVG
            value={url}
            size={240}
            bgColor="#ffffff"
            fgColor="#0b1f3a"
            level="M"
            includeMargin={false}
          />
        </div>

        <p className="mt-4 break-all text-xs text-sky-100/50">{url}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "default" }),
              "bg-sky-400 text-[oklch(0.18_0.05_250)] hover:bg-sky-300"
            )}
          >
            Menüyü aç
          </Link>
          <Link href="/yonetim" className={cn(buttonVariants({ variant: "outline" }))}>
            Yönetim
          </Link>
        </div>
      </main>
    </div>
  );
}
