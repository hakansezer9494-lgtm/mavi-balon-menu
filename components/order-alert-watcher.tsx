"use client";

import { useEffect, useRef } from "react";
import { getStoredAdminPassword } from "@/hooks/use-menu";
import { formatPrice } from "@/lib/menu";
import {
  announceForgottenOrder,
  announceNewOrder,
  ensureNotificationPermission,
  unlockOrderAlerts,
} from "@/lib/order-alerts";
import { DEFAULT_ORDER_CONFIRM_REMINDER_MINUTES } from "@/lib/order-confirm-reminder";
import { isOrderForgotten, type Order } from "@/lib/orders";

/**
 * Keeps polling for new and forgotten orders while any /yonetim page is open,
 * including when the browser tab is in the background.
 */
export function OrderAlertWatcher() {
  const knownRef = useRef<Map<string, string> | null>(null);
  const forgottenAnnouncedRef = useRef<Map<string, number>>(new Map());
  const reminderMinutesRef = useRef(DEFAULT_ORDER_CONFIRM_REMINDER_MINUTES);
  const unlockedRef = useRef(false);

  useEffect(() => {
    const unlock = () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      unlockOrderAlerts();
      ensureNotificationPermission();
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    unlockOrderAlerts();
    ensureNotificationPermission();

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: number | null = null;
    let inFlight = false;

    async function refreshReminderMinutes() {
      try {
        const response = await fetch("/api/admin/order-confirm-reminder", {
          cache: "no-store",
          headers: {
            "x-admin-password": getStoredAdminPassword(),
          },
        });
        if (!response.ok) return;
        const data = (await response.json()) as { minutes?: number };
        if (typeof data.minutes === "number" && Number.isFinite(data.minutes)) {
          reminderMinutesRef.current = data.minutes;
        }
      } catch {
        // keep previous
      }
    }

    async function tick(announce: boolean) {
      if (cancelled || inFlight) return;
      inFlight = true;
      try {
        const response = await fetch("/api/orders", {
          cache: "no-store",
          headers: {
            "x-admin-password": getStoredAdminPassword(),
          },
        });
        if (!response.ok) return;
        const data = (await response.json()) as { orders?: Order[] };
        const next = Array.isArray(data.orders) ? data.orders : [];
        const minutes = reminderMinutesRef.current;
        const now = Date.now();

        if (announce && knownRef.current) {
          const fresh = next.filter((order) => {
            if (order.status !== "new") return false;
            if (order.confirmedAt) return false;
            const prev = knownRef.current!.get(order.id);
            return prev === undefined || prev !== order.updatedAt;
          });
          if (fresh.length > 0) {
            const first = fresh[0];
            announceNewOrder({
              tableNumber: first.tableNumber,
              customerName: first.customerName,
              totalLabel: formatPrice(first.total),
            });
          }
        }

        const activeIds = new Set(next.map((order) => order.id));
        for (const id of [...forgottenAnnouncedRef.current.keys()]) {
          if (!activeIds.has(id)) forgottenAnnouncedRef.current.delete(id);
        }

        if (announce) {
          for (const order of next) {
            if (!isOrderForgotten(order, minutes, now)) {
              forgottenAnnouncedRef.current.delete(order.id);
              continue;
            }
            const lastAt = forgottenAnnouncedRef.current.get(order.id) ?? 0;
            // Re-alert every reminder window while still unconfirmed.
            if (now - lastAt < minutes * 60_000) continue;
            forgottenAnnouncedRef.current.set(order.id, now);
            announceForgottenOrder({
              tableNumber: order.tableNumber,
              customerName: order.customerName,
              totalLabel: formatPrice(order.total),
            });
          }
        }

        knownRef.current = new Map(
          next.map((order) => [order.id, order.updatedAt])
        );
      } catch {
        // keep trying
      } finally {
        inFlight = false;
      }
    }

    void refreshReminderMinutes();
    void tick(false);
    const reminderTimer = window.setInterval(() => {
      void refreshReminderMinutes();
    }, 30_000);

    const schedule = () => {
      if (timer) window.clearInterval(timer);
      const ms = document.hidden ? 2500 : 3500;
      timer = window.setInterval(() => {
        void tick(true);
      }, ms);
    };

    schedule();
    const onVisibility = () => {
      schedule();
      if (!document.hidden) {
        void tick(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      window.clearInterval(reminderTimer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
