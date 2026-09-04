"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { BalloonField, BalloonMark } from "@/components/balloon-mark";
import { ProductCard } from "@/components/product-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMenu } from "@/hooks/use-menu";
import {
  formatPrice,
  instagramHref,
  phoneHref,
  type MenuData,
  type Product,
  whatsappHref,
} from "@/lib/menu";
import { cn } from "@/lib/utils";

export function MenuView({ initialMenu }: { initialMenu: MenuData }) {
  const { menu } = useMenu(initialMenu);
  const venue = menu.venue;
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

  const tel = phoneHref(venue.phone);
  const wa = whatsappHref(venue.whatsapp);
  const ig = instagramHref(venue.instagram);
  const maps = venue.mapsUrl.trim();

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <BalloonField />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 lg:px-10">
        <header className="relative isolate min-h-[52svh] overflow-hidden rounded-[1.75rem] shadow-[0_20px_50px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/hero.webp"
            alt={venue.brandName}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/35 to-slate-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/55 via-transparent to-transparent" />

          <div className="relative flex h-full min-h-[52svh] flex-col justify-between p-5 sm:p-7 lg:p-9">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium tracking-[0.28em] text-sky-200 uppercase">
                  {venue.tagline}
                </p>
                <h1 className="mt-2 font-heading text-4xl leading-[0.95] text-white sm:text-5xl lg:text-6xl">
                  {venue.headline}
                </h1>
                <p className="mt-3 max-w-md text-base text-white/85 sm:text-lg">
                  {venue.subheadline}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <div className="rounded-2xl bg-white/95 p-2 shadow-lg ring-1 ring-white/60 backdrop-blur-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/logo-banner.webp"
                    alt={venue.brandName}
                    className="h-12 w-auto max-w-[7.5rem] object-contain sm:h-14"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                      const fallback = event.currentTarget.nextElementSibling;
                      if (fallback instanceof HTMLElement) {
                        fallback.style.display = "block";
                      }
                    }}
                  />
                  <BalloonMark
                    className="hidden h-12 w-9"
                    title={venue.brandName}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0 space-y-2">
                {venue.statusLabel ? (
                  <div className="w-fit rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#007AFF] shadow-sm ring-1 ring-white/70">
                    {venue.statusLabel}
                  </div>
                ) : null}
                <div>
                  <p className="font-heading text-3xl tracking-wide text-white sm:text-4xl">
                    {venue.brandName}
                  </p>
                  <p className="mt-1 text-sm text-white/75">
                    {venue.brandSubtitle}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="max-w-[11rem] text-xs leading-relaxed text-white/80 sm:max-w-xs">
                  {venue.addressLine1}
                  <br />
                  {venue.addressLine2}
                </p>
                {maps ? (
                  <a
                    href={maps}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1.5 text-xs font-medium text-[#007AFF] shadow-sm ring-1 ring-white/70 transition hover:bg-white"
                  >
                    <MapPin className="size-3.5" />
                    Konum
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <nav className="sticky top-0 z-20 -mx-4 mt-5 bg-white/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          <p className="text-[11px] font-medium tracking-[0.22em] text-[#007AFF]/80 uppercase">
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

        <main className="mt-5 space-y-12 pb-8">
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
                <div className="mb-3">
                  <h2 className="font-heading text-2xl text-slate-900 sm:text-3xl">
                    {section.title}
                  </h2>
                  {section.id === "imza" ? (
                    <p className="mt-1 text-sm text-slate-500">
                      Mevsimsel malzemeler ve modern mutfak teknikleriyle
                      hazırlandı. Kaydırarak bakın.
                    </p>
                  ) : null}
                </div>

                {section.id === "imza" ? (
                  <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {section.products.map((product) => (
                      <ProductCard
                        key={`featured-${product.id}`}
                        product={product}
                        featured
                        onSelect={setSelected}
                        className="w-[70%] shrink-0 snap-start sm:w-[42%] lg:w-[32%]"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
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

        <footer className="mt-2 border-t border-slate-200 py-10">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="font-heading text-2xl text-slate-900">
                {venue.brandName}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Antakya Döner ve Özel Burgerler
              </p>
              <p className="mt-4 text-sm text-slate-500">{venue.city}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {tel ? (
                  <ContactIcon href={tel} label="Telefon">
                    <Phone className="size-4" />
                  </ContactIcon>
                ) : null}
                {wa ? (
                  <ContactIcon href={wa} label="WhatsApp">
                    <MessageCircle className="size-4" />
                  </ContactIcon>
                ) : null}
                {ig ? (
                  <ContactIcon href={ig} label="Instagram">
                    <InstagramGlyph />
                  </ContactIcon>
                ) : null}
                {maps ? (
                  <ContactIcon href={maps} label="Konum">
                    <MapPin className="size-4" />
                  </ContactIcon>
                ) : null}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium tracking-[0.2em] text-[#007AFF] uppercase">
                Açılış Saatleri
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                {venue.hours.map((row) => (
                  <li key={row.id} className="flex justify-between gap-4">
                    <span>{row.label}</span>
                    <span className="text-slate-800">{row.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </footer>
      </div>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-h-[min(92vh,720px)] overflow-hidden border-slate-200 bg-white p-0 text-slate-900 sm:max-w-md">
          {selected ? (
            <div className="flex max-h-[min(92vh,720px)] flex-col">
              {selected.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.image}
                  alt={selected.name}
                  className="h-52 w-full shrink-0 object-cover sm:h-56"
                />
              ) : null}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
                <DialogHeader className="gap-2 text-left">
                  <DialogTitle className="font-heading text-2xl text-slate-900">
                    {selected.name}
                  </DialogTitle>
                  <p className="text-2xl font-semibold text-[#007AFF]">
                    {formatPrice(selected.price)}
                  </p>
                </DialogHeader>

                <div className="mt-5 space-y-4">
                  <section>
                    <h3 className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                      İçerik
                    </h3>
                    <DialogDescription className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                      {selected.description || "Mavi Balloon menü ürünü"}
                    </DialogDescription>
                  </section>
                  <section>
                    <h3 className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                      Alerjenler
                    </h3>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                      {selected.allergens?.trim()
                        ? selected.allergens
                        : "Belirtilmemiş"}
                    </p>
                  </section>
                </div>
              </div>
            </div>
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
        "shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-[#007AFF] text-white shadow-sm"
          : "bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200/70"
      )}
    >
      {label}
    </button>
  );
}

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function ContactIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("tel:") ? undefined : "_blank"}
      rel={href.startsWith("tel:") ? undefined : "noreferrer"}
      aria-label={label}
      className="inline-flex size-10 items-center justify-center rounded-full bg-[#007AFF]/10 text-[#007AFF] ring-1 ring-[#007AFF]/20 transition hover:bg-[#007AFF] hover:text-white"
    >
      {children}
    </a>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[1.5rem] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">
      <h2 className="font-heading text-2xl text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{body}</p>
    </div>
  );
}
