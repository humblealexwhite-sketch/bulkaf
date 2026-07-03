"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function ProgressBar({ eaten, target, label, unit }: { eaten: number; target: number; label: string; unit: string }) {
  const pct = target > 0 ? (eaten / target) * 100 : 0;
  const reached = pct >= 100;
  const isGreen = pct >= 75;

  return (
    <div className="mb-3.5 last:mb-0">
      <div className="flex justify-between items-baseline mb-1.5">
        <div className="text-muted text-[11px] uppercase tracking-wide">{label}</div>
        <div className="text-muted text-[11px]">
          Ziel: <span className="font-display text-[15px] text-text">{Math.round(target)}{unit}</span>
        </div>
      </div>
      <div className="h-2 bg-panel2 rounded-full overflow-hidden mb-1">
        <div
          className={`h-full rounded-full transition-all ${isGreen ? "bg-ok" : "bg-accent"} ${reached ? "animate-pulse" : ""}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <div className="text-muted text-xs">{Math.round(eaten)}{unit === "" ? " kcal" : unit} gegessen</div>
    </div>
  );
}

export default function NutritionCard({
  calorieTarget,
  calorieEaten,
  proteinTarget,
  proteinEaten,
  manualCalorieTarget,
  manualProteinTarget,
}: {
  calorieTarget: number;
  calorieEaten: number;
  proteinTarget: number;
  proteinEaten: number;
  manualCalorieTarget: number | null;
  manualProteinTarget: number | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calInput, setCalInput] = useState(String(Math.round(calorieTarget)));
  const [proteinInput, setProteinInput] = useState(String(Math.round(proteinTarget)));

  async function handleSave() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({
        manual_calorie_target: calInput ? parseFloat(calInput) : null,
        manual_protein_target: proteinInput ? parseFloat(proteinInput) : null,
      })
      .eq("user_id", user.id);

    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  async function handleReset() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ manual_calorie_target: null, manual_protein_target: null })
      .eq("user_id", user.id);

    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  return (
    <div className="mb-2">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <ProgressBar eaten={calorieEaten} target={calorieTarget} label="Kalorien heute" unit="" />
          <ProgressBar eaten={proteinEaten} target={proteinTarget} label="Protein heute" unit="g" />
        </div>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          aria-label="Ziele bearbeiten"
          className="text-muted ml-4 shrink-0 mt-0.5"
        >
          <i className="ti ti-settings text-lg" aria-hidden="true" />
        </button>
      </div>

      {editing && (
        <div className="mt-4 pt-4 border-t border-line">
          <label className="block text-[11px] text-muted uppercase tracking-wide mb-1.5">
            Kalorienziel manuell {manualCalorieTarget != null && "(aktiv)"}
          </label>
          <input
            type="number"
            value={calInput}
            onChange={(e) => setCalInput(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm mb-3"
          />
          <label className="block text-[11px] text-muted uppercase tracking-wide mb-1.5">
            Proteinziel manuell (g) {manualProteinTarget != null && "(aktiv)"}
          </label>
          <input
            type="number"
            value={proteinInput}
            onChange={(e) => setProteinInput(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm mb-3"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="bg-accent text-white font-semibold py-2 px-4 rounded-lg text-xs disabled:opacity-60"
            >
              Speichern
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="text-muted text-xs underline underline-offset-2"
            >
              Automatisch berechnen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
