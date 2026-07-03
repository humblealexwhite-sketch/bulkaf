"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function StatsHeader({
  bmi,
  bmiTag,
  startWeight,
  latestWeight,
  goalWeight,
  daysLeft,
}: {
  bmi: number;
  bmiTag: string;
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
  const segments = 10;
  const filledSegments = Math.round(pct * segments);

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
    <div className="py-5 border-t border-line">
      {/* Row 1: BMI-Tag / großes Gewicht + Update / Tage übrig */}
      <div className="grid grid-cols-3 gap-2 items-center mb-4">
        <div className="bg-accent text-white text-xs font-bold uppercase tracking-wide rounded-md py-3 px-2 text-center">
          {bmiTag}
        </div>
        <div className="text-center">
          <div className="font-display text-[48px] font-bold leading-none">
            {latestWeight.toFixed(1)}
            <span className="font-body text-base font-normal text-text"> kg</span>
          </div>
          <div className="text-muted text-[10px] uppercase tracking-wide mt-1 mb-2">Aktuelles Gewicht</div>
          <button
            type="button"
            onClick={() => setShowUpdate((v) => !v)}
            className="bg-accent text-white text-[11px] font-bold uppercase tracking-wide rounded-md py-1.5 px-4"
          >
            Update
          </button>
        </div>
        <div className="bg-accent text-white text-xs font-bold uppercase tracking-wide rounded-md py-3 px-2 text-center">
          {daysLeft} Days Left
        </div>
      </div>

      {/* Fortschrittsbalken volle Breite */}
      <div className="flex gap-[3px] mb-4">
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className={`flex-1 h-2 rounded-sm ${i < filledSegments ? "bg-accent" : "bg-panel2"}`}
          />
        ))}
      </div>

      {/* Row 2: verbleibend / BMI / Ziel — alle gleiche Größe, gleiche Höhe */}
      <div className="grid grid-cols-3 gap-2 items-start">
        <div className="text-center py-1">
          <div className="font-display text-xl">
            {Math.max(0, goalWeight - latestWeight).toFixed(1)}
            <span className="font-body text-xs text-text"> kg</span>
          </div>
          <div className="text-muted text-[10px] uppercase">left</div>
        </div>
        <div className="bg-panel2 rounded-md py-1 text-center">
          <div className="font-display text-xl">{bmi.toFixed(1).replace(".", ",")}</div>
          <div className="text-muted text-[10px] uppercase tracking-wide">BMI</div>
        </div>
        <div className="text-center py-1">
          <div className="font-display text-xl">
            {goalWeight}
            <span className="font-body text-xs text-text"> kg</span>
          </div>
          <div className="text-muted text-[10px] uppercase">goal</div>
        </div>
      </div>

      {showUpdate && (
        <form onSubmit={handleSave} className="border-t border-line pt-4 mt-4">
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
    </div>
  );
}
