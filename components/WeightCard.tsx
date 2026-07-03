"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import LogWeightForm from "@/components/LogWeightForm";
import {
  RANGE_OPTIONS,
  RangeKey,
  WeightLog,
  computeWeightStats,
  filterLogsByRange,
  formatLongDate,
  formatShortDate,
} from "@/lib/weightStats";

export default function WeightCard({
  logs,
  startWeight,
  goalWeight,
}: {
  logs: WeightLog[];
  startWeight: number;
  goalWeight: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [range, setRange] = useState<RangeKey>("3M");
  const [showLogForm, setShowLogForm] = useState(false);

  const latestWeight = logs.length ? logs[logs.length - 1].weight : startWeight;
  const totalDelta = goalWeight - startWeight;
  const currentDelta = latestWeight - startWeight;
  const pct = totalDelta !== 0 ? Math.max(0, Math.min(1, currentDelta / totalDelta)) : 0;

  const filtered = useMemo(() => filterLogsByRange(logs, range), [logs, range]);
  const stats = useMemo(() => computeWeightStats(filtered), [filtered]);

  const chartData = filtered.map((l) => ({
    date: formatShortDate(l.log_date),
    weight: l.weight,
  }));

  return (
    <div className="bg-panel border border-line rounded-sm mb-4 overflow-hidden">
      {/* Collapsed header — compact bar, click to toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-5 py-3.5 flex items-center gap-4"
      >
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-display font-bold">{latestWeight.toFixed(1)}kg</span>
            <span className="text-muted text-xs">
              {startWeight} → {goalWeight}kg
            </span>
          </div>
          <div className="h-[5px] bg-panel2 rounded-sm overflow-hidden">
            <div className="h-full bg-accent" style={{ width: `${pct * 100}%` }} />
          </div>
        </div>
        <span className={`text-muted text-base transition-transform ${expanded ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-line pt-5">
          {/* Range tabs */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex gap-1 bg-panel2 rounded-sm p-1">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRange(opt.key);
                  }}
                  className={`px-3 py-1.5 rounded-sm text-xs font-display uppercase tracking-wide ${
                    range === opt.key ? "bg-accent text-[#171310] font-bold" : "text-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowLogForm((v) => !v);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-accent text-[#171310] text-lg font-bold shrink-0"
              aria-label="Gewicht eintragen"
            >
              +
            </button>
          </div>

          {showLogForm && (
            <div onClick={(e) => e.stopPropagation()} className="mb-5">
              <LogWeightForm />
            </div>
          )}

          {!stats ? (
            <p className="text-muted text-sm">
              Noch keine Gewichtseinträge in diesem Zeitraum.
            </p>
          ) : (
            <>
              {/* Current + change */}
              <div className="inline-block bg-accent2/15 text-accent2 text-[11px] font-display font-bold uppercase tracking-wide px-2.5 py-1 rounded-sm mb-2">
                Aktuell
              </div>
              <div className="font-display font-bold text-4xl mb-1">
                {stats.current.toFixed(1)}kg
              </div>
              <div className="flex items-center gap-2 mb-5">
                <span className={stats.change >= 0 ? "text-ok" : "text-accent"}>
                  {stats.change >= 0 ? "↗" : "↘"} {stats.change >= 0 ? "+" : ""}
                  {stats.change.toFixed(1)}kg
                </span>
                <span className="bg-ok/15 text-ok text-xs px-2 py-0.5 rounded-sm">
                  {stats.changePct >= 0 ? "+" : ""}
                  {stats.changePct.toFixed(1)}%
                </span>
              </div>

              {/* Chart */}
              <div className="h-56 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF3D1A" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#FF3D1A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#332E29" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#8A8580"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={30}
                    />
                    <YAxis
                      stroke="#8A8580"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      domain={["dataMin - 2", "dataMax + 2"]}
                      width={36}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#1C1A18",
                        border: "1px solid #332E29",
                        borderRadius: 2,
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "#8A8580" }}
                      itemStyle={{ color: "#F5F1EA" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke="#FF3D1A"
                      strokeWidth={2}
                      fill="url(#weightFill)"
                      dot={{ r: 3, fill: "#FF3D1A", strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Stats grid */}
              <div className="text-muted text-[13px] tracking-widest uppercase mt-6 mb-3">
                Statistiken
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatTile
                  label="Höchstes"
                  color="text-accent2"
                  bg="bg-accent2/10"
                  value={`${stats.highest.weight.toFixed(1)}kg`}
                  sub={formatLongDate(stats.highest.date)}
                />
                <StatTile
                  label="Niedrigstes"
                  color="text-sky-400"
                  bg="bg-sky-400/10"
                  value={`${stats.lowest.weight.toFixed(1)}kg`}
                  sub={formatLongDate(stats.lowest.date)}
                />
                <StatTile
                  label="Durchschnitt"
                  color="text-violet-400"
                  bg="bg-violet-400/10"
                  value={`${stats.average.toFixed(2)}kg`}
                  sub="Gesamtdurchschnitt"
                />
                <StatTile
                  label="Wöchentliche Änderung"
                  color="text-ok"
                  bg="bg-ok/10"
                  value={`${stats.weeklyChange >= 0 ? "+" : ""}${stats.weeklyChange.toFixed(2)}kg`}
                  sub="Durchschn. pro Woche"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
  color,
  bg,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-panel2 border border-line rounded-sm p-4">
      <div className={`inline-block ${bg} ${color} text-[11px] font-display font-bold uppercase tracking-wide px-2 py-1 rounded-sm mb-3`}>
        {label}
      </div>
      <div className="font-display font-bold text-xl">{value}</div>
      <div className="text-muted text-[11px] mt-1">{sub}</div>
    </div>
  );
}
