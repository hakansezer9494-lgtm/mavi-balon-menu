import Link from "next/link";
import { BalloonField, BalloonMark } from "@/components/balloon-mark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PortalPage() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <BalloonField />

      <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-10">
        <div className="mb-8 flex items-center gap-3">
          <BalloonMark className="h-14 w-11 drop-shadow-[0_8px_18px_rgba(59,158,255,0.45)]" />
          <div>
            <p className="text-[11px] font-medium tracking-[0.22em] text-sky-300/80 uppercase">
              İşletme portali
            </p>
            <h1 className="font-heading text-3xl leading-none text-white sm:text-4xl">
              Mavi Balon
            </h1>
          </div>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-sky-100/70">
          Bu sayfa yalnızca işletme içindir. Müşteri menüsünde görünmez.
          Kategori, fiyat, fotoğraf ve masa QR’sini buradan yönetin.
        </p>

        <div className="space-y-3">
          <PortalCard
            href="/yonetim"
            title="Menü yönetimi"
            body="Kategori oluşturun, ürün fotoğrafı ve fiyat girin."
            primary
          />
          <PortalCard
            href="/qr"
            title="Masa QR kodu"
            body="Yazdırıp masaya koyun. Müşteri kamerayla menüyü açar."
          />
          <PortalCard
            href="/"
            title="Müşteri menüsünü gör"
            body="Misafirlerin telefonunda görünen sayfayı kontrol edin."
          />
        </div>

        <p className="mt-8 text-center text-xs text-sky-100/40">
          Adresi yer imlerine ekleyin: <span className="text-sky-200/70">/portal</span>
        </p>
      </main>
    </div>
  );
}

function PortalCard({
  href,
  title,
  body,
  primary = false,
}: {
  href: string;
  title: string;
  body: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-2xl p-4 ring-1 transition",
        primary
          ? "bg-sky-400 text-[oklch(0.18_0.05_250)] ring-sky-300/40 hover:bg-sky-300"
          : "bg-white/6 text-white ring-white/10 hover:bg-white/10"
      )}
    >
      <p className={cn("font-heading text-xl", primary ? "" : "text-white")}>{title}</p>
      <p className={cn("mt-1 text-sm", primary ? "opacity-80" : "text-sky-100/65")}>
        {body}
      </p>
      <span
        className={cn(
          buttonVariants({ variant: primary ? "secondary" : "outline", size: "sm" }),
          "mt-3 pointer-events-none",
          primary ? "bg-white/70" : ""
        )}
      >
        Aç
      </span>
    </Link>
  );
}
