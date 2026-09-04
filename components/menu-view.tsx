"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "@/components/product-card";
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
  const [activeCategory, setActiveCategory] = useState<string>("imza");
  const [selected, setSelected] = useState<Product | null>(null);
  const scrollingToRef = useRef<string | null>(null);

  const categories = menu.categories;
  const featured = useMemo(
    () => menu.products.filter((product) => product.featured),
    [menu.products]
  );

  const sections = useMemo(() => {
    const list: { id: string; title: string; products: Product[] }[] = [];
    if (featured.length > 0) {
      list.push({ id: "imza", title: "İmza Seçkisi", products: featured });
    }
    for (const category of categories) {
      const products = menu.products.filter(
        (product) => product.categoryId === category.id
      );
      if (products.length > 0) {
        list.push({
          id: category.id,
          title: category.name,
          products,
        });
      }
    }
    return list;
  }, [categories, featured, menu.products]);

  useEffect(() => {
    const nodes = sections
      .map((section) => document.getElementById(`section-${section.id}`))
      .filter((node): node is HTMLElement => Boolean(node));

    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingToRef.current) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (!top?.target.id) return;
        const id = top.target.id.replace(/^section-/, "");
        setActiveCategory(id);
      },
      {
        root: null,
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0.15, 0.35, 0.55],
      }
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    const chip = document.getElementById(`chip-${activeCategory}`);
    chip?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeCategory]);

  function scrollToSection(id: string) {
    const node = document.getElementById(`section-${id}`);
    if (!node) return;
    setActiveCategory(id);
    scrollingToRef.current = id;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      if (scrollingToRef.current === id) scrollingToRef.current = null;
    }, 900);
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-5xl">
        <header className="relative isolate min-h-[58svh] overflow-hidden rounded-[2rem] ring-1 ring-gold/15">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/hero.webp"
            alt="Mavi Balloon"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080705] via-[#080705]/55 to-[#080705]/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080705]/70 via-transparent to-transparent" />

          <div className="relative flex h-full min-h-[58svh] flex-col justify-between p-6 sm:p-8 lg:p-10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium tracking-[0.28em] text-gold uppercase">
                  Antakya lezzeti
                </p>
                <h1 className="mt-2 font-heading text-5xl leading-[0.95] text-[#fff4dd] sm:text-6xl lg:text-7xl">
                  Döner & Burger
                </h1>
                <p className="mt-3 max-w-md text-base text-cream/80 sm:text-lg">
                  Taze. Sıcak. Efsane.
                </p>
              </div>
              <div className="rounded-full bg-[#080705]/55 px-3 py-1.5 text-xs font-medium text-gold ring-1 ring-gold/30 backdrop-blur-sm">
                Açık · 11:00 - 01:30
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-heading text-3xl tracking-wide text-[#fff4dd] sm:text-4xl">
                  Mavi Balloon
                </p>
                <p className="mt-1 text-sm text-cream/65">
                  Döner, Burger & Sokak Lezzetleri
                </p>
              </div>
              <p className="max-w-xs text-right text-xs leading-relaxed text-cream/55">
                Caferağa, Neşet Ömer Sk. No:16 B
                <br />
                Kadıköy, Istanbul
              </p>
            </div>
          </div>
        </header>

        <nav className="sticky top-0 z-20 -mx-5 mt-6 bg-[#080705]/92 px-5 py-3 backdrop-blur-md sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
          <p className="text-[11px] font-medium tracking-[0.22em] text-gold/80 uppercase">
            Menü Keşfi
          </p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sections.map((section) => (
              <CategoryChip
                key={section.id}
                id={`chip-${section.id}`}
                label={section.title}
                active={activeCategory === section.id}
                onClick={() => scrollToSection(section.id)}
              />
            ))}
          </div>
        </nav>

        <main className="mt-6 space-y-14 pb-10">
          {sections.length === 0 ? (
            <EmptyState
              title="Menü hazırlanıyor"
              body="Ürünler birazdan burada görünecek."
            />
          ) : (
            sections.map((section) => (
              <section
                key={section.id}
                id={`section-${section.id}`}
                className="scroll-mt-28"
              >
                <div className="mb-4">
                  <h2 className="font-heading text-3xl text-[#fff4dd]">
                    {section.title}
                  </h2>
                  {section.id === "imza" ? (
                    <p className="mt-1 text-sm text-cream/60">
                      Mevsimsel malzemeler ve modern mutfak teknikleriyle
                      hazırlandı. Kaydırarak bakın.
                    </p>
                  ) : null}
                </div>

                {section.id === "imza" ? (
                  <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {section.products.map((product) => (
                      <ProductCard
                        key={`featured-${product.id}`}
                        product={product}
                        featured
                        onSelect={setSelected}
                        className="w-[78%] shrink-0 snap-start sm:w-[48%] lg:w-[38%]"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {section.products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={setSelected}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))
          )}
        </main>

        <footer className="mt-4 border-t border-gold/15 py-10">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="font-heading text-2xl text-[#fff4dd]">Mavi Balloon</p>
              <p className="mt-1 text-sm text-cream/60">
                Antakya Döner ve Özel Burgerler
              </p>
              <p className="mt-4 text-sm text-cream/50">Istanbul, Turkey</p>
            </div>
            <div>
              <p className="text-[11px] font-medium tracking-[0.2em] text-gold uppercase">
                Açılış Saatleri
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-cream/70">
                <li className="flex justify-between gap-4">
                  <span>Pazartesi</span>
                  <span>Kapalı</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span>Salı – Perşembe</span>
                  <span>11:00 - 23:30</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span>Cuma – Cumartesi</span>
                  <span>11:00 - 01:30</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span>Pazar</span>
                  <span>12:00 - 23:00</span>
                </li>
              </ul>
            </div>
          </div>
        </footer>
      </div>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="overflow-hidden border-gold/20 bg-[#100c08] p-0 text-[#fff4dd] sm:max-w-md">
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
              <div className="space-y-2 p-5">
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl text-[#fff4dd]">
                    {selected.name}
                  </DialogTitle>
                  <DialogDescription className="text-cream/65">
                    {selected.description || "Mavi Balloon menü ürünü"}
                  </DialogDescription>
                </DialogHeader>
                <p className="text-2xl font-semibold text-gold">
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
  id,
  label,
  active,
  onClick,
}: {
  id: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-gold text-[#14100a]"
          : "bg-white/6 text-cream/80 ring-1 ring-white/10 hover:bg-white/10"
      )}
    >
      {label}
    </button>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[1.5rem] bg-white/4 px-6 py-16 text-center ring-1 ring-gold/12">
      <h2 className="font-heading text-2xl text-[#fff4dd]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-cream/60">{body}</p>
    </div>
  );
}
