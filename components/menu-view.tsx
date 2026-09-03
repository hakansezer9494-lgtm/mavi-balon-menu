"use client";

import { useMemo, useState } from "react";
import { BalloonField } from "@/components/balloon-mark";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMenu } from "@/hooks/use-menu";
import { formatPrice, type MenuData, type Product } from "@/lib/menu";
import { cn } from "@/lib/utils";

export function MenuView({ initialMenu }: { initialMenu: MenuData }) {
  const { menu } = useMenu(initialMenu);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selected, setSelected] = useState<Product | null>(null);

  const categories = menu.categories;
  const products = useMemo(() => {
    if (activeCategory === "all") return menu.products;
    return menu.products.filter((product) => product.categoryId === activeCategory);
  }, [activeCategory, menu]);

  const emptyCategories = categories.length === 0;
  const emptyProducts = products.length === 0;

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <BalloonField />
      <SiteHeader />

      <div className="relative mx-auto w-full max-w-5xl px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
        {emptyCategories ? (
          <EmptyState
            title="Menü hazırlanıyor"
            body="Ürünler birazdan burada görünecek."
          />
        ) : emptyProducts ? (
          <EmptyState
            title="Bu kategoride ürün yok"
            body="Başka bir kategori seçebilirsiniz."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={setSelected}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="relative mt-auto border-t border-white/8 px-4 py-6 text-center text-xs text-sky-100/45">
        <p>Mavi Balon • Taze pişer, sıcak gelir</p>
      </footer>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="overflow-hidden bg-[oklch(0.2_0.04_250)] p-0 text-white sm:max-w-md">
          {selected ? (
            <>
              {selected.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.image}
                  alt={selected.name}
                  className="h-56 w-full object-cover"
                />
              ) : null}
              <div className="space-y-2 p-4">
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl text-white">
                    {selected.name}
                  </DialogTitle>
                  <DialogDescription className="text-sky-100/70">
                    {selected.description || "Mavi Balon menü ürünü"}
                  </DialogDescription>
                </DialogHeader>
                <p className="text-2xl font-semibold text-sky-200">
                  {formatPrice(selected.price)}
                </p>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
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
