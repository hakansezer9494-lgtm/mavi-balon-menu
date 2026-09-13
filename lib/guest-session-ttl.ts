export const DEFAULT_GUEST_SESSION_TTL_MINUTES = 60;

export const GUEST_SESSION_TTL_OPTIONS = [
  { minutes: 15, label: "15 dakika" },
  { minutes: 30, label: "30 dakika" },
  { minutes: 45, label: "45 dakika" },
  { minutes: 60, label: "1 saat" },
  { minutes: 90, label: "1.5 saat" },
  { minutes: 120, label: "2 saat" },
  { minutes: 180, label: "3 saat" },
] as const;

export function clampGuestSessionTtlMinutes(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_GUEST_SESSION_TTL_MINUTES;
  const rounded = Math.round(value);
  if (rounded < 5) return 5;
  if (rounded > 480) return 480;
  return rounded;
}
