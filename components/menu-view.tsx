"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BalloonField } from "@/components/balloon-mark";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { useMenu } from "@/hooks/use-menu";
import { cn } from "@/lib/utils";

export function MenuView() {
  const { menu, ready } = useMenu();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = menu?.categories ?? [];
  const products = useMemo(() => {
    if (!menu) return [];
    if (activeCategory === "all") return menu.products;
    return menu.products.filter((product) => product.categoryId === activeCategory);
  }, [activeCategory, menu]);

  const emptyCategories = ready && categories.length === 0;
  const emptyProducts = ready && products.length === 0;

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <BalloonField />
      <SiteHeader />

      <div className="relative mx-auto w-full max-w-5xl px-4">
        <p className="max-w-xl text-sm leading-relaxed text-sky-100/70 sm:text-base">
          Hamburger, Antakya döner, broast ve Arjantin patatesi. QR okutun,
          menüyü açın, siparişinizi masadan verin.
        </p>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <CategoryChip
            label="Tümü"
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          />
          {categories.map((category) => (
            <CategoryChip
              key={category.id}
              label={category.name}
              active={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            />
          ))}
        </div>
      </div>

      <main className="relative mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {!ready ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </div>
        ) : emptyCategories ? (
          <EmptyState
            title="Kategori henüz yok"
            body="Menü kategorileri yönetim panelinden oluşturulabilir."
          />
        ) : emptyProducts ? (
          <EmptyState
            title="Bu kategoride ürün yok"
            body="Yeni ürün eklemek veya fiyat girmek için yönetim panelini kullanın."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <footer className="relative mt-auto border-t border-white/8 px-4 py-6 text-center text-xs text-sky-100/45">
        <p>Mavi Balon • Taze pişer, sıcak gelir</p>
        <p className="mt-2 flex justify-center gap-4">
          <Link href="/qr" className="text-sky-300/70 underline-offset-4 hover:text-sky-200 hover:underline">
            Masa QR kodu
          </Link>
          <Link href="/yonetim" className="text-sky-300/70 underline-offset-4 hover:text-sky-200 hover:underline">
            Yönetim
          </Link>
        </p>
      </footer>
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sky-400 text-[oklch(0.18_0.05_250)]"
          : "bg-white/8 text-sky-100/80 ring-1 ring-white/10 hover:bg-white/12"
      )}
    >
      {label}
    </button>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-white/5 px-6 py-16 text-center ring-1 ring-white/10">
      <h2 className="font-heading text-xl text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-sky-100/65">{body}</p>
    </div>
  );
}
