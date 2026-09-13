"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import {
  AdminOrdersPanel,
  type OrdersTheme,
} from "@/components/admin-orders-panel";
import { OrdersReportPanel } from "@/components/orders-report-panel";
import { SiteHeader } from "@/components/site-header";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clearStoredAdminPassword,
  getStoredAdminPassword,
  setStoredAdminPassword,
} from "@/hooks/use-menu";
import {
  ensureNotificationPermission,
  unlockOrderAlerts,
} from "@/lib/order-alerts";
import { cn } from "@/lib/utils";

const THEME_KEY = "mavi-orders-theme";

const lightOutline =
  "border-slate-300 bg-white text-slate-800 hover:bg-slate-100 hover:text-slate-900";
const darkOutline =
  "border-white/30 bg-white/15 text-white hover:bg-white/25 hover:text-white";

type OrdersTab = "active" | "past" | "report";

export function OrdersPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<OrdersTab>("active");
  const [theme, setTheme] = useState<OrdersTheme>("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setNotificationsEnabled(Notification.permission === "granted");
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function checkAuth() {
      try {
        const statusResponse = await fetch("/api/admin/status", {
          cache: "no-store",
        });
        const status = (await statusResponse.json()) as {
          authRequired: boolean;
        };
        if (cancelled) return;
        if (!status.authRequired) {
          setUnlocked(true);
          setAuthChecked(true);
          return;
        }
        const stored = getStoredAdminPassword();
        if (!stored) {
          setUnlocked(false);
          setAuthChecked(true);
          return;
        }
        const loginResponse = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: stored }),
        });
        if (cancelled) return;
        if (loginResponse.ok) {
          setUnlocked(true);
        } else {
          clearStoredAdminPassword();
          setUnlocked(false);
        }
      } catch {
        if (!cancelled) setUnlocked(false);
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    }
    void checkAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleTheme() {
    setTheme((current) => {
      const next = current === "light" ? "dark" : "light";
      window.localStorage.setItem(THEME_KEY, next);
      return next;
    });
  }

  async function handleLogin() {
    setLoginError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      setLoginError("Şifre hatalı.");
      return;
    }
    setStoredAdminPassword(password);
    setUnlocked(true);
  }

  if (!authChecked) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center text-slate-600">
        Siparişler sayfası hazırlanıyor…
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="relative flex min-h-full flex-1 flex-col">
        <SiteHeader eyebrow="Siparişler" compact  homeHref="/portal" />
        <main className="relative mx-auto flex w-full max-w-sm flex-1 flex-col px-4 pb-16">
          <Card className="bg-[oklch(0.22_0.04_250)] text-white ring-white/10">
            <CardHeader>
              <CardTitle className="text-white">Sipariş girişi</CardTitle>
              <CardDescription className="text-sky-100/60">
                Siparişleri görmek için yönetim şifrenizle giriş yapın.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-1.5">
                <Label htmlFor="orders-password">Şifre</Label>
                <Input
                  id="orders-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-10 bg-white/5 text-white"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void handleLogin();
                  }}
                />
              </div>
              {loginError ? (
                <p className="text-sm text-red-300">{loginError}</p>
              ) : null}
              <Button
                className="w-full bg-sky-400 text-[oklch(0.18_0.05_250)] hover:bg-sky-300"
                onClick={() => void handleLogin()}
              >
                Giriş yap
              </Button>
              <Link
                href="/portal"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  darkOutline,
                  "w-full"
                )}
              >
                Portala dön
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const light = theme === "light";
  const outline = light ? lightOutline : darkOutline;
  const tabDescription =
    tab === "active"
      ? "Gelen siparişler önce onaylanır. Onaydan sonra iptal / gönderildi / ödendi çıkar; gecikirirse unutulan uyarısı çalar."
      : tab === "past"
        ? "Ödenen siparişler gün gün ayrılır (sabah 08:00 – gece 03:00). Geri al ile aktife çekebilirsin."
        : "Gün / ay / yıl bazında ciro, ürün tercihi ve yoğunluk grafikleri.";

  return (
    <div
      className={cn(
        "relative flex min-h-full flex-1 flex-col",
        light
          ? "bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_48%,#f8fafc_100%)]"
          : "bg-[linear-gradient(180deg,#07111f_0%,#0b1729_50%,#07111f_100%)]"
      )}
    >
      <div className="relative">
        <SiteHeader eyebrow="Siparişler" compact  homeHref="/portal" />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={light ? "Koyu moda geç" : "Açık moda geç"}
          className={cn(
            "absolute top-4 right-4 z-20 size-10 rounded-full shadow-sm sm:top-5 sm:right-6",
            outline
          )}
          onClick={toggleTheme}
        >
          {light ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </Button>
      </div>

      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pb-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-3">
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="Sipariş sekmeleri"
            >
              {(
                [
                  ["active", "Siparişler"],
                  ["past", "Geçmiş siparişler"],
                  ["report", "Rapor"],
                ] as const
              ).map(([value, label]) => (
                <Button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={tab === value}
                  variant={tab === value ? "default" : "outline"}
                  className={cn(
                    tab === value
                      ? light
                        ? "bg-sky-600 text-white hover:bg-sky-600"
                        : "bg-sky-500 text-white hover:bg-sky-500"
                      : outline
                  )}
                  onClick={() => setTab(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <p
              className={cn(
                "max-w-xl text-sm",
                light ? "text-slate-600" : "text-sky-100/65"
              )}
            >
              {tabDescription}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className={cn(
                outline,
                notificationsEnabled &&
                  (light
                    ? "border-emerald-400 bg-emerald-500 text-white hover:bg-emerald-500 hover:text-white"
                    : "border-emerald-400/50 bg-emerald-500 text-white hover:bg-emerald-400 hover:text-white")
              )}
              onClick={() => {
                unlockOrderAlerts();
                void ensureNotificationPermission().then((permission) => {
                  setNotificationsEnabled(permission === "granted");
                });
              }}
            >
              {notificationsEnabled ? "Bildirim açık" : "Bildirimi aç"}
            </Button>
            <Link
              href="/yonetim"
              className={cn(buttonVariants({ variant: "outline" }), outline)}
            >
              Menü yönetimi
            </Link>
            <Link
              href="/portal"
              className={cn(buttonVariants({ variant: "outline" }), outline)}
            >
              Portal
            </Link>
          </div>
        </div>

        {tab === "report" ? (
          <OrdersReportPanel />
        ) : (
          <AdminOrdersPanel
            mode={tab === "past" ? "past" : "active"}
            theme={theme}
          />
        )}
      </main>
    </div>
  );
}
