"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function StatsHeader({
  startWeight,
  latestWeight,
  goalWeight,
  daysLeft,
}: {
  startWeight: number;
  latestWeight: number;
  goalWeight: number;
  daysLeft: number;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [showUpdate, setShowUpdate] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("weight_logs")
      .upsert(
        { user_id: user.id, log_date: new Date().toISOString().slice(0, 10), weight },
        { onConflict: "user_id,log_date" }
      );

    setValue("");
    setLoading(false);
    setShowUpdate(false);
    router.refresh();
  }

  return (
    <div>
      {/* Gewicht — kein Kasten */}
      <div className="text-center py-6">
        <div className="font-display text-[56px] font-bold leading-none text-shadow-soft">
          {latestWeight.toFixed(1)}
          <span className="font-body text-xl font-normal text-accent">.kg</span>
        </div>
        <div className="text-muted text-[11px] uppercase tracking-wide mt-1 text-shadow-soft">
          Aktuelles Gewicht
        </div>

        <div className="flex justify-center gap-[4px] mt-4 max-w-[280px] mx-auto">
          {Array.from({ length: segments }).map((_, i) => (
            <span
              key={i}
              className={`flex-1 h-1.5 rounded-full ${i < filledSegments ? "bg-accent" : "bg-white/15"}`}
            />
          ))}
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
              className="flex-1 px-3 py-2 rounded-md text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-accent text-white font-semibold text-sm px-5 py-2 rounded-md disabled:opacity-60"
            >
              Speichern
            </button>
          </div>
        </form>
      )}

      {/* Untere Stats-Box: verbleibend / Tage / Ziel */}
      <div className="card-glass rounded-lg py-5 grid grid-cols-3">
        <div className="text-center">
          <div>
            <span className="font-display text-3xl">{Math.max(0, goalWeight - latestWeight).toFixed(1)}</span>
            <span className="text-muted text-sm"> kg</span>
          </div>
          <div className="text-accent text-[11px] font-bold uppercase tracking-wide mt-1">left</div>
        </div>
        <div className="text-center border-x border-accent/40 px-2">
          <div className="text-[11px] uppercase tracking-wide">Noch</div>
          <div className="font-display text-4xl text-accent leading-none my-0.5">{daysLeft}</div>
          <div className="text-[11px] uppercase tracking-wide">Tage</div>
        </div>
        <div className="text-center">
          <div>
            <span className="font-display text-3xl">{goalWeight}</span>
            <span className="text-muted text-sm"> kg</span>
          </div>
          <div className="text-accent text-[11px] font-bold uppercase tracking-wide mt-1">goal</div>
        </div>
      </div>
    </div>
  );
}
