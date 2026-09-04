import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PortalPage() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <SiteHeader eyebrow="İşletme portali" compact />

      <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-16">
        <p className="mb-6 text-sm leading-relaxed text-cream/70">
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

        <p className="mt-8 text-center text-xs text-cream/40">
          Adresi yer imlerine ekleyin: <span className="text-gold/80">/portal</span>
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
        "block rounded-[1.5rem] p-4 ring-1 transition",
        primary
          ? "bg-gold text-[#14100a] ring-gold/40 hover:bg-[#d4b67a]"
          : "bg-[#120e0a] text-[#fff4dd] ring-gold/15 hover:ring-gold/30"
      )}
    >
      <p className="font-heading text-xl">{title}</p>
      <p className={cn("mt-1 text-sm", primary ? "opacity-80" : "text-cream/65")}>
        {body}
      </p>
      <span
        className={cn(
          buttonVariants({ variant: primary ? "secondary" : "outline", size: "sm" }),
          "mt-3 pointer-events-none",
          primary ? "bg-[#14100a]/10" : ""
        )}
      >
        Aç
      </span>
    </Link>
  );
}
