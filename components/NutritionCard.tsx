"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function ProgressBar({ eaten, target, label, unit }: { eaten: number; target: number; label: string; unit: string }) {
  const pct = target > 0 ? (eaten / target) * 100 : 0;
  const remaining = Math.round(target - eaten);
  const reached = pct >= 100;
  const isGreen = pct >= 75;

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-baseline mb-2">
        <div className="text-muted text-xs uppercase tracking-widest">{label}</div>
        <div className="text-muted text-xs">
          Ziel: <span className="text-accent2 font-display font-bold">{Math.round(target)}{unit}</span>
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <div className="font-display font-bold text-2xl">{Math.round(eaten)}</div>
        <div className="text-muted text-xs">
          {unit === "" ? "kcal" : unit} ·{" "}
          <span className={remaining >= 0 ? "text-ok" : "text-accent"}>
            {remaining >= 0 ? remaining : Math.abs(remaining)} {remaining >= 0 ? "verbleibend" : "über Ziel"}
          </span>
        </div>
      </div>
      <div className="h-2.5 bg-panel2 rounded-sm overflow-hidden">
        <div
          className={`h-full transition-all ${isGreen ? "bg-ok" : "bg-accent"} ${reached ? "animate-pulse" : ""}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
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
    <div className="bg-panel border border-line rounded-sm p-5 mb-4">
      <div className="flex justify-between items-start mb-1">
        <div className="flex-1">
          <ProgressBar eaten={calorieEaten} target={calorieTarget} label="Kalorien heute" unit="" />
          <ProgressBar eaten={proteinEaten} target={proteinTarget} label="Protein heute" unit="g" />
        </div>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          aria-label="Ziele bearbeiten"
          className="text-muted hover:text-text text-lg ml-4 shrink-0"
        >
          ⚙
        </button>
      </div>

      {editing && (
        <div className="mt-4 pt-4 border-t border-line">
          <label className="block text-xs text-muted uppercase tracking-wide mb-1.5">
            Kalorienziel manuell {manualCalorieTarget != null && "(aktiv)"}
          </label>
          <input
            type="number"
            value={calInput}
            onChange={(e) => setCalInput(e.target.value)}
            className="w-full px-3 py-2 rounded-sm text-sm mb-3"
          />
          <label className="block text-xs text-muted uppercase tracking-wide mb-1.5">
            Proteinziel manuell (g) {manualProteinTarget != null && "(aktiv)"}
          </label>
          <input
            type="number"
            value={proteinInput}
            onChange={(e) => setProteinInput(e.target.value)}
            className="w-full px-3 py-2 rounded-sm text-sm mb-3"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="bg-accent text-[#171310] font-display font-semibold uppercase tracking-wide py-2 px-4 rounded-sm text-xs disabled:opacity-60"
            >
              Speichern
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="text-muted text-xs uppercase tracking-wide underline underline-offset-2"
            >
              Automatisch berechnen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
