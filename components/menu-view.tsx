"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  MapPin,
  MessageCircle,
  Phone,
  Search,
  UtensilsCrossed,
  X,
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
  getUi,
  matchesSearch,
  translateCategory,
  translateHourLabel,
  translateHourValue,
  type Locale,
} from "@/lib/i18n";
import {
  formatPrice,
  instagramHref,
  localizedCategoryName,
  localizedProduct,
  phoneHref,
  type MenuData,
  type Product,
  whatsappHref,
} from "@/lib/menu";
import { cn } from "@/lib/utils";

const LANG_KEY = "mavi-balon-locale";

function subscribeLocale(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("mavi-locale-change", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("mavi-locale-change", onStoreChange);
  };
}

function readLocale(): Locale {
  const saved = window.localStorage.getItem(LANG_KEY);
  return saved === "en" ? "en" : "tr";
}

export function MenuView({ initialMenu }: { initialMenu: MenuData }) {
  const { menu } = useMenu(initialMenu);
  const venue = menu.venue;
  const locale = useSyncExternalStore(subscribeLocale, readLocale, () => "tr" as Locale);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("imza");
  const [selected, setSelected] = useState<Product | null>(null);
  const scrollingToRef = useRef<string | null>(null);
  const t = getUi(locale);

  function toggleLocale() {
    const next: Locale = locale === "tr" ? "en" : "tr";
    window.localStorage.setItem(LANG_KEY, next);
    window.dispatchEvent(new Event("mavi-locale-change"));
  }

  const categories = useMemo(
    () => [...menu.categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [menu.categories]
  );
  const featured = useMemo(
    () => menu.products.filter((product) => product.featured),
    [menu.products]
  );

  const sections = useMemo(() => {
    const list: { id: string; title: string; products: Product[] }[] = [];
    const filteredFeatured = featured.filter(
      (product) =>
        matchesSearch(product.name, query) ||
        matchesSearch(product.nameEn || "", query)
    );
    if (filteredFeatured.length > 0) {
      list.push({
        id: "imza",
        title: translateCategory(locale, "imza", t.signature),
        products: filteredFeatured,
      });
    }
    for (const category of categories) {
      const products = menu.products.filter(
        (product) =>
          product.categoryId === category.id &&
          (matchesSearch(product.name, query) ||
            matchesSearch(product.nameEn || "", query))
      );
      if (products.length > 0) {
        list.push({
          id: category.id,
          title:
            locale === "en"
              ? localizedCategoryName(category, "en") ||
                translateCategory(locale, category.id, category.name)
              : category.name,
          products,
        });
      }
    }
    return list;
  }, [categories, featured, locale, menu.products, query, t.signature]);

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
  const searching = query.trim().length > 0;
  const visibleProductCount = useMemo(() => {
    const ids = new Set<string>();
    for (const section of sections) {
      for (const product of section.products) ids.add(product.id);
    }
    return ids.size;
  }, [sections]);
  const totalProductCount = menu.products.length;
  const productCountLabel = searching
    ? t.productsAvailable(visibleProductCount)
    : t.productsAvailable(totalProductCount);

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <BalloonField />

      <div className="relative z-10 mx-auto w-full max-w-lg px-3 py-4 sm:max-w-5xl sm:px-6 sm:py-5 lg:px-10">
        <header className="relative isolate min-h-[44svh] overflow-hidden rounded-[1.5rem] shadow-[0_4px_10px_rgba(40,32,20,0.06),0_18px_40px_rgba(40,32,20,0.14),0_36px_64px_rgba(40,32,20,0.08)] ring-1 ring-black/5 sm:min-h-[52svh] sm:rounded-[1.75rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={venue.heroImage || "/brand/hero.webp"}
            alt={venue.brandName}
            className="absolute inset-0 h-full w-full object-cover [filter:contrast(1.08)_saturate(1.06)_brightness(1.04)]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/18 to-slate-950/8" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/35 via-transparent to-transparent" />

          <div className="relative flex h-full min-h-[44svh] flex-col justify-between p-4 sm:min-h-[52svh] sm:p-7 lg:p-9">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.28em] text-sky-100 uppercase">
                  {venue.tagline}
                </p>
                <h1 className="mt-2 font-heading text-4xl leading-[0.95] font-semibold text-white sm:text-5xl lg:text-6xl">
                  {venue.headline}
                </h1>
                <p className="mt-3 max-w-md text-base font-medium text-white/95 sm:text-lg">
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
                  <p className="font-heading text-3xl font-semibold tracking-wide text-white sm:text-4xl">
                    {venue.brandName}
                  </p>
                  <p className="mt-1 text-sm font-medium text-white/90">
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
                    {t.location}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <nav className="sticky top-0 z-20 mt-4 rounded-2xl bg-[#fcfbf9]/96 px-3 py-3 shadow-[0_1px_2px_rgba(40,32,20,0.03),0_8px_20px_rgba(40,32,20,0.07),0_18px_36px_rgba(40,32,20,0.04)] ring-1 ring-black/[0.04] backdrop-blur-md sm:mt-5 sm:px-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[#007AFF] uppercase">
                {t.menuExplore}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                {productCountLabel}
              </p>
            </div>
          </div>
          <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
          <div className="relative mt-2.5">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.searchPlaceholder}
              className="h-11 w-full rounded-full border-0 bg-[#f0ede8] pr-10 pl-10 text-sm font-medium text-slate-900 outline-none shadow-[inset_0_1px_2px_rgba(40,32,20,0.04)] ring-1 ring-black/[0.04] placeholder:text-slate-400 focus:bg-[#fcfbf9] focus:shadow-[0_4px_14px_rgba(0,122,255,0.1)] focus:ring-2 focus:ring-[#007AFF]/25"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 hover:bg-black/5"
                aria-label="Clear"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
        </nav>

        <main className="mt-4 space-y-9 pb-24 sm:mt-5 sm:space-y-12">
          {sections.length === 0 ? (
            <EmptyState
              title={searching ? t.searchEmpty : t.menuPreparing}
              body={searching ? t.searchEmptyBody : t.menuPreparingBody}
            />
          ) : (
            sections.map((section) => (
              <section
                key={section.id}
                id={`section-${section.id}`}
                className="scroll-mt-36"
              >
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#007AFF]/12 text-[#007AFF] ring-1 ring-[#007AFF]/20">
                      <UtensilsCrossed className="size-4" aria-hidden />
                    </span>
                    <h2 className="min-w-0 flex-1 font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">
                      {section.title}
                    </h2>
                    <span className="shrink-0 rounded-full bg-[#fcfbf9] px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-[0_2px_6px_rgba(40,32,20,0.06)] ring-1 ring-black/[0.04]">
                      {t.productsInCategory(section.products.length)}
                    </span>
                  </div>
                  {section.id === "imza" && !searching ? (
                    <p className="mt-1 pl-[2.75rem] text-sm font-medium text-slate-600">
                      {t.signatureHint}
                    </p>
                  ) : null}
                </div>

                {section.id === "imza" && !searching ? (
                  <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 py-3 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {section.products.map((product) => {
                      const localized = localizedProduct(product, locale);
                      return (
                        <ProductCard
                          key={`featured-${product.id}`}
                          product={{ ...product, ...localized }}
                          featured
                          variant="featured"
                          onSelect={() => setSelected(product)}
                          chefPickLabel={t.chefPick}
                          chefPickShortLabel={t.chefPickShort}
                          noPhotoLabel={t.noPhoto}
                          className="w-[72vw] max-w-[260px] shrink-0 snap-start sm:w-[220px]"
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {section.products.map((product) => {
                      const localized = localizedProduct(product, locale);
                      return (
                        <ProductCard
                          key={product.id}
                          product={{ ...product, ...localized }}
                          variant="list"
                          onSelect={() => setSelected(product)}
                          chefPickLabel={t.chefPick}
                          chefPickShortLabel={t.chefPickShort}
                          noPhotoLabel={t.noPhoto}
                        />
                      );
                    })}
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
              <p className="mt-1 text-sm text-slate-500">{t.footerTagline}</p>
              <p className="mt-4 text-sm text-slate-500">{venue.city}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {tel ? (
                  <ContactIcon href={tel} label={t.phone}>
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
                  <ContactIcon href={maps} label={t.location}>
                    <MapPin className="size-4" />
                  </ContactIcon>
                ) : null}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium tracking-[0.2em] text-[#007AFF] uppercase">
                {t.hours}
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                {venue.hours.map((row) => (
                  <li key={row.id} className="flex justify-between gap-4">
                    <span>{translateHourLabel(locale, row.label)}</span>
                    <span className="text-slate-800">
                      {translateHourValue(locale, row.value)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </footer>
      </div>

      <button
        type="button"
        onClick={toggleLocale}
        aria-label={t.langSwitchAria}
        className="fixed right-4 bottom-4 z-40 inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-[#007AFF] px-3.5 text-sm font-bold text-white shadow-[0_10px_28px_rgba(0,122,255,0.35)] ring-1 ring-white/40 transition hover:bg-[#0066d6] active:scale-95"
      >
        {t.langSwitch}
      </button>

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
                  alt={localizedProduct(selected, locale).name}
                  className="h-52 w-full shrink-0 object-cover sm:h-56"
                />
              ) : null}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
                <DialogHeader className="gap-2 text-left">
                  <DialogTitle className="font-heading text-2xl font-semibold text-slate-900">
                    {localizedProduct(selected, locale).name}
                  </DialogTitle>
                  <p className="text-2xl font-bold text-[#007AFF]">
                    {formatPrice(selected.price)}
                  </p>
                </DialogHeader>

                <div className="mt-5 space-y-4">
                  <section>
                    <h3 className="text-xs font-bold tracking-[0.16em] text-slate-400 uppercase">
                      {t.content}
                    </h3>
                    <DialogDescription className="mt-1.5 whitespace-pre-wrap text-base leading-relaxed font-medium text-slate-700">
                      {localizedProduct(selected, locale).description ||
                        t.productFallback}
                    </DialogDescription>
                  </section>
                  <section>
                    <h3 className="text-xs font-bold tracking-[0.16em] text-slate-400 uppercase">
                      {t.allergens}
                    </h3>
                    <p className="mt-1.5 whitespace-pre-wrap text-base leading-relaxed font-medium text-slate-700">
                      {localizedProduct(selected, locale).allergens?.trim()
                        ? localizedProduct(selected, locale).allergens
                        : t.allergensNone}
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
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold transition-colors",
        active
          ? "bg-[#007AFF] text-white shadow-[0_4px_12px_rgba(0,122,255,0.28)]"
          : "bg-[#fcfbf9] text-slate-700 shadow-[0_2px_6px_rgba(40,32,20,0.06)] ring-1 ring-black/[0.04] hover:shadow-[0_4px_12px_rgba(40,32,20,0.09)]"
      )}
    >
      <UtensilsCrossed className="size-3.5 opacity-90" aria-hidden />
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
    <div className="rounded-[1.5rem] bg-[#fcfbf9] px-6 py-16 text-center shadow-[0_6px_20px_rgba(40,32,20,0.07)] ring-1 ring-black/[0.04]">
      <h2 className="font-heading text-2xl text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{body}</p>
    </div>
  );
}
