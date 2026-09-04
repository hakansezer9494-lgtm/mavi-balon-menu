import { formatPrice, type Product } from "@/lib/menu";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  onSelect,
  featured = false,
  variant = "list",
  className,
  chefPickLabel = "Şefin Seçimi",
  chefPickShortLabel = "İmza",
  noPhotoLabel = "Fotoğraf yok",
}: {
  product: Product;
  onSelect?: (product: Product) => void;
  featured?: boolean;
  variant?: "list" | "featured";
  className?: string;
  chefPickLabel?: string;
  chefPickShortLabel?: string;
  noPhotoLabel?: string;
}) {
  const showBadge = featured || product.featured;

  const inner =
    variant === "featured" ? (
      <>
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              {noPhotoLabel}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          {showBadge ? (
            <span className="absolute top-2 left-2 rounded-full bg-[#007AFF] px-2 py-0.5 text-[9px] font-bold tracking-[0.1em] text-white uppercase">
              {chefPickLabel}
            </span>
          ) : null}
          <p className="absolute right-2 bottom-2 rounded-full bg-white/95 px-2 py-0.5 text-xs font-bold text-[#007AFF] shadow-sm">
            {formatPrice(product.price)}
          </p>
        </div>
        <div className="space-y-0.5 px-3 py-2.5 text-left">
          <h3 className="font-heading text-base leading-snug font-semibold text-slate-900">
            {product.name}
          </h3>
          {product.description ? (
            <p className="line-clamp-2 text-xs leading-snug font-medium text-slate-600">
              {product.description}
            </p>
          ) : null}
        </div>
      </>
    ) : (
      <>
        <div className="relative h-[4.75rem] w-[4.75rem] shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-24">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
              —
            </div>
          )}
          {showBadge ? (
            <span className="absolute top-1 left-1 rounded-full bg-[#007AFF] px-1.5 py-0.5 text-[8px] font-bold text-white uppercase">
              {chefPickShortLabel}
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1 py-0.5 text-left">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading text-[15px] leading-snug font-semibold text-slate-900">
              {product.name}
            </h3>
            <p className="shrink-0 text-sm font-bold text-[#007AFF]">
              {formatPrice(product.price)}
            </p>
          </div>
          {product.description ? (
            <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-slate-500">
              {product.description}
            </p>
          ) : null}
        </div>
      </>
    );

  const baseClass =
    variant === "featured"
      ? "group overflow-hidden rounded-2xl bg-[#f9f7f4] text-left shadow-[0_1px_1px_rgba(40,32,20,0.02),0_3px_10px_rgba(40,32,20,0.045)] ring-1 ring-black/[0.03] transition active:scale-[0.99]"
      : "group flex w-full items-center gap-3 rounded-2xl bg-[#f9f7f4] p-2.5 text-left shadow-[0_1px_2px_rgba(40,32,20,0.03),0_6px_16px_rgba(40,32,20,0.06),0_14px_28px_rgba(40,32,20,0.04)] ring-1 ring-black/[0.04] transition active:scale-[0.99] active:bg-[#f7f5f1]";

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(product)}
        className={cn(baseClass, className)}
      >
        {inner}
      </button>
    );
  }

  return (
    <article className={cn(baseClass, className)}>{inner}</article>
  );
}
