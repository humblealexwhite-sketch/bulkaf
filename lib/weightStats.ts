export type WeightLog = {
  weight: number;
  log_date: string; // ISO date
};

export type RangeKey = "1M" | "3M" | "6M" | "1Y" | "All";

export const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "1M", label: "1M" },
  { key: "3M", label: "3M" },
  { key: "6M", label: "6M" },
  { key: "1Y", label: "1Y" },
  { key: "All", label: "All" },
];

function rangeDays(key: RangeKey): number | null {
  switch (key) {
    case "1M":
      return 30;
    case "3M":
      return 90;
    case "6M":
      return 180;
    case "1Y":
      return 365;
    case "All":
      return null;
  }
}

export function filterLogsByRange(logs: WeightLog[], key: RangeKey): WeightLog[] {
  const sorted = [...logs].sort(
    (a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime()
  );
  const days = rangeDays(key);
  if (days === null) return sorted;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return sorted.filter((l) => new Date(l.log_date).getTime() >= cutoff.getTime());
}

export type WeightStats = {
  current: number;
  change: number;
  changePct: number;
  highest: { weight: number; date: string };
  lowest: { weight: number; date: string };
  average: number;
  weeklyChange: number;
};

export function computeWeightStats(logs: WeightLog[]): WeightStats | null {
  if (!logs.length) return null;

  const sorted = [...logs].sort(
    (a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime()
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const current = last.weight;
  const change = current - first.weight;
  const changePct = first.weight !== 0 ? (change / first.weight) * 100 : 0;

  let highest = sorted[0];
  let lowest = sorted[0];
  let sum = 0;
  for (const l of sorted) {
    if (l.weight > highest.weight) highest = l;
    if (l.weight < lowest.weight) lowest = l;
    sum += l.weight;
  }
  const average = sum / sorted.length;

  const daysBetween = Math.max(
    1,
    (new Date(last.log_date).getTime() - new Date(first.log_date).getTime()) / 86400000
  );
  const weeks = Math.max(daysBetween / 7, 1 / 7);
  const weeklyChange = change / weeks;

  return {
    current,
    change,
    changePct,
    highest: { weight: highest.weight, date: highest.log_date },
    lowest: { weight: lowest.weight, date: lowest.log_date },
    average,
    weeklyChange,
  };
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function formatLongDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
}
