"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

type UseMenuOptions = {
  /** Guest menu polling. Admin should pass false. Default 20s. */
  pollMs?: number | false;
};

export function useMenu(
  initialMenu: MenuData = defaultMenu,
  options: UseMenuOptions = {}
) {
  const pollMs = options.pollMs === false ? 0 : (options.pollMs ?? 20_000);
  const [menu, setMenu] = useState<MenuData>(initialMenu);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const menuRef = useRef(menu);
  const savingRef = useRef(false);
  const genRef = useRef(0);
  const writeChainRef = useRef<Promise<void>>(Promise.resolve());

  menuRef.current = menu;

  const refresh = useCallback(async () => {
    if (savingRef.current) return;
    const gen = genRef.current;
    try {
      const next = await fetchMenu();
      if (savingRef.current || gen !== genRef.current) return;
      menuRef.current = next;
      setMenu(next);
    } catch {
      // keep the last good menu on the screen
    }
  }, []);

  useEffect(() => {
    if (pollMs <= 0) return;

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
    }, pollMs);

    window.addEventListener(MENU_UPDATED_EVENT, onUpdate);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(MENU_UPDATED_EVENT, onUpdate);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pollMs, refresh]);

  const updateMenu = useCallback(
    (next: MenuData | ((current: MenuData) => MenuData)) => {
      const job = writeChainRef.current.then(async () => {
        const resolved =
          typeof next === "function" ? next(menuRef.current) : next;
        genRef.current += 1;
        menuRef.current = resolved;
        setMenu(resolved);
        savingRef.current = true;
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
          menuRef.current = saved;
          setMenu(saved);
          window.dispatchEvent(new Event(MENU_UPDATED_EVENT));
        } catch (error) {
          setSaveError(
            error instanceof Error && error.message === "unauthorized"
              ? "Oturum kapandı. Tekrar giriş yapın."
              : "Kaydedilemedi. Bağlantıyı kontrol edip tekrar deneyin."
          );
          savingRef.current = false;
          await refresh();
        } finally {
          savingRef.current = false;
          setSaving(false);
        }
      });
      writeChainRef.current = job.then(
        () => undefined,
        () => undefined
      );
      return job;
    },
    [refresh]
  );

  return { menu, updateMenu, saving, saveError, refresh };
}
