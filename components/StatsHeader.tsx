"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Area,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

type WeightLog = { weight: number; log_date: string };

const MONTHS_DE = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function monthMarks(startDate: Date, totalDays: number) {
  const starts: { x: number; label: string }[] = [];
  const mids: number[] = [];
  const endDate = addDays(startDate, totalDays);

  let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  while (cursor <= endDate) {
    const x = daysBetween(startDate, cursor);
    if (x >= 0 && x <= totalDays) {
      starts.push({ x, label: MONTHS_DE[cursor.getMonth()] });
    }
    const midDate = new Date(cursor.getFullYear(), cursor.getMonth(), 15);
    const midX = daysBetween(startDate, midDate);
    if (midX >= 0 && midX <= totalDays) mids.push(midX);
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  return { starts, mids };
}

function MonthMidTick(props: any) {
  const { x, y } = props;
  return <line x1={x} x2={x} y1={y} y2={y + 5} stroke="#3a4550" strokeWidth={1} />;
}

export default function StatsHeader({
  startWeight,
  latestWeight,
  goalWeight,
  goalDate,
  startDate: startDateProp,
  daysLeft,
  weightLogs = [],
}: {
  startWeight: number;
  latestWeight: number;
  goalWeight: number;
  goalDate: string;
  startDate?: string | null;
  daysLeft: number;
  weightLogs?: WeightLog[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [showUpdate, setShowUpdate] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalDelta = goalWeight - startWeight;
  const currentDelta = latestWeight - startWeight;
  const pct = totalDelta !== 0 ? Math.max(0, Math.min(1, currentDelta / totalDelta)) : 0;
  const segments = 8;
  const filledSegments = Math.max(pct > 0 ? 1 : 0, Math.round(pct * segments));

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

  const chart = useMemo(() => {
    const sortedLogs = [...weightLogs].sort(
      (a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime()
    );

    const startDate = startDateProp
      ? new Date(startDateProp)
      : sortedLogs.length
      ? new Date(sortedLogs[0].log_date)
      : new Date();
    const today = new Date();
    const goal = new Date(goalDate);

    const totalDays = Math.max(1, daysBetween(startDate, goal));
    const todayX = Math.max(0, Math.min(totalDays, daysBetween(startDate, today)));

    const actual = sortedLogs.length
      ? sortedLogs.map((l) => ({
          x: Math.max(0, Math.min(totalDays, daysBetween(startDate, new Date(l.log_date)))),
          actual: l.weight,
        }))
      : [{ x: 0, actual: startWeight }];

    const projected = [
      { x: todayX, projected: latestWeight },
      { x: totalDays, projected: goalWeight },
    ];

    const rows = new Map<number, { x: number; actual?: number; projected?: number }>();
    for (const a of actual) {
      rows.set(a.x, { x: a.x, actual: a.actual });
    }
    for (const p of projected) {
      const existing = rows.get(p.x);
      if (existing) {
        existing.projected = p.projected;
      } else {
        rows.set(p.x, { x: p.x, projected: p.projected });
      }
    }
    const merged = Array.from(rows.values()).sort((a, b) => a.x - b.x);

    const lastLogX = sortedLogs.length
      ? Math.max(0, Math.min(totalDays, daysBetween(startDate, new Date(sortedLogs[sortedLogs.length - 1].log_date))))
      : 0;
    const todayPct = totalDays > 0 ? Math.max(16, Math.min(84, (lastLogX / totalDays) * 100)) : 16;

    const { starts: monthStarts, mids: monthMids } = monthMarks(startDate, totalDays);

    const roundedStart = Math.round(startWeight / 5) * 5;
    const yMin = roundedStart - 5;
    const yMax = goalWeight;

    const yTicks: number[] = [];
    const yMajors = new Set<number>();
    for (let v = yMin; v < yMax; v += 1) {
      const r = Math.round(v * 10) / 10;
      yTicks.push(r);
      if (Math.abs((v - yMin) % 5) < 0.001) yMajors.add(r);
    }
    const topRounded = Math.round(yMax * 10) / 10;
    yTicks.push(topRounded);
    yMajors.add(topRounded);

    return { merged, totalDays, todayPct, monthStarts, monthMids, yMin, yMax, yTicks, yMajors };
  }, [weightLogs, goalDate, startWeight, latestWeight, goalWeight, startDateProp]);

  function YAxisTick(props: any) {
    const { x, y, payload } = props;
    const rounded = Math.round(payload.value * 10) / 10;
    const isMajor = chart.yMajors.has(rounded);
    if (isMajor) {
      const label = Math.abs(rounded % 1) < 0.001 ? Math.round(rounded) : rounded.toFixed(1);
      return (
        <g>
          <line x1={x} x2={x - 7} y1={y} y2={y} stroke="#5a6572" strokeWidth={1.2} />
          <text x={x + 9} y={y} dy={3} textAnchor="start" fontSize={10} fill="#9AA2B1">
            {label}
          </text>
        </g>
      );
    }
    return <line x1={x} x2={x - 3} y1={y} y2={y} stroke="#3a4550" strokeWidth={1} />;
  }

  return (
    <div>
      {/* Gewicht + Update — oben */}
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

      {/* Segment-Leiste: Fortschritt bis zum Zielgewicht */}
      <div className="flex gap-1 mb-5">
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className={`flex-1 h-1.5 rounded-full ${i < filledSegments ? "bg-accent" : "bg-white/10"}`}
          />
        ))}
      </div>

      {/* Verlaufs-Karte */}
      <div className="card-glass rounded-lg p-5">
        <button
          type="button"
          onClick={() => setShowChart((v) => !v)}
          className="w-full flex justify-between items-start"
        >
          <div>
            <div className="text-muted text-[11px] uppercase tracking-wide">Start</div>
            <div className="text-text text-lg font-semibold mt-0.5">{startWeight.toFixed(1)} kg</div>
          </div>
          <div className="text-center pt-0.5">
            <div className="text-accent text-lg font-semibold leading-none">{Math.max(0, daysLeft)}</div>
            <div className="text-muted text-[11px] uppercase tracking-wide mt-0.5 flex items-center justify-center gap-1">
              Tage verbleibend
              <i className={`ti ti-chevron-down text-xs transition-transform ${showChart ? "rotate-180" : ""}`} aria-hidden="true" />
            </div>
          </div>
          <div className="text-right">
            <div className="text-muted text-[11px] uppercase tracking-wide">Ziel</div>
            <div className="text-accent text-lg font-semibold mt-0.5">{goalWeight.toFixed(1)} kg</div>
          </div>
        </button>

        {showChart && (
        <div className="relative mt-6 mx-auto" style={{ height: 132, width: "95%" }}>
          <div
            className="absolute -top-7 card-glass rounded-md px-2.5 py-1 text-[11px] font-semibold text-text z-10"
            style={{ left: `${chart.todayPct}%`, transform: "translateX(-50%)" }}
          >
            {latestWeight.toFixed(1)} kg
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chart.merged} margin={{ top: 8, right: 34, left: 4, bottom: 20 }}>
              <XAxis
                dataKey="x"
                type="number"
                domain={[0, chart.totalDays]}
                ticks={chart.monthMids}
                tick={<MonthMidTick />}
                axisLine={{ stroke: "#3a4550" }}
                tickLine={false}
                interval={0}
              />
              <YAxis
                type="number"
                domain={[chart.yMin, chart.yMax]}
                ticks={chart.yTicks}
                tick={<YAxisTick />}
                orientation="right"
                axisLine={false}
                tickLine={false}
                width={34}
                interval={0}
              />
              {chart.monthStarts.map((m) => (
                <ReferenceLine
                  key={m.x}
                  x={m.x}
                  stroke="#3a4550"
                  strokeWidth={1}
                  label={{
                    value: m.label,
                    position: "bottom",
                    fill: "#9AA2B1",
                    fontSize: 11,
                  }}
                />
              ))}
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#2E93E0"
                strokeWidth={2.5}
                fill="#2E93E0"
                fillOpacity={0.15}
                connectNulls
                dot={{ r: 4, fill: "#2E93E0", stroke: "#0c1116", strokeWidth: 2 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="projected"
                stroke="#2E93E0"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        )}
      </div>
    </div>
  );
}