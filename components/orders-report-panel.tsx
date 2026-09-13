"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getStoredAdminPassword } from "@/hooks/use-menu";
import { formatPrice } from "@/lib/menu";
import type { OrdersReport, ReportRange } from "@/lib/order-reports";
import { cn } from "@/lib/utils";

type ChartRow = { key: string; label: string; value: number };

const MONTHS_TR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
] as const;

function parseYearMonth(anchor: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(anchor);
  if (!match) {
    const now = todayAnchor("month");
    const [y, m] = now.split("-");
    return { year: y, month: m };
  }
  return { year: match[1], month: match[2] };
}

function yearOptions() {
  const current = Number(todayAnchor("year"));
  return Array.from({ length: 8 }, (_, i) => String(current - 5 + i));
}

function SimpleBarChart({
  title,
  description,
  rows,
  formatValue,
  emptyText,
}: {
  title: string;
  description: string;
  rows: ChartRow[];
  formatValue: (value: number) => string;
  emptyText: string;
}) {
  const max = Math.max(...rows.map((row) => row.value), 0);
  const hasData = rows.some((row) => row.value > 0);

  return (
    <Card className="bg-[oklch(0.22_0.04_250)] text-white ring-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-white">{title}</CardTitle>
        <CardDescription className="text-sky-100/60">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="rounded-xl bg-white/5 px-4 py-8 text-center text-sm text-sky-100/60">
            {emptyText}
          </p>
        ) : (
          <ul className="space-y-2">
            {rows.map((row) => {
              const width = max > 0 ? (row.value / max) * 100 : 0;
              return (
                <li key={row.key} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="truncate text-sky-50">{row.label}</span>
                    <span className="shrink-0 tabular-nums text-sky-200/90">
                      {formatValue(row.value)}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-sky-400 transition-[width] duration-500"
                      style={{
                        width: `${Math.max(width, row.value > 0 ? 4 : 0)}%`,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function todayAnchor(range: ReportRange) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "2026";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  if (range === "day") return `${year}-${month}-${day}`;
  if (range === "month") return `${year}-${month}`;
  return year;
}

export function OrdersReportPanel() {
  const [range, setRange] = useState<ReportRange>("month");
  const [anchor, setAnchor] = useState(() => todayAnchor("month"));
  const [report, setReport] = useState<OrdersReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ range, anchor });
      const response = await fetch(`/api/orders/report?${params}`, {
        cache: "no-store",
        headers: {
          "x-admin-password": getStoredAdminPassword(),
        },
      });
      const data = (await response.json()) as {
        report?: OrdersReport;
        error?: string;
      };
      if (!response.ok || !data.report) {
        throw new Error(data.error || "Rapor alınamadı.");
      }
      setReport(data.report);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rapor alınamadı.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [range, anchor]);

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  function changeRange(next: ReportRange) {
    setRange(next);
    setAnchor(todayAnchor(next));
  }

  const seriesRows = useMemo<ChartRow[]>(
    () =>
      (report?.series ?? []).map((row) => ({
        key: row.key,
        label: row.label,
        value: row.revenue,
      })),
    [report]
  );

  const productRows = useMemo<ChartRow[]>(
    () =>
      (report?.products ?? []).slice(0, 12).map((row) => ({
        key: row.productId,
        label: `${row.name} · ${row.quantity} adet`,
        value: row.quantity,
      })),
    [report]
  );

  const busyRows = useMemo<ChartRow[]>(() => {
    if (!report) return [];
    if (range === "day") {
      return report.series
        .map((row) => ({
          key: row.key,
          label: row.label,
          value: row.orders,
        }))
        .filter((row) => row.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    }
    return report.busyDays.map((row) => ({
      key: row.key,
      label: `${row.label} · ${row.orders} sipariş`,
      value: row.orders,
    }));
  }, [report, range]);

  const visibleSeriesRows =
    range === "day"
      ? seriesRows.filter((row) => {
          const hour = Number(row.key);
          return hour >= 8 || hour <= 3 || row.value > 0;
        })
      : seriesRows;

  const seriesTitle =
    range === "day"
      ? "Saatlik ciro"
      : range === "month"
        ? "Günlük ciro"
        : "Aylık ciro";

  return (
    <div className="space-y-6">
      <Card className="bg-[oklch(0.22_0.04_250)] text-white ring-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="size-4 text-sky-300" />
            Satış raporu
          </CardTitle>
          <CardDescription className="text-sky-100/60">
            Gün, ay veya yıl seçerek ciroyu, en çok satılan ürünleri ve yoğun
            günleri görün. Rapor yalnızca ödenen siparişleri kullanır.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["day", "Gün"],
                ["month", "Ay"],
                ["year", "Yıl"],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={range === value ? "default" : "outline"}
                className={cn(
                  range === value
                    ? "bg-sky-400 text-sky-950 hover:bg-sky-300"
                    : "border-white/30 bg-white/10 text-white hover:bg-white/20"
                )}
                onClick={() => changeRange(value)}
              >
                {label}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            {range === "day" ? (
              <div className="grid min-w-[12rem] flex-1 gap-1.5">
                <label className="text-xs text-sky-100/70">Tarih</label>
                <Input
                  type="date"
                  lang="tr-TR"
                  value={anchor}
                  onChange={(event) => setAnchor(event.target.value)}
                  className="h-10 border-white/20 bg-white/5 text-white"
                />
              </div>
            ) : null}

            {range === "month" ? (
              <>
                <div className="grid min-w-[10rem] flex-1 gap-1.5">
                  <label className="text-xs text-sky-100/70">Ay</label>
                  <select
                    value={parseYearMonth(anchor).month}
                    onChange={(event) => {
                      const { year } = parseYearMonth(anchor);
                      setAnchor(`${year}-${event.target.value}`);
                    }}
                    className="h-10 rounded-md border border-white/20 bg-white/5 px-3 text-sm text-white outline-none"
                  >
                    {MONTHS_TR.map((label, index) => {
                      const value = String(index + 1).padStart(2, "0");
                      return (
                        <option key={value} value={value} className="bg-slate-900 text-white">
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="grid min-w-[7rem] gap-1.5">
                  <label className="text-xs text-sky-100/70">Yıl</label>
                  <select
                    value={parseYearMonth(anchor).year}
                    onChange={(event) => {
                      const { month } = parseYearMonth(anchor);
                      setAnchor(`${event.target.value}-${month}`);
                    }}
                    className="h-10 rounded-md border border-white/20 bg-white/5 px-3 text-sm text-white outline-none"
                  >
                    {yearOptions().map((year) => (
                      <option key={year} value={year} className="bg-slate-900 text-white">
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : null}

            {range === "year" ? (
              <div className="grid min-w-[8rem] flex-1 gap-1.5">
                <label className="text-xs text-sky-100/70">Yıl</label>
                <select
                  value={anchor}
                  onChange={(event) => setAnchor(event.target.value)}
                  className="h-10 rounded-md border border-white/20 bg-white/5 px-3 text-sm text-white outline-none"
                >
                  {yearOptions().map((year) => (
                    <option key={year} value={year} className="bg-slate-900 text-white">
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <Button
              type="button"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              onClick={() => void fetchReport()}
            >
              Yenile
            </Button>
          </div>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          {loading ? (
            <p className="text-sm text-sky-100/60">Rapor hazırlanıyor…</p>
          ) : report ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <p className="text-xs text-sky-100/60">Toplam ciro</p>
                <p className="mt-1 text-xl font-bold text-sky-200">
                  {formatPrice(report.summary.revenue)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <p className="text-xs text-sky-100/60">Ödenen sipariş</p>
                <p className="mt-1 text-xl font-bold text-white">
                  {report.summary.orders}
                </p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <p className="text-xs text-sky-100/60">Satılan ürün</p>
                <p className="mt-1 text-xl font-bold text-white">
                  {report.summary.itemsSold}
                </p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <p className="text-xs text-sky-100/60">Ortalama sipariş</p>
                <p className="mt-1 text-xl font-bold text-white">
                  {formatPrice(report.summary.avgOrder)}
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {!loading && report ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <SimpleBarChart
            title={seriesTitle}
            description={
              range === "day"
                ? "Seçilen günde saat saat ciro"
                : range === "month"
                  ? "Ay içindeki günlük ciro"
                  : "Yıl içindeki aylık ciro"
            }
            rows={visibleSeriesRows}
            formatValue={(value) => formatPrice(value)}
            emptyText="Bu dönemde ödenen sipariş yok."
          />
          <SimpleBarChart
            title="En çok tercih edilen ürünler"
            description="Adet bazında satış sıralaması"
            rows={productRows}
            formatValue={(value) => `${value} adet`}
            emptyText="Ürün satışı bulunamadı."
          />
          <div className="lg:col-span-2">
            <SimpleBarChart
              title={range === "day" ? "Günün yoğunluğu" : "En yoğun günler"}
              description={
                range === "day"
                  ? "Sipariş adedine göre en yoğun saatler"
                  : "Sipariş adedine göre en yoğun günler"
              }
              rows={busyRows}
              formatValue={(value) => `${value} sipariş`}
              emptyText="Yoğunluk verisi yok."
            />
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="size-3.5" /> İstanbul saati
        </span>
        <span className="inline-flex items-center gap-1">
          <Package className="size-3.5" /> Yalnızca ödenen siparişler
        </span>
      </div>
    </div>
  );
}
