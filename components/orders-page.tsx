"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminOrdersPanel } from "@/components/admin-orders-panel";
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
        <SiteHeader eyebrow="Siparişler" compact />
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

  const tabDescription =
    tab === "active"
      ? "Gelen siparişler burada listelenir. Başka sekmedeyken de ses ve masaüstü bildirimi gelir."
      : tab === "past"
        ? "Ödenen siparişler. Geri al ile tekrar aktif listeye çekebilirsin."
        : "Gün / ay / yıl bazında ciro, ürün tercihi ve yoğunluk grafikleri.";

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <SiteHeader eyebrow="Siparişler" compact />
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
                      ? "bg-sky-500 text-white hover:bg-sky-500"
                      : lightOutline
                  )}
                  onClick={() => setTab(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <p className="max-w-xl text-sm text-slate-600">{tabDescription}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className={lightOutline}
              onClick={() => {
                unlockOrderAlerts();
                ensureNotificationPermission();
              }}
            >
              Bildirimi aç
            </Button>
            <Link
              href="/yonetim"
              className={cn(
                buttonVariants({ variant: "outline" }),
                lightOutline
              )}
            >
              Menü yönetimi
            </Link>
            <Link
              href="/portal"
              className={cn(
                buttonVariants({ variant: "outline" }),
                lightOutline
              )}
            >
              Portal
            </Link>
          </div>
        </div>

        {tab === "report" ? (
          <OrdersReportPanel />
        ) : (
          <AdminOrdersPanel mode={tab === "past" ? "past" : "active"} />
        )}
      </main>
    </div>
  );
}
