import { getAppSetting, setAppSetting } from "@/lib/menu-store";
import {
  clampOrderConfirmReminderMinutes,
  DEFAULT_ORDER_CONFIRM_REMINDER_MINUTES,
} from "@/lib/order-confirm-reminder";

const REMINDER_KEY = "order_confirm_reminder_minutes";

export async function getOrderConfirmReminderMinutes(): Promise<number> {
  const raw = await getAppSetting(REMINDER_KEY);
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return DEFAULT_ORDER_CONFIRM_REMINDER_MINUTES;
  return clampOrderConfirmReminderMinutes(parsed);
}

export async function setOrderConfirmReminderMinutes(minutes: number) {
  const next = clampOrderConfirmReminderMinutes(minutes);
  await setAppSetting(REMINDER_KEY, String(next));
  return next;
}
