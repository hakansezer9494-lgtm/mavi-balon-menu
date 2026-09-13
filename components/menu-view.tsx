"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import {
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Search,
  X,
} from "lucide-react";
import { BalloonField, BalloonMark } from "@/components/balloon-mark";
import { CartDrawer, CartFab, type CartLine } from "@/components/cart-drawer";
import { ProductCard } from "@/components/product-card";
import {
  Dialog,
  DialogContent,
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
  HERO_TEXT_SIZE_CLASS,
  instagramHref,
  localizedCategoryName,
  localizedProduct,
  phoneHref,
  type HeroCornerConfig,
  type MenuData,
  type Product,
  type VenueInfo,
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
  const [selectedQty, setSelectedQty] = useState(1);
  const [cartItems, setCartItems] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const scrollingToRef = useRef<string | null>(null);
  const t = getUi(locale);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  function openProduct(product: Product) {
    setSelected(product);
    setSelectedQty(1);
  }

  function addSelectedToCart() {
    if (!selected) return;
    const localized = localizedProduct(selected, locale);
    setCartItems((current) => {
      const existing = current.find((item) => item.productId === selected.id);
      if (existing) {
        return current.map((item) =>
          item.productId === selected.id
            ? { ...item, quantity: item.quantity + selectedQty }
            : item
        );
      }
      return [
        ...current,
        {
          productId: selected.id,
          name: localized.name,
          unitPrice: selected.price,
          quantity: selectedQty,
          description: localized.description,
        },
      ];
    });
    setSelected(null);
    setCartOpen(true);
  }

  function changeCartQty(productId: string, quantity: number) {
    setCartItems((current) =>
      current
        .map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

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
        title:
          locale === "en"
            ? menu.signature?.nameEn || menu.signature?.name || t.signature
            : menu.signature?.name || t.signature,
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
  }, [categories, featured, locale, menu.products, menu.signature, query, t.signature]);

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

  const corners = venue.heroCorners;
  const pageBg = venue.pageBackground || "#fdfcfb";
  const cardColor = venue.productCardColor || "#e9ecef";

  return (
    <div
      className="relative flex min-h-full flex-1 flex-col"
      style={
        {
          backgroundColor: pageBg,
          ["--menu-card-bg" as string]: cardColor,
        } as CSSProperties
      }
    >
      {venue.showBalloons ? <BalloonField /> : null}

      <div className="relative z-10 mx-auto w-full max-w-lg px-3 py-4 sm:max-w-5xl sm:px-6 sm:py-5 lg:px-10">
        <header className="relative isolate min-h-[40svh] overflow-hidden rounded-[1.5rem] shadow-[0_4px_10px_rgba(40,32,20,0.06),0_18px_40px_rgba(40,32,20,0.14),0_36px_64px_rgba(40,32,20,0.08)] ring-1 ring-black/5 sm:min-h-[48svh] sm:rounded-[1.75rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={venue.heroImage || "/brand/hero.webp"}
            alt={venue.brandName || "Menü kapağı"}
            className="absolute inset-0 h-full w-full object-cover [filter:contrast(1.08)_saturate(1.06)_brightness(1.04)]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/15 to-slate-950/5" />

          <div className="relative flex h-full min-h-[40svh] flex-col justify-between gap-4 p-4 sm:min-h-[48svh] sm:p-7 lg:p-9">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <HeroCorner
                  config={corners.topLeft}
                  venue={venue}
                  align="start"
                />
              </div>
              <div className="min-w-0 flex-1">
                <HeroCorner
                  config={corners.topRight}
                  venue={venue}
                  align="end"
                />
              </div>
            </div>

            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0 flex-1">
                <HeroCorner
                  config={corners.bottomLeft}
                  venue={venue}
                  align="start"
                  titleAsHeading
                />
              </div>
              <div className="min-w-0 flex-1">
                <HeroCorner
                  config={corners.bottomRight}
                  venue={venue}
                  align="end"
                />
              </div>
            </div>
          </div>
        </header>

        <nav className="sticky top-0 z-20 mt-4 rounded-2xl bg-[#fcfbf9]/96 px-3 py-3 shadow-[0_1px_2px_rgba(40,32,20,0.03),0_8px_20px_rgba(40,32,20,0.07),0_18px_36px_rgba(40,32,20,0.04)] ring-1 ring-black/[0.04] backdrop-blur-md sm:mt-5 sm:px-4">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                  <h2 className="font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">
                    {section.title}
                  </h2>
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
                          onSelect={() => openProduct(product)}
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
                          onSelect={() => openProduct(product)}
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
              <p className="text-[11px] font-medium tracking-[0.2em] text-[#007AFF] uppercase">
                İletişim
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
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
              {venue.brandName ? (
                <div className="mt-4">
                  <p className="font-heading text-2xl text-slate-900">
                    {venue.brandName}
                  </p>
                  {venue.brandSubtitle ? (
                    <p className="mt-1 text-sm text-slate-500">
                      {venue.brandSubtitle}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4">
                <p className="text-[11px] font-medium tracking-[0.2em] text-[#007AFF] uppercase">
                  {t.days}
                </p>
                <p className="text-right text-[11px] font-medium tracking-[0.2em] text-[#007AFF] uppercase">
                  {t.hours}
                </p>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                {venue.hours.map((row) => (
                  <li
                    key={row.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4"
                  >
                    <span>{translateHourLabel(locale, row.label)}</span>
                    <span className="text-right tabular-nums text-slate-800">
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
                  {localizedProduct(selected, locale).description ? (
                    <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-700">
                      {localizedProduct(selected, locale).description}
                    </p>
                  ) : null}
                  {localizedProduct(selected, locale).allergens?.trim() ? (
                    <p className="text-sm leading-relaxed text-slate-500">
                      {t.allergens}:{" "}
                      {localizedProduct(selected, locale).allergens}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="shrink-0 space-y-3 border-t border-slate-100 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-600">Adet</span>
                  <div className="inline-flex items-center gap-1 rounded-full bg-slate-50 p-1 ring-1 ring-slate-200">
                    <button
                      type="button"
                      className="inline-flex size-9 items-center justify-center rounded-full hover:bg-white"
                      onClick={() =>
                        setSelectedQty((current) => Math.max(1, current - 1))
                      }
                      aria-label="Azalt"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="min-w-8 text-center text-base font-semibold">
                      {selectedQty}
                    </span>
                    <button
                      type="button"
                      className="inline-flex size-9 items-center justify-center rounded-full hover:bg-white"
                      onClick={() => setSelectedQty((current) => current + 1)}
                      aria-label="Artır"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addSelectedToCart}
                  className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#007AFF] text-base font-semibold text-white transition hover:bg-[#0066d6]"
                >
                  Sepete at · {formatPrice(selected.price * selectedQty)}
                </button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <CartFab count={cartCount} onClick={() => setCartOpen(true)} />
      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cartItems}
        onChangeQty={changeCartQty}
        onRemove={(productId) =>
          setCartItems((current) =>
            current.filter((item) => item.productId !== productId)
          )
        }
        onClear={() => setCartItems([])}
      />
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
        "inline-flex shrink-0 items-center rounded-full px-3 py-2 text-[13px] font-semibold transition-colors",
        active
          ? "bg-[#007AFF] text-white shadow-[0_4px_12px_rgba(0,122,255,0.28)]"
          : "bg-[#fcfbf9] text-slate-700 shadow-[0_2px_6px_rgba(40,32,20,0.06)] ring-1 ring-black/[0.04] hover:shadow-[0_4px_12px_rgba(40,32,20,0.09)]"
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
    <div className="rounded-[1.5rem] bg-[#fcfbf9] px-6 py-16 text-center shadow-[0_6px_20px_rgba(40,32,20,0.07)] ring-1 ring-black/[0.04]">
      <h2 className="font-heading text-2xl text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{body}</p>
    </div>
  );
}

function HeroCorner({
  config,
  venue,
  align,
  titleAsHeading = false,
}: {
  config: HeroCornerConfig;
  venue: VenueInfo;
  align: "start" | "end";
  titleAsHeading?: boolean;
}) {
  const badge = config.badgeText.trim();
  const title = config.title.trim();
  const subtitle = config.subtitle.trim();
  const description = config.description.trim();
  const address = config.addressText.trim();
  const cornerLogo = config.logoImage.trim();
  const logoSrc = cornerLogo || (config.showLogo ? venue.logoImage.trim() : "");
  const showLogo = Boolean(logoSrc);
  const maps = venue.mapsUrl.trim();
  const linkMaps = config.linkMaps && Boolean(maps);
  if (!badge && !title && !subtitle && !description && !address && !showLogo)
    return null;

  const locationPin = address ? (
    linkMaps ? (
      <a
        href={maps}
        target="_blank"
        rel="noreferrer"
        aria-label="Konum"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white/95 text-[#007AFF] shadow-sm ring-1 ring-white/70 transition hover:bg-white"
      >
        <MapPin className="size-4" />
      </a>
    ) : (
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white/95 text-[#007AFF] shadow-sm ring-1 ring-white/70">
        <MapPin className="size-4" />
      </span>
    )
  ) : null;

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-2",
        align === "end" ? "items-end text-right" : "items-start text-left"
      )}
    >
      {showLogo ? (
        <div className="rounded-2xl bg-white/95 p-2 shadow-lg ring-1 ring-white/60 backdrop-blur-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc || "/brand/logo-banner.webp"}
            alt={title || venue.brandName || "Logo"}
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
            title={title || venue.brandName || "Logo"}
          />
        </div>
      ) : null}

      {badge ? (
        <div
          className={cn(
            "w-fit rounded-full bg-white/95 px-3 py-1.5 font-semibold shadow-sm ring-1 ring-white/70",
            HERO_TEXT_SIZE_CLASS[config.badgeStyle.size]
          )}
          style={{ color: config.badgeStyle.color }}
        >
          {badge}
        </div>
      ) : null}

      {title ? (
        titleAsHeading ? (
          <h1
            className={cn(
              "font-heading font-semibold tracking-wide",
              HERO_TEXT_SIZE_CLASS[config.titleStyle.size]
            )}
            style={{ color: config.titleStyle.color }}
          >
            {title}
          </h1>
        ) : (
          <p
            className={cn(
              "font-heading font-semibold tracking-wide",
              HERO_TEXT_SIZE_CLASS[config.titleStyle.size]
            )}
            style={{ color: config.titleStyle.color }}
          >
            {title}
          </p>
        )
      ) : null}

      {subtitle ? (
        <p
          className={cn(
            "max-w-[14.5rem] font-medium",
            HERO_TEXT_SIZE_CLASS[config.subtitleStyle.size],
            align === "end" ? "text-right" : "text-left"
          )}
          style={{ color: config.subtitleStyle.color }}
        >
          {subtitle}
        </p>
      ) : null}

      {description ? (
        <p
          className={cn(
            "max-w-[14.5rem] whitespace-pre-line font-medium",
            HERO_TEXT_SIZE_CLASS[config.descriptionStyle.size],
            align === "end" ? "text-right" : "text-left"
          )}
          style={{ color: config.descriptionStyle.color }}
        >
          {description}
        </p>
      ) : null}

      {locationPin || address ? (
        <div
          className={cn(
            "flex w-max max-w-[14.5rem] flex-col gap-1.5",
            align === "end" ? "items-end" : "items-start"
          )}
        >
          {locationPin}
          {address ? (
            linkMaps ? (
              <a
                href={maps}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "block w-full whitespace-pre-line font-medium",
                  HERO_TEXT_SIZE_CLASS[config.addressStyle.size],
                  align === "end" ? "text-right" : "text-left"
                )}
                style={{ color: config.addressStyle.color }}
              >
                {address}
              </a>
            ) : (
              <p
                className={cn(
                  "w-full whitespace-pre-line font-medium",
                  HERO_TEXT_SIZE_CLASS[config.addressStyle.size],
                  align === "end" ? "text-right" : "text-left"
                )}
                style={{ color: config.addressStyle.color }}
              >
                {address}
              </p>
            )
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
