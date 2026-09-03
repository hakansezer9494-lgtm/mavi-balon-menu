import Link from "next/link";
import { BalloonMark } from "@/components/balloon-mark";

export function SiteHeader({
  eyebrow = "Dijital menü",
  compact = false,
}: {
  eyebrow?: string;
  compact?: boolean;
}) {
  return (
    <header className={compact ? "px-4 py-5" : "px-4 pb-6 pt-8 sm:pt-10"}>
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <BalloonMark className="h-12 w-9 drop-shadow-[0_8px_18px_rgba(59,158,255,0.45)]" />
          <div>
            <p className="text-[11px] font-medium tracking-[0.22em] text-sky-300/80 uppercase">
              {eyebrow}
            </p>
            <h1 className="font-heading text-3xl leading-none text-white sm:text-4xl">
              Mavi Balon
            </h1>
          </div>
        </Link>
      </div>
    </header>
  );
}
