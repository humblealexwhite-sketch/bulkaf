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
    <div>
      <div className="grid grid-cols-[1fr_1.4fr] gap-0 py-5 border-t border-line">
        <div>
          <div className="text-muted text-[11px] uppercase tracking-wide mb-1.5">BMI</div>
          <div className="font-display text-[52px] leading-none mb-3">{bmi.toFixed(1).replace(".", ",")}</div>
          <div className="inline-block bg-accent text-white text-[13px] font-semibold px-4 py-2 rounded-full">
            {bmiTag}
          </div>
        </div>
        <div className="border-l border-line pl-6">
          <div className="flex justify-between items-start">
            <div className="font-display text-[44px] leading-none">
              {latestWeight.toFixed(1)}
              <span className="font-body text-base font-normal text-text"> kg</span>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <span className="font-display text-lg">{daysLeft}</span>{" "}
                <span className="text-muted text-[10px] uppercase tracking-wide">days left</span>
              </div>
              <button
                type="button"
                onClick={() => setShowUpdate((v) => !v)}
                className="bg-accent text-white font-semibold text-xs px-4 py-2 rounded-full"
              >
                Update
              </button>
            </div>
          </div>
          <div className="text-muted text-[11px] uppercase tracking-wide my-1.5">Aktuelles Gewicht</div>
          <div className="flex gap-[3px] mb-2.5">
            {Array.from({ length: segments }).map((_, i) => (
              <span
                key={i}
                className={`flex-1 h-1.5 rounded-sm ${i < filledSegments ? "bg-accent" : "bg-panel2"}`}
              />
            ))}
          </div>
          <div className="flex justify-between items-baseline">
            <div>
              <span className="font-display text-xl text-accent">
                {Math.max(0, goalWeight - latestWeight).toFixed(1)}
              </span>
              <span className="text-muted text-[11px]"> kg</span>
              <div className="text-muted text-[10px] uppercase">left</div>
            </div>
            <div className="text-right">
              <span className="font-display text-xl">{goalWeight}</span>
              <span className="text-muted text-[11px]"> kg</span>
              <div className="text-muted text-[10px] uppercase">goal</div>
            </div>
          </div>
        </div>
      </div>

      {showUpdate && (
        <form onSubmit={handleSave} className="border-t border-line py-4">
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
              className="flex-1 px-3 py-2 rounded-lg text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-accent text-white font-semibold text-sm px-5 py-2 rounded-lg disabled:opacity-60"
            >
              Speichern
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
