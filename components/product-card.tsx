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
      <div className="relative aspect-[4/3] overflow-hidden bg-[#14100a]">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-cream/50">
            Fotoğraf yok
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080705] via-[#080705]/20 to-transparent" />
        {featured || product.featured ? (
          <span className="absolute top-3 left-3 rounded-full bg-gold/90 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-[#14100a] uppercase">
            Şefin Seçimi
          </span>
        ) : null}
        <p className="absolute right-3 bottom-3 rounded-full bg-[#080705]/75 px-2.5 py-1 text-sm font-semibold text-gold ring-1 ring-gold/30 backdrop-blur-sm">
          {formatPrice(product.price)}
        </p>
      </div>
      <div className="space-y-2 px-4 pt-3 pb-4 text-left">
        <h3 className="font-heading text-xl leading-tight text-[#fff4dd]">
          {product.name}
        </h3>
        {product.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-cream/65">
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
          "group overflow-hidden rounded-[1.5rem] bg-[#120e0a] text-left ring-1 ring-gold/12 transition hover:ring-gold/35",
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
        "group overflow-hidden rounded-[1.5rem] bg-[#120e0a] ring-1 ring-gold/12",
        className
      )}
    >
      {inner}
    </article>
  );
}
