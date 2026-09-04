import { formatPrice, type Product } from "@/lib/menu";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  onSelect,
  featured = false,
  className,
}: {
  product: Product;
  onSelect?: (product: Product) => void;
  featured?: boolean;
  className?: string;
}) {
  const inner = (
    <>
      <div className="relative aspect-[5/4] overflow-hidden bg-slate-100">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            Fotoğraf yok
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        {featured || product.featured ? (
          <span className="absolute top-2 left-2 rounded-full bg-[#007AFF] px-2 py-0.5 text-[9px] font-semibold tracking-[0.12em] text-white uppercase">
            Şefin Seçimi
          </span>
        ) : null}
        <p className="absolute right-2 bottom-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-[#007AFF] shadow-sm">
          {formatPrice(product.price)}
        </p>
      </div>
      <div className="space-y-1 px-3 pt-2.5 pb-3 text-left">
        <h3 className="font-heading text-lg leading-tight text-slate-900">
          {product.name}
        </h3>
        {product.description ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
            {product.description}
          </p>
        ) : null}
      </div>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(product)}
        className={cn(
          "group overflow-hidden rounded-2xl bg-white text-left shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80 transition hover:ring-[#007AFF]/35",
          className
        )}
      >
        {inner}
      </button>
    );
  }

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80",
        className
      )}
    >
      {inner}
    </article>
  );
}
