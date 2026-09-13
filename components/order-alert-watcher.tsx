"use client";

import { useEffect, useRef } from "react";
import { getStoredAdminPassword } from "@/hooks/use-menu";
import { formatPrice } from "@/lib/menu";
import {
  announceNewOrder,
  ensureNotificationPermission,
  unlockOrderAlerts,
} from "@/lib/order-alerts";
import type { Order } from "@/lib/orders";

/**
 * Keeps polling for new orders while any /yonetim page is open,
 * including when the browser tab is in the background.
 */
export function OrderAlertWatcher() {
  const knownRef = useRef<Map<string, string> | null>(null);
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
    // If staff already interacted earlier in this session, unlock immediately.
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
        if (announce && knownRef.current) {
          const fresh = next.filter((order) => {
            if (order.status !== "new") return false;
            const prev = knownRef.current!.get(order.id);
            return prev === undefined || prev !== order.updatedAt;
          });
          if (fresh.length > 0) {
            const first = fresh[0];
            announceNewOrder({
              tableNumber: first.tableNumber,
              totalLabel: formatPrice(first.total),
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

    void tick(false);

    // Faster while visible; still poll when hidden (browser may throttle).
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
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
