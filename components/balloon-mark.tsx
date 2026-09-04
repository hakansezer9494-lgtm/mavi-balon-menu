"use client";

import type { CSSProperties } from "react";
import { useId } from "react";

export function BalloonMark({
  className,
  title,
  style,
}: {
  className?: string;
  title?: string;
  style?: CSSProperties;
}) {
  const gradId = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 72 92"
      className={className}
      style={style}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={gradId} x1="18" y1="4" x2="58" y2="62">
          <stop offset="0%" stopColor="#8fd0ff" />
          <stop offset="55%" stopColor="#3b9eff" />
          <stop offset="100%" stopColor="#1d6fd6" />
        </linearGradient>
      </defs>
      <ellipse cx="36" cy="32" rx="24" ry="30" fill={`url(#${gradId})`} />
      <ellipse cx="26" cy="20" rx="7" ry="11" fill="#d7efff" opacity="0.55" />
      <path d="M36 61.5 L32 67 H40 Z" fill="#2a7ad8" />
      <path
        d="M36 67 C33 74 40 78 36 88"
        fill="none"
        stroke="#9fd4ff"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

const balloons = [
  { top: "6%", left: "8%", size: "h-20 w-14", delay: "0s", duration: "18s", opacity: "opacity-[0.22]", rotate: "rotate-[-12deg]" },
  { top: "18%", left: "78%", size: "h-24 w-16", delay: "2s", duration: "22s", opacity: "opacity-[0.24]", rotate: "rotate-[10deg]" },
  { top: "42%", left: "4%", size: "h-14 w-10", delay: "4s", duration: "16s", opacity: "opacity-[0.18]", rotate: "rotate-[8deg]" },
  { top: "58%", left: "86%", size: "h-16 w-12", delay: "1s", duration: "20s", opacity: "opacity-[0.2]", rotate: "rotate-[-6deg]" },
  { top: "72%", left: "18%", size: "h-12 w-9", delay: "3s", duration: "19s", opacity: "opacity-[0.16]", rotate: "rotate-[14deg]" },
  { top: "28%", left: "48%", size: "h-11 w-8", delay: "5s", duration: "24s", opacity: "opacity-[0.15]", rotate: "rotate-[-4deg]" },
  { top: "85%", left: "62%", size: "h-18 w-14", delay: "2.5s", duration: "21s", opacity: "opacity-[0.18]", rotate: "rotate-[6deg]" },
  { top: "8%", left: "38%", size: "h-14 w-10", delay: "6s", duration: "17s", opacity: "opacity-[0.16]", rotate: "rotate-[-16deg]" },
];

export function BalloonField() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_90%_-10%,rgba(59,158,255,0.08),transparent_55%),radial-gradient(700px_380px_at_0%_100%,rgba(125,200,255,0.07),transparent_50%)]" />
      {balloons.map((balloon, index) => (
        <BalloonMark
          key={index}
          className={`balloon-float absolute ${balloon.size} ${balloon.opacity} ${balloon.rotate}`}
          style={{
            top: balloon.top,
            left: balloon.left,
            animationDelay: balloon.delay,
            animationDuration: balloon.duration,
          }}
        />
      ))}
    </div>
  );
}
