"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  defaultMenu,
  loadMenu,
  MENU_STORAGE_KEY,
  MENU_UPDATED_EVENT,
  saveMenu,
  type MenuData,
} from "@/lib/menu";

function subscribe(onStoreChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === MENU_STORAGE_KEY || event.key === null) {
      onStoreChange();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(MENU_UPDATED_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(MENU_UPDATED_EVENT, onStoreChange);
  };
}

let snapshotRaw = "__uninitialized__";
let snapshotMenu: MenuData = defaultMenu;

function getSnapshot() {
  const raw = window.localStorage.getItem(MENU_STORAGE_KEY) ?? "";
  if (raw === snapshotRaw) return snapshotMenu;
  snapshotRaw = raw;
  snapshotMenu = loadMenu();
  return snapshotMenu;
}

function getServerSnapshot(): MenuData {
  return defaultMenu;
}

export function useMenu() {
  const menu = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const updateMenu = useCallback((next: MenuData | ((current: MenuData) => MenuData)) => {
    const base = loadMenu();
    const resolved = typeof next === "function" ? next(base) : next;
    saveMenu(resolved);
  }, []);

  return { menu, ready: true, updateMenu };
}
