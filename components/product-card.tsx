import { formatPrice, type Product } from "@/lib/menu";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="overflow-hidden rounded-2xl bg-[oklch(0.22_0.04_250)] ring-1 ring-white/10">
      <div className="relative aspect-[4/3] bg-[oklch(0.18_0.04_250)]">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-sky-200/60">
            Fotoğraf yok
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[oklch(0.22_0.04_250)] to-transparent" />
      </div>
      <div className="space-y-2 px-4 pb-4 pt-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-lg leading-tight text-white">
            {product.name}
          </h3>
          <p className="shrink-0 rounded-full bg-sky-400/15 px-2.5 py-1 text-sm font-semibold text-sky-200">
            {formatPrice(product.price)}
          </p>
        </div>
        {product.description ? (
          <p className="text-sm leading-relaxed text-sky-100/65">
            {product.description}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-[oklch(0.22_0.04_250)] ring-1 ring-white/10">
      <div className="aspect-[4/3] animate-pulse bg-white/5" />
      <div className="space-y-2 px-4 py-4">
        <div className="h-5 w-2/3 animate-pulse rounded bg-white/8" />
        <div className="h-4 w-full animate-pulse rounded bg-white/6" />
      </div>
    </div>
  );
}
