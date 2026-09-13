import type { Order } from "@/lib/orders";

export type ReportRange = "day" | "month" | "year";

export type ReportBucket = {
  key: string;
  label: string;
  revenue: number;
  orders: number;
};

export type ReportProduct = {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
};

export type OrdersReport = {
  range: ReportRange;
  anchor: string;
  from: string;
  to: string;
  summary: {
    revenue: number;
    orders: number;
    itemsSold: number;
    avgOrder: number;
  };
  series: ReportBucket[];
  products: ReportProduct[];
  busyDays: ReportBucket[];
};

function istanbulParts(date: Date) {
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  });
  const parts = dtf.formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "0";
  return {
    year: Number(read("year")),
    month: Number(read("month")),
    day: Number(read("day")),
    hour: Number(read("hour")),
    weekday: read("weekday"),
  };
}

function istanbulWallToUtc(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0
) {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const shown = istanbulParts(new Date(utcGuess));
  const shownAsUtc = Date.UTC(
    shown.year,
    shown.month - 1,
    shown.day,
    shown.hour,
    0,
    0
  );
  const desiredAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  return new Date(utcGuess + (desiredAsUtc - shownAsUtc));
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function parseAnchor(anchor: string | undefined, now: Date) {
  const parts = istanbulParts(now);
  if (!anchor) {
    return { year: parts.year, month: parts.month, day: parts.day };
  }
  const dayMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(anchor);
  if (dayMatch) {
    return {
      year: Number(dayMatch[1]),
      month: Number(dayMatch[2]),
      day: Number(dayMatch[3]),
    };
  }
  const monthMatch = /^(\d{4})-(\d{2})$/.exec(anchor);
  if (monthMatch) {
    return {
      year: Number(monthMatch[1]),
      month: Number(monthMatch[2]),
      day: 1,
    };
  }
  const yearMatch = /^(\d{4})$/.exec(anchor);
  if (yearMatch) {
    return { year: Number(yearMatch[1]), month: 1, day: 1 };
  }
  return { year: parts.year, month: parts.month, day: parts.day };
}

export function resolveReportWindow(
  range: ReportRange,
  anchor: string | undefined,
  now = new Date()
) {
  const { year, month, day } = parseAnchor(anchor, now);

  if (range === "day") {
    const from = istanbulWallToUtc(year, month, day, 0, 0);
    const next = new Date(Date.UTC(year, month - 1, day + 1));
    const to = istanbulWallToUtc(
      next.getUTCFullYear(),
      next.getUTCMonth() + 1,
      next.getUTCDate(),
      0,
      0
    );
    return {
      anchor: `${year}-${pad(month)}-${pad(day)}`,
      from: from.toISOString(),
      to: to.toISOString(),
    };
  }

  if (range === "month") {
    const from = istanbulWallToUtc(year, month, 1, 0, 0);
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const to = istanbulWallToUtc(nextYear, nextMonth, 1, 0, 0);
    return {
      anchor: `${year}-${pad(month)}`,
      from: from.toISOString(),
      to: to.toISOString(),
    };
  }

  const from = istanbulWallToUtc(year, 1, 1, 0, 0);
  const to = istanbulWallToUtc(year + 1, 1, 1, 0, 0);
  return {
    anchor: String(year),
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

function dateKey(iso: string) {
  const p = istanbulParts(new Date(iso));
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

function monthKey(iso: string) {
  const p = istanbulParts(new Date(iso));
  return `${p.year}-${pad(p.month)}`;
}

function hourKey(iso: string) {
  return istanbulParts(new Date(iso)).hour;
}

const WEEKDAY_TR: Record<string, string> = {
  Mon: "Pzt",
  Tue: "Sal",
  Wed: "Çar",
  Thu: "Per",
  Fri: "Cum",
  Sat: "Cmt",
  Sun: "Paz",
};

const MONTH_TR = [
  "Oca",
  "Şub",
  "Mar",
  "Nis",
  "May",
  "Haz",
  "Tem",
  "Ağu",
  "Eyl",
  "Eki",
  "Kas",
  "Ara",
];

function labelForKey(range: ReportRange, key: string) {
  if (range === "day") {
    return `${key}:00`;
  }
  if (range === "month") {
    const [, , d] = key.split("-");
    return `${Number(d)}`;
  }
  const [, m] = key.split("-");
  return MONTH_TR[Number(m) - 1] ?? key;
}

function bump(
  map: Map<string, ReportBucket>,
  key: string,
  label: string,
  revenue: number
) {
  const prev = map.get(key);
  if (prev) {
    prev.revenue += revenue;
    prev.orders += 1;
  } else {
    map.set(key, { key, label, revenue, orders: 1 });
  }
}

export function buildOrdersReport(
  orders: Order[],
  range: ReportRange,
  window: { anchor: string; from: string; to: string }
): OrdersReport {
  const seriesMap = new Map<string, ReportBucket>();
  const dayMap = new Map<string, ReportBucket>();
  const productMap = new Map<string, ReportProduct>();

  let revenue = 0;
  let itemsSold = 0;

  // Pre-seed expected buckets so charts look complete.
  if (range === "day") {
    for (let h = 0; h < 24; h++) {
      const key = String(h);
      seriesMap.set(key, { key, label: `${pad(h)}:00`, revenue: 0, orders: 0 });
    }
  } else if (range === "month") {
    const [y, m] = window.anchor.split("-").map(Number);
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${y}-${pad(m)}-${pad(d)}`;
      seriesMap.set(key, {
        key,
        label: String(d),
        revenue: 0,
        orders: 0,
      });
    }
  } else {
    const y = Number(window.anchor);
    for (let m = 1; m <= 12; m++) {
      const key = `${y}-${pad(m)}`;
      seriesMap.set(key, {
        key,
        label: MONTH_TR[m - 1],
        revenue: 0,
        orders: 0,
      });
    }
  }

  for (const order of orders) {
    revenue += order.total;
    const bucketKey =
      range === "day"
        ? String(hourKey(order.createdAt))
        : range === "month"
          ? dateKey(order.createdAt)
          : monthKey(order.createdAt);
    const label =
      range === "day"
        ? `${pad(Number(bucketKey))}:00`
        : labelForKey(range, bucketKey);
    bump(seriesMap, bucketKey, label, order.total);

    const day = dateKey(order.createdAt);
    const parts = istanbulParts(new Date(order.createdAt));
    const dayLabel = `${pad(parts.day)}.${pad(parts.month)} ${WEEKDAY_TR[parts.weekday] ?? ""}`.trim();
    bump(dayMap, day, dayLabel, order.total);

    for (const item of order.items) {
      itemsSold += item.quantity;
      const prev = productMap.get(item.productId);
      const line = item.unitPrice * item.quantity;
      if (prev) {
        prev.quantity += item.quantity;
        prev.revenue += line;
        prev.name = item.name || prev.name;
      } else {
        productMap.set(item.productId, {
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          revenue: line,
        });
      }
    }
  }

  const series = Array.from(seriesMap.values());
  if (range === "day") {
    series.sort((a, b) => Number(a.key) - Number(b.key));
  } else {
    series.sort((a, b) => a.key.localeCompare(b.key));
  }

  const products = Array.from(productMap.values()).sort(
    (a, b) => b.quantity - a.quantity || b.revenue - a.revenue
  );

  const busyDays = Array.from(dayMap.values())
    .sort((a, b) => b.orders - a.orders || b.revenue - a.revenue)
    .slice(0, 10);

  return {
    range,
    anchor: window.anchor,
    from: window.from,
    to: window.to,
    summary: {
      revenue,
      orders: orders.length,
      itemsSold,
      avgOrder: orders.length ? revenue / orders.length : 0,
    },
    series,
    products,
    busyDays,
  };
}
