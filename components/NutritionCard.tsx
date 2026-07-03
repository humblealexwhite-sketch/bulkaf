"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function NutrientRow({
  label,
  eaten,
  target,
  unit,
}: {
  label: string;
  eaten: number;
  target: number;
  unit: string;
}) {
  const pct = target > 0 ? (eaten / target) * 100 : 0;
  const reached = pct >= 100;
  const isGreen = pct >= 75;

  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-stretch gap-4 mb-2">
        <div className="flex-1">
          <div className="text-accent text-[13px] font-bold uppercase tracking-wide">{label}</div>
          <div className="text-muted text-xs mt-1">
            {Math.round(eaten)}
            {unit === "" ? " kcal" : unit} gegessen
          </div>
        </div>
        <div className="w-px bg-accent/50" />
        <div className="flex items-center pl-1">
          <span className="font-display text-4xl leading-none">{Math.round(target)}</span>
          {unit !== "" && <span className="text-accent text-lg ml-0.5">{unit}</span>}
        </div>
      </div>
      <div className="h-2.5 bg-white/15 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            reached ? "bg-ok animate-pulse" : isGreen ? "bg-ok" : "bg-white"
          }`}
          style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
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
    <div className="card-glass rounded-lg p-5 mb-1 relative">
      <button
        type="button"
        onClick={() => setEditing((v) => !v)}
        aria-label="Ziele bearbeiten"
        className="absolute top-4 right-4 text-muted"
      >
        <i className="ti ti-settings text-lg" aria-hidden="true" />
      </button>

      <NutrientRow label="Kalorien heute" eaten={calorieEaten} target={calorieTarget} unit="" />
      <NutrientRow label="Protein heute" eaten={proteinEaten} target={proteinTarget} unit="g" />

      {editing && (
        <div className="mt-5 pt-4 border-t border-line">
          <label className="block text-[11px] text-muted uppercase tracking-wide mb-1.5">
            Kalorienziel manuell {manualCalorieTarget != null && "(aktiv)"}
          </label>
          <input
            type="number"
            value={calInput}
            onChange={(e) => setCalInput(e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm mb-3"
          />
          <label className="block text-[11px] text-muted uppercase tracking-wide mb-1.5">
            Proteinziel manuell (g) {manualProteinTarget != null && "(aktiv)"}
          </label>
          <input
            type="number"
            value={proteinInput}
            onChange={(e) => setProteinInput(e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm mb-3"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="bg-accent text-white font-semibold py-2 px-4 rounded-md text-xs disabled:opacity-60"
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
