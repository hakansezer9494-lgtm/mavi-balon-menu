export const DEFAULT_PAID_ORDER_RETENTION_DAYS = 730;

export const PAID_ORDER_RETENTION_OPTIONS = [
  {
    days: 7,
    label: "7 gün",
    description: "Ödenen siparişler bir hafta sonra silinir.",
  },
  {
    days: 30,
    label: "30 gün",
    description: "Ödenen siparişler bir ay sonra silinir.",
  },
  {
    days: 90,
    label: "3 ay",
    description: "Ödenen siparişler üç ay sonra silinir.",
  },
  {
    days: 180,
    label: "6 ay",
    description: "Ödenen siparişler altı ay sonra silinir.",
  },
  {
    days: 365,
    label: "1 yıl",
    description: "Ödenen siparişler bir yıl sonra silinir.",
  },
  {
    days: 730,
    label: "2 yıl",
    description: "Ödenen siparişler iki yıl sonra silinir (varsayılan).",
  },
] as const;

export type PaidOrderRetentionDays =
  (typeof PAID_ORDER_RETENTION_OPTIONS)[number]["days"];

export function isPaidOrderRetentionDays(
  value: number
): value is PaidOrderRetentionDays {
  return PAID_ORDER_RETENTION_OPTIONS.some((option) => option.days === value);
}

export function getPaidOrderRetentionCutoff(
  days: number,
  now = new Date()
): Date {
  const cutoff = new Date(now.getTime());
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  return cutoff;
}
