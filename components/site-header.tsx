import type { ReactNode } from "react";
import Link from "next/link";
import { BalloonMark } from "@/components/balloon-mark";

export function SiteHeader({
  eyebrow = "Dijital menü",
  compact = false,
  actions,
}: {
  eyebrow?: string;
  compact?: boolean;
  actions?: ReactNode;
}) {
  return (
    <header className={compact ? "px-4 py-5" : "px-4 pb-6 pt-8 sm:pt-10"}>
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#007AFF]/10 ring-1 ring-[#007AFF]/25">
            <BalloonMark className="h-7 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium tracking-[0.22em] text-[#007AFF]/80 uppercase">
              {eyebrow}
            </p>
            <h1 className="font-heading text-3xl leading-none text-slate-900 sm:text-4xl">
              Mavi Balloon
            </h1>
          </div>
        </Link>
        {actions}
      </div>
    </header>
  );
}
