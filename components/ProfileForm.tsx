"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MealSlot } from "@/lib/mealPlan";
import MealWeightSliders from "@/components/MealWeightSliders";
import { EQUIPMENT_OPTIONS, STORE_OPTIONS } from "@/lib/equipment";

type Profile = {
  name: string | null;
  weight: number;
  goal_weight: number;
  goal_date: string;
  start_date: string | null;
  manual_calorie_target: number | null;
  pct_fruehstueck: number;
  pct_mittag: number;
  pct_nachmittag: number;
  pct_abend: number;
  equipment: string[] | null;
  go_to_store: string | null;
};

export default function ProfileForm({
  profile,
  calculatedTarget,
}: {
  profile: Profile;
  calculatedTarget: number;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(profile.name ?? "");
  const [startWeight, setStartWeight] = useState(String(profile.weight));
  const [startDate, setStartDate] = useState(
    profile.start_date ?? new Date().toISOString().slice(0, 10)
  );
  const [goalWeight, setGoalWeight] = useState(String(profile.goal_weight));
  const [goalDate, setGoalDate] = useState(profile.goal_date);
  const [calorieTarget, setCalorieTarget] = useState(
    String(profile.manual_calorie_target ?? Math.round(calculatedTarget))
  );
  const [pct, setPct] = useState<Record<MealSlot, number>>({
    fruehstueck: profile.pct_fruehstueck * 100,
    mittag: profile.pct_mittag * 100,
    nachmittag: profile.pct_nachmittag * 100,
    abend: profile.pct_abend * 100,
  });
  const [equipment, setEquipment] = useState<Set<string>>(new Set(profile.equipment ?? []));
  const [goToStore, setGoToStore] = useState<string | null>(profile.go_to_store);

  function toggleEquipment(key: string) {
    setEquipment((cur) => {
      const next = new Set(cur);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({
        name: name || null,
        weight: parseFloat(startWeight),
        start_date: startDate,
        goal_weight: parseFloat(goalWeight),
        goal_date: goalDate,
        manual_calorie_target: calorieTarget ? parseFloat(calorieTarget) : null,
        pct_fruehstueck: pct.fruehstueck / 100,
        pct_mittag: pct.mittag / 100,
        pct_nachmittag: pct.nachmittag / 100,
        pct_abend: pct.abend / 100,
        equipment: Array.from(equipment),
        go_to_store: goToStore,
      })
      .eq("user_id", user.id);

    setLoading(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-muted uppercase tracking-wide mb-1.5 min-h-[2rem] flex items-end">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dein Name"
            className="w-full px-3 py-2 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-muted uppercase tracking-wide mb-1.5 min-h-[2rem] flex items-end">
            Kalorienziel (kcal)
          </label>
          <input
            type="number"
            value={calorieTarget}
            onChange={(e) => setCalorieTarget(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-muted uppercase tracking-wide mb-1.5 min-h-[2rem] flex items-end">Anfangsgewicht (kg)</label>
          <input
            type="number"
            step="0.1"
            value={startWeight}
            onChange={(e) => setStartWeight(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-muted uppercase tracking-wide mb-1.5 min-h-[2rem] flex items-end">Zielgewicht (kg)</label>
          <input
            type="number"
            step="0.1"
            value={goalWeight}
            onChange={(e) => setGoalWeight(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-muted uppercase tracking-wide mb-1.5 min-h-[2rem] flex items-end">Anfangsdatum</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-muted uppercase tracking-wide mb-1.5 min-h-[2rem] flex items-end">Zieldatum</label>
          <input
            type="date"
            value={goalDate}
            onChange={(e) => setGoalDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
          />
        </div>
      </div>

      <p className="text-muted text-[11px] -mt-2">
        Kalorienziel ist mit dem berechneten Wert ({Math.round(calculatedTarget)} kcal) vorausgefüllt — du kannst es oben jederzeit manuell überschreiben.
      </p>

      <div className="border-t border-line pt-5">
        <div className="text-xs text-muted uppercase tracking-wide mb-3">Küchenausstattung</div>
        <div className="grid grid-cols-2 gap-1.5">
          {EQUIPMENT_OPTIONS.map((eq) => (
            <button
              key={eq.key}
              type="button"
              onClick={() => toggleEquipment(eq.key)}
              className={`flex items-center gap-1.5 px-2.5 py-2.5 rounded-md text-[13px] leading-tight text-left transition-colors ${
                equipment.has(eq.key) ? "bg-accent text-white" : "bg-white/5 text-text"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${
                  equipment.has(eq.key) ? "bg-white border-white" : "border-white/30"
                }`}
              >
                {equipment.has(eq.key) && <span className="w-2 h-2 bg-accent rounded-sm" />}
              </span>
              <span className="min-w-0 whitespace-pre-line">{eq.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-line pt-5">
        <div className="text-xs text-muted uppercase tracking-wide mb-3">Go-to-Laden</div>
        <div className="grid grid-cols-2 gap-2">
          {STORE_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setGoToStore(s)}
              className={`py-2.5 rounded-md text-sm font-semibold uppercase tracking-wide transition-colors ${
                goToStore === s ? "bg-accent text-white" : "bg-white/5 text-text"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-line pt-5">
        <div className="text-xs text-muted uppercase tracking-wide mb-4">
          Mahlzeiten-Gewichtung — wie viel % der Tageskalorien pro Mahlzeit
        </div>
        <MealWeightSliders initial={pct} onChange={setPct} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent text-white font-semibold py-3 rounded-lg text-sm disabled:opacity-60"
      >
        {loading ? "Speichern..." : "Speichern"}
      </button>
      {saved && <p className="text-ok text-sm text-center">Gespeichert!</p>}
    </form>
  );
}