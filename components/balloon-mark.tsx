export function BalloonMark({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 72 92"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id="balloonFill" x1="18" y1="4" x2="58" y2="62">
          <stop offset="0%" stopColor="#8fd0ff" />
          <stop offset="55%" stopColor="#3b9eff" />
          <stop offset="100%" stopColor="#1d6fd6" />
        </linearGradient>
      </defs>
      <ellipse cx="36" cy="32" rx="24" ry="30" fill="url(#balloonFill)" />
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

export function BalloonField() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <BalloonMark className="absolute -top-6 right-6 h-28 w-20 opacity-25 blur-[0.5px]" />
      <BalloonMark className="absolute top-16 -left-4 h-16 w-12 rotate-[-18deg] opacity-20" />
      <BalloonMark className="absolute top-4 left-1/3 h-10 w-8 rotate-[12deg] opacity-15" />
      <div className="absolute -bottom-24 left-1/2 h-56 w-[42rem] -translate-x-1/2 rounded-full bg-sky-400/15 blur-3xl" />
    </div>
  );
}
