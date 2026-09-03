"use client";

import { useCallback, useEffect, useState } from "react";
import {
  defaultMenu,
  MENU_UPDATED_EVENT,
  type MenuData,
} from "@/lib/menu";

const ADMIN_PASSWORD_KEY = "mavi-balon-admin-password";

export function getStoredAdminPassword() {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(ADMIN_PASSWORD_KEY) ?? "";
}

export function setStoredAdminPassword(password: string) {
  window.sessionStorage.setItem(ADMIN_PASSWORD_KEY, password);
}

export function clearStoredAdminPassword() {
  window.sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
}

async function fetchMenu() {
  const response = await fetch("/api/menu", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Menü okunamadı.");
  }
  return (await response.json()) as MenuData;
}

export function useMenu(initialMenu: MenuData = defaultMenu) {
  const [menu, setMenu] = useState<MenuData>(initialMenu);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const next = await fetchMenu();
      setMenu(next);
    } catch {
      // keep the last good menu on the screen
    }
  }, []);

  useEffect(() => {
    const onUpdate = () => {
      void refresh();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };
    const timer = window.setInterval(() => {
      void refresh();
    }, 8000);

    window.addEventListener(MENU_UPDATED_EVENT, onUpdate);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(MENU_UPDATED_EVENT, onUpdate);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const updateMenu = useCallback(
    async (next: MenuData | ((current: MenuData) => MenuData)) => {
      const resolved = typeof next === "function" ? next(menu) : next;
      setMenu(resolved);
      setSaving(true);
      setSaveError("");
      try {
        const response = await fetch("/api/menu", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-admin-password": getStoredAdminPassword(),
          },
          body: JSON.stringify(resolved),
        });
        if (response.status === 401) {
          clearStoredAdminPassword();
          throw new Error("unauthorized");
        }
        if (!response.ok) {
          throw new Error("Menü kaydedilemedi.");
        }
        const saved = (await response.json()) as MenuData;
        setMenu(saved);
        window.dispatchEvent(new Event(MENU_UPDATED_EVENT));
      } catch (error) {
        setSaveError(
          error instanceof Error && error.message === "unauthorized"
            ? "Oturum kapandı. Tekrar giriş yapın."
            : "Kaydedilemedi. Bağlantıyı kontrol edip tekrar deneyin."
        );
        await refresh();
      } finally {
        setSaving(false);
      }
    },
    [menu, refresh]
  );

  return { menu, updateMenu, saving, saveError, refresh };
}
