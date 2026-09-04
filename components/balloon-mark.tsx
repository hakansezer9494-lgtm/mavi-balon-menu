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
          <stop offset="0%" stopColor="#5cbcff" />
          <stop offset="40%" stopColor="#1e8fff" />
          <stop offset="100%" stopColor="#0b5fd4" />
        </linearGradient>
      </defs>
      <ellipse cx="36" cy="32" rx="24" ry="30" fill={`url(#${gradId})`} />
      <ellipse cx="26" cy="20" rx="7" ry="11" fill="#ccebff" opacity="0.55" />
      <path d="M36 61.5 L32 67 H40 Z" fill="#0d62d0" />
      <path
        d="M36 67 C33 74 40 78 36 88"
        fill="none"
        stroke="#2f8fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const balloons = [
  { top: "3%", left: "4%", size: "h-20 w-14", delay: "0s", duration: "17s", opacity: "opacity-[0.58]", rotate: "rotate-[-14deg]" },
  { top: "8%", left: "72%", size: "h-28 w-20", delay: "1.2s", duration: "21s", opacity: "opacity-[0.62]", rotate: "rotate-[12deg]" },
  { top: "16%", left: "28%", size: "h-14 w-10", delay: "3s", duration: "15s", opacity: "opacity-[0.5]", rotate: "rotate-[6deg]" },
  { top: "22%", left: "88%", size: "h-16 w-12", delay: "0.6s", duration: "19s", opacity: "opacity-[0.55]", rotate: "rotate-[-8deg]" },
  { top: "32%", left: "10%", size: "h-20 w-14", delay: "4s", duration: "18s", opacity: "opacity-[0.56]", rotate: "rotate-[10deg]" },
  { top: "38%", left: "52%", size: "h-12 w-9", delay: "2.2s", duration: "23s", opacity: "opacity-[0.48]", rotate: "rotate-[-4deg]" },
  { top: "45%", left: "78%", size: "h-24 w-16", delay: "5s", duration: "20s", opacity: "opacity-[0.6]", rotate: "rotate-[8deg]" },
  { top: "52%", left: "2%", size: "h-16 w-12", delay: "1.8s", duration: "16s", opacity: "opacity-[0.52]", rotate: "rotate-[-10deg]" },
  { top: "58%", left: "38%", size: "h-[4.5rem] w-12", delay: "3.5s", duration: "22s", opacity: "opacity-[0.5]", rotate: "rotate-[14deg]" },
  { top: "64%", left: "92%", size: "h-14 w-10", delay: "0.4s", duration: "18s", opacity: "opacity-[0.54]", rotate: "rotate-[-6deg]" },
  { top: "72%", left: "18%", size: "h-20 w-14", delay: "2.8s", duration: "19s", opacity: "opacity-[0.57]", rotate: "rotate-[5deg]" },
  { top: "78%", left: "62%", size: "h-16 w-12", delay: "4.4s", duration: "21s", opacity: "opacity-[0.52]", rotate: "rotate-[-12deg]" },
  { top: "84%", left: "8%", size: "h-12 w-9", delay: "1s", duration: "17s", opacity: "opacity-[0.5]", rotate: "rotate-[9deg]" },
  { top: "88%", left: "48%", size: "h-20 w-14", delay: "3.2s", duration: "24s", opacity: "opacity-[0.55]", rotate: "rotate-[-7deg]" },
  { top: "12%", left: "58%", size: "h-10 w-8", delay: "5.5s", duration: "14s", opacity: "opacity-[0.48]", rotate: "rotate-[16deg]" },
  { top: "48%", left: "24%", size: "h-11 w-8", delay: "6s", duration: "15s", opacity: "opacity-[0.46]", rotate: "rotate-[-18deg]" },
];

export function BalloonField() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_90%_-10%,rgba(30,143,255,0.18),transparent_55%),radial-gradient(700px_380px_at_0%_100%,rgba(11,95,212,0.14),transparent_50%)]" />
      {balloons.map((balloon, index) => (
        <BalloonMark
          key={index}
          className={`balloon-float absolute ${balloon.size} ${balloon.opacity} ${balloon.rotate} drop-shadow-[0_10px_20px_rgba(11,95,212,0.35)]`}
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
