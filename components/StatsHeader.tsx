"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Area, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type WeightLog = { weight: number; log_date: string };
type Tab = "woche" | "monat" | "jahr" | "gesamt";

const DAY_MS = 86400000;
const MONTHS_DE = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

export default function StatsHeader({
  startWeight,
  latestWeight,
  goalWeight,
  goalDate,
  startDate: startDateProp,
  weightLogs = [],
}: {
  startWeight: number;
  latestWeight: number;
  goalWeight: number;
  goalDate: string;
  startDate?: string | null;
  daysLeft?: number;
  weightLogs?: WeightLog[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [showUpdate, setShowUpdate] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("monat");
  const [yearOffset, setYearOffset] = useState(0); // nur für "Gesamt": 0 = letzte 365 Tage, 1 = das Jahr davor, ...

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const weight = parseFloat(value);
    if (!weight) return;
    setLoading(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error: upsertError } = await supabase
      .from("weight_logs")
      .upsert(
        { user_id: user.id, log_date: new Date().toISOString().slice(0, 10), weight },
        { onConflict: "user_id,log_date" }
      );

    setLoading(false);

    if (upsertError) {
      setError(
        upsertError.message.includes("no unique or exclusion constraint")
          ? "DB fehlt noch die Unique-Constraint auf weight_logs (user_id, log_date). Führe fix_weight_logs.sql im Supabase SQL Editor aus."
          : `Speichern fehlgeschlagen: ${upsertError.message}`
      );
      return;
    }

    setValue("");
    setShowUpdate(false);
    router.refresh();
  }

  function handlePlusHalf() {
    const base = value ? parseFloat(value) : latestWeight;
    const next = Math.round((base + 0.5) * 10) / 10;
    setValue(next.toFixed(1));
  }

  const startDate = startDateProp ? new Date(startDateProp) : new Date();
  const today = new Date();

  // Komplette Serie: Startgewicht am Startdatum ist IMMER der erste Punkt,
  // echte Logs überschreiben ihn falls am selben Tag vorhanden.
  const fullSeries = useMemo(() => {
    const map = new Map<string, number>();
    map.set(startDate.toISOString().slice(0, 10), startWeight);
    for (const log of weightLogs) map.set(log.log_date, log.weight);
    return Array.from(map.entries())
      .map(([date, weight]) => ({ t: new Date(date).getTime(), weight }))
      .sort((a, b) => a.t - b.t);
  }, [weightLogs, startDate, startWeight]);

  function valueAtTime(series: { t: number; weight: number }[], t: number): number {
    if (series.length === 0) return 0;
    if (t <= series[0].t) return series[0].weight;
    if (t >= series[series.length - 1].t) return series[series.length - 1].weight;
    for (let i = 0; i < series.length - 1; i++) {
      if (series[i].t <= t && t <= series[i + 1].t) {
        return interpolateAt(series[i], series[i + 1], t);
      }
    }
    return series[series.length - 1].weight;
  }

  // Stats: unabhängig vom aktiven Tab
  const stats = useMemo(() => {
    const weeksRemainingRaw = daysBetween(today, new Date(goalDate)) / 7;
    const weeksRemaining = Math.round(Math.max(0, weeksRemainingRaw) * 2) / 2;

    // Dynamisch: was ab JETZT noch nötig ist, nicht der ursprüngliche Plan seit Start
    const remainingWeight = goalWeight - latestWeight;
    const targetPace = weeksRemainingRaw > 0.5 ? remainingWeight / weeksRemainingRaw : null;

    // "Dein Tempo": rollierendes 4-Wochen-Fenster statt Durchschnitt seit Start
    const elapsedWeeks = daysBetween(startDate, today) / 7;
    const paceWindowWeeks = Math.min(4, elapsedWeeks);
    const refWeight = valueAtTime(fullSeries, today.getTime() - paceWindowWeeks * 7 * DAY_MS);
    const actualPace = paceWindowWeeks > 0.5 ? (latestWeight - refWeight) / paceWindowWeeks : null;

    const onTrack =
      actualPace == null || targetPace == null
        ? null
        : targetPace >= 0
        ? actualPace >= targetPace
        : actualPace <= targetPace;
    return { weeksRemaining, targetPace, actualPace, onTrack };
  }, [latestWeight, goalWeight, goalDate, startDate, fullSeries]);

  // Sichtbares Zeitfenster je nach Tab
  const windowRange = useMemo(() => {
    if (tab === "woche") return { from: today.getTime() - 7 * DAY_MS, to: today.getTime() };
    if (tab === "monat") return { from: today.getTime() - 30 * DAY_MS, to: today.getTime() };
    if (tab === "jahr") return { from: today.getTime() - 365 * DAY_MS, to: today.getTime() };
    // gesamt: 365-Tage-Fenster, per Karussell in die Vergangenheit verschiebbar
    const to = today.getTime() - yearOffset * 365 * DAY_MS;
    const from = to - 365 * DAY_MS;
    return { from, to };
  }, [tab, yearOffset, today]);

  const canGoOlder = fullSeries.length > 0 && windowRange.from > fullSeries[0].t;
  const canGoNewer = tab === "gesamt" && yearOffset > 0;

  function interpolateAt(p1: { t: number; weight: number }, p2: { t: number; weight: number }, t: number) {
    if (p2.t === p1.t) return p1.weight;
    const frac = (t - p1.t) / (p2.t - p1.t);
    return p1.weight + frac * (p2.weight - p1.weight);
  }

  const visibleSeries = useMemo(() => {
    const inWindow = fullSeries.filter((p) => p.t >= windowRange.from && p.t <= windowRange.to);

    if (tab === "monat" && inWindow.length > 0) {
      const prev = [...fullSeries].reverse().find((p) => p.t < windowRange.from);
      if (prev) {
        const edgeWeight = interpolateAt(prev, inWindow[0], windowRange.from);
        return [{ t: windowRange.from, weight: edgeWeight, synthetic: true }, ...inWindow];
      }
    }
    return inWindow;
  }, [fullSeries, windowRange, tab]);

  const xDomain: [number, number] = [windowRange.from, windowRange.to];

  const tickFormatter = (t: number) => {
    const d = new Date(t);
    if (tab === "woche" || tab === "monat") return `${d.getDate()}.${d.getMonth() + 1}.`;
    return MONTHS_DE[d.getMonth()];
  };

  function StatBox({ label, value, colorClass }: { label: string; value: string; colorClass?: string }) {
    return (
      <div className="card-glass rounded-lg px-1.5 py-3 text-center overflow-hidden">
        <div className={`text-base font-bold text-center whitespace-nowrap ${colorClass ?? "text-text"}`}>
          {value}
        </div>
        <div className="text-muted text-[10px] uppercase tracking-wide mt-0.5 leading-tight whitespace-pre-line">{label}</div>
      </div>
    );
  }

  const fmtPace = (v: number | null) => (v == null ? "-" : `${v >= 0 ? "+" : ""}${v.toFixed(2)}kg`);

  return (
    <div>
      {/* Gewicht + Update: oben */}
      <div className="text-center py-6">
        <div className="font-display text-[56px] font-bold leading-none text-shadow-soft">
          {latestWeight.toFixed(1)}
          <span className="font-body text-xl font-normal text-accent">.kg</span>
        </div>
        <div className="text-muted text-[11px] uppercase tracking-wide mt-1 text-shadow-soft">
          Aktuelles Gewicht
        </div>

        <button
          type="button"
          onClick={() => setShowUpdate((v) => !v)}
          className="bg-accent text-white text-[11px] font-bold uppercase tracking-wide rounded-md py-1.5 px-5 mt-4"
        >
          Update
        </button>
      </div>

      {showUpdate && (
        <form onSubmit={handleSave} className="card-glass rounded-lg p-4 mb-4">
          <label className="block text-muted text-[11px] uppercase tracking-wide mb-1.5">
            Heutiges Gewicht eintragen
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="z.B. 80.5"
              style={{ width: "50%" }}
              className="px-3 py-2 rounded-md text-sm"
            />
            <button
              type="button"
              onClick={handlePlusHalf}
              style={{ width: "20%" }}
              className="bg-white/10 text-text font-semibold text-sm rounded-md disabled:opacity-60"
            >
              +0.5
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ width: "30%" }}
              className="bg-accent text-white font-semibold text-sm py-2 rounded-md disabled:opacity-60"
            >
              Speichern
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-xs mt-2">{error}</p>
          )}
        </form>
      )}

      {/* Zeitraum-Tabs */}
      <div className="flex gap-1.5 mb-3">
        {(["woche", "monat", "jahr", "gesamt"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setYearOffset(0);
            }}
            className={`flex-1 text-[11px] uppercase tracking-wide font-semibold py-2 rounded-md transition-colors ${
              tab === t ? "bg-accent text-white" : "bg-white/5 text-muted"
            }`}
          >
            {t === "woche" ? "Woche" : t === "monat" ? "Monat" : t === "jahr" ? "Jahr" : "Gesamt"}
          </button>
        ))}
      </div>

      {/* Chart-Karte */}
      <div className="card-glass rounded-lg pl-4 pr-1.5 pt-4 pb-[5px] mb-3">
        {tab === "gesamt" && (
          <div className="flex justify-between items-center mb-1">
            <button
              type="button"
              onClick={() => setYearOffset((y) => y + 1)}
              disabled={!canGoOlder}
              className="text-muted text-xs px-2 disabled:opacity-30"
            >
              ← Früher
            </button>
            <span className="text-muted text-[11px]">
              {new Date(windowRange.from).getFullYear()} - {new Date(windowRange.to).getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => setYearOffset((y) => Math.max(0, y - 1))}
              disabled={!canGoNewer}
              className="text-muted text-xs px-2 disabled:opacity-30"
            >
              Später →
            </button>
          </div>
        )}

        <div style={{ height: 140 }}>
          {visibleSeries.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted text-xs">
              Keine Einträge in diesem Zeitraum.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={visibleSeries} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="t"
                  type="number"
                  domain={xDomain}
                  tickFormatter={tickFormatter}
                  stroke="#3a4550"
                  tick={{ fontSize: 10, fill: "#9AA2B1" }}
                  tickLine={false}
                  minTickGap={30}
                />
                <YAxis
                  type="number"
                  domain={["auto", goalWeight]}
                  orientation="right"
                  tick={{ fontSize: 10, fill: "#9AA2B1" }}
                  tickLine={false}
                  axisLine={{ stroke: "#3a4550" }}
                  width={22}
                />
                <Tooltip
                  formatter={(v: any) => [`${v} kg`, "Gewicht"]}
                  labelFormatter={(t: any) => new Date(t).toLocaleDateString("de-DE")}
                  contentStyle={{ background: "#141416", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#2E93E0"
                  strokeWidth={2.5}
                  fill="#2E93E0"
                  fillOpacity={0.15}
                  dot={(props: any) =>
                    props.payload?.synthetic ? (
                      <g key={props.key} />
                    ) : (
                      <circle
                        key={props.key}
                        cx={props.cx}
                        cy={props.cy}
                        r={3}
                        fill="#2E93E0"
                        stroke="#0c1116"
                        strokeWidth={1.5}
                      />
                    )
                  }
                  activeDot={{ r: 5, fill: "#2E93E0", stroke: "#fff", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Stat-Boxen */}
      <div className="grid grid-cols-3 gap-2">
        <StatBox label={"Wochen\nnoch"} value={stats.weeksRemaining.toFixed(1)} />
        <StatBox label={"Ziel pro\nWoche"} value={fmtPace(stats.targetPace)} />
        <StatBox
          label="Dein Tempo"
          value={fmtPace(stats.actualPace)}
          colorClass={stats.onTrack == null ? undefined : stats.onTrack ? "text-green-400" : "text-red-400"}
        />
      </div>
    </div>
  );
}