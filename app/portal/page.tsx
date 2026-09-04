import Link from "next/link";
import { BalloonField } from "@/components/balloon-mark";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PortalPage() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <BalloonField />
      <div className="relative z-10 flex min-h-full flex-1 flex-col">
        <SiteHeader eyebrow="İşletme portali" compact />

        <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-16">
          <p className="mb-6 text-sm leading-relaxed text-slate-600">
            Bu sayfa yalnızca işletme içindir. Müşteri menüsünde görünmez.
            Kategori, fiyat, fotoğraf, iletişim ve masa QR’sini buradan yönetin.
          </p>

          <div className="space-y-3">
            <PortalCard
              href="/yonetim"
              title="Menü yönetimi"
              body="Kategori, ürün, açılış saatleri ve sosyal medya linkleri."
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

          <p className="mt-8 text-center text-xs text-slate-400">
            Adresi yer imlerine ekleyin:{" "}
            <span className="text-[#007AFF]">/portal</span>
          </p>
        </main>
      </div>
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
        "block rounded-[1.5rem] p-4 ring-1 transition",
        primary
          ? "bg-[#007AFF] text-white ring-[#007AFF]/40 hover:bg-[#0066d6]"
          : "bg-white text-slate-900 ring-slate-200 hover:ring-[#007AFF]/35"
      )}
    >
      <p className="font-heading text-xl">{title}</p>
      <p className={cn("mt-1 text-sm", primary ? "text-white/85" : "text-slate-500")}>
        {body}
      </p>
      <span
        className={cn(
          buttonVariants({
            variant: primary ? "secondary" : "outline",
            size: "sm",
          }),
          "mt-3 pointer-events-none",
          primary ? "bg-white/15 text-white" : ""
        )}
      >
        Aç
      </span>
    </Link>
  );
}
