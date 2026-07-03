"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MealSlot } from "@/lib/mealPlan";

export type RecipeOption = { id: string; name: string };

export default function RecipePicker({
  slot,
  mealPrep,
  options,
  currentRecipeId,
  onDone,
}: {
  slot: MealSlot;
  mealPrep: boolean;
  options: RecipeOption[];
  currentRecipeId: string | null;
  onDone: () => void;
}) {
  const supabase = createClient();
  const [recipeId, setRecipeId] = useState(currentRecipeId ?? options[0]?.id ?? "");
  const [days, setDays] = useState(3);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!recipeId) return;
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date();
    const plannedUntil = mealPrep
      ? new Date(today.getTime() + days * 86400000).toISOString().slice(0, 10)
      : null;

    await supabase.from("active_meal_plan").upsert(
      {
        user_id: user.id,
        meal_slot: slot,
        recipe_id: recipeId,
        started_at: today.toISOString().slice(0, 10),
        planned_until: plannedUntil,
      },
      { onConflict: "user_id,meal_slot" }
    );

    setLoading(false);
    onDone();
  }

  return (
    <div className="bg-panel2 border border-line rounded-sm p-4">
      <label className="block text-xs text-muted uppercase tracking-wide mb-1.5">Rezept</label>
      <select
        value={recipeId}
        onChange={(e) => setRecipeId(e.target.value)}
        className="w-full px-3 py-2 rounded-sm text-sm mb-3"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>

      {mealPrep && (
        <>
          <label className="block text-xs text-muted uppercase tracking-wide mb-1.5">
            Für wie viele Tage meal-preppen?
          </label>
          <input
            type="number"
            min={1}
            max={14}
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 rounded-sm text-sm mb-3"
          />
        </>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={loading || !recipeId}
        className="w-full bg-accent text-[#171310] font-display font-semibold uppercase tracking-wide py-2 rounded-sm text-xs disabled:opacity-60"
      >
        {loading ? "Speichern..." : "Übernehmen"}
      </button>
    </div>
  );
}
