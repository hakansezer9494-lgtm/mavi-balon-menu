export const DEFAULT_ORDER_CONFIRM_REMINDER_MINUTES = 3;

export const ORDER_CONFIRM_REMINDER_OPTIONS = [
  { minutes: 1, label: "1 dakika" },
  { minutes: 2, label: "2 dakika" },
  { minutes: 3, label: "3 dakika" },
  { minutes: 5, label: "5 dakika" },
  { minutes: 7, label: "7 dakika" },
  { minutes: 10, label: "10 dakika" },
  { minutes: 15, label: "15 dakika" },
] as const;

export type OrderConfirmReminderMinutes =
  (typeof ORDER_CONFIRM_REMINDER_OPTIONS)[number]["minutes"];

export function isOrderConfirmReminderMinutes(
  value: number
): value is OrderConfirmReminderMinutes {
  return ORDER_CONFIRM_REMINDER_OPTIONS.some(
    (option) => option.minutes === value
  );
}

export function clampOrderConfirmReminderMinutes(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_ORDER_CONFIRM_REMINDER_MINUTES;
  const rounded = Math.round(value);
  if (rounded < 1) return 1;
  if (rounded > 60) return 60;
  return rounded;
}
