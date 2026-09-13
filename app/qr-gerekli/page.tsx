import Link from "next/link";
import { QrCode } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export default function QrRequiredPage() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-[#f4f7fb]">
      <SiteHeader eyebrow="Menü" compact />
      <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 pb-16 text-center">
        <div className="w-full rounded-3xl bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-200">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#007AFF]/10 text-[#007AFF]">
            <QrCode className="size-7" />
          </div>
          <h1 className="font-heading mt-5 text-3xl text-slate-900">
            QR kod gerekli
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Menüye yalnızca masadaki veya Ayakta/Paket QR kodunu okutarak
            girebilirsiniz. Sipariş verdikten sonra oturum kapanır; yeni sipariş
            için QR’ı tekrar okutmanız gerekir. Okutup sipariş vermezseniz oturum
            1 saat sonra sona erer.
          </p>
          <p className="mt-6 text-xs text-slate-400">
            Personel girişi:{" "}
            <Link href="/portal" className="font-medium text-[#007AFF] underline">
              Portal
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
