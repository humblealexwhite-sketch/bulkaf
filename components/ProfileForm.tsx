"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MealSlot } from "@/lib/mealPlan";
import MealWeightSliders from "@/components/MealWeightSliders";

type Profile = {
  name: string | null;
  weight: number;
  goal_weight: number;
  goal_date: string;
  manual_calorie_target: number | null;
  pct_fruehstueck: number;
  pct_mittag: number;
  pct_nachmittag: number;
  pct_abend: number;
};

export default function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(profile.name ?? "");
  const [startWeight, setStartWeight] = useState(String(profile.weight));
  const [goalWeight, setGoalWeight] = useState(String(profile.goal_weight));
  const [goalDate, setGoalDate] = useState(profile.goal_date);
  const [calorieTarget, setCalorieTarget] = useState(
    profile.manual_calorie_target != null ? String(profile.manual_calorie_target) : ""
  );
  const [pct, setPct] = useState<Record<MealSlot, number>>({
    fruehstueck: profile.pct_fruehstueck * 100,
    mittag: profile.pct_mittag * 100,
    nachmittag: profile.pct_nachmittag * 100,
    abend: profile.pct_abend * 100,
  });

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
        goal_weight: parseFloat(goalWeight),
        goal_date: goalDate,
        manual_calorie_target: calorieTarget ? parseFloat(calorieTarget) : null,
        pct_fruehstueck: pct.fruehstueck / 100,
        pct_mittag: pct.mittag / 100,
        pct_nachmittag: pct.nachmittag / 100,
        pct_abend: pct.abend / 100,
      })
      .eq("user_id", user.id);

    setLoading(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <label className="block text-xs text-muted uppercase tracking-wide mb-1.5">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dein Name"
          className="w-full px-3 py-2 rounded-lg text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-muted uppercase tracking-wide mb-1.5">Anfangsgewicht (kg)</label>
          <input
            type="number"
            step="0.1"
            value={startWeight}
            onChange={(e) => setStartWeight(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-muted uppercase tracking-wide mb-1.5">Zielgewicht (kg)</label>
          <input
            type="number"
            step="0.1"
            value={goalWeight}
            onChange={(e) => setGoalWeight(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-muted uppercase tracking-wide mb-1.5">Zieldatum</label>
        <input
          type="date"
          value={goalDate}
          onChange={(e) => setGoalDate(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-xs text-muted uppercase tracking-wide mb-1.5">
          Kalorienziel manuell (leer = automatisch berechnet)
        </label>
        <input
          type="number"
          value={calorieTarget}
          onChange={(e) => setCalorieTarget(e.target.value)}
          placeholder="z.B. 3800"
          className="w-full px-3 py-2 rounded-lg text-sm"
        />
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
