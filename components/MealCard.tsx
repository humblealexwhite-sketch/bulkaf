"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MealSlot, ScaledMeal } from "@/lib/mealPlan";
import RecipePicker, { RecipeOption } from "@/components/RecipePicker";

export default function MealCard({
  slot,
  label,
  meal,
  eaten,
  mealPrep,
  activeUntil,
  expired,
  recipeOptions,
}: {
  slot: MealSlot;
  label: string;
  meal: ScaledMeal | null;
  eaten: boolean;
  mealPrep: boolean;
  activeUntil: string | null;
  expired: boolean;
  recipeOptions: RecipeOption[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  async function toggleEaten() {
    if (!meal) return;
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().slice(0, 10);

    if (eaten) {
      await supabase
        .from("meal_log")
        .delete()
        .eq("user_id", user.id)
        .eq("log_date", today)
        .eq("meal_slot", slot);
    } else {
      await supabase.from("meal_log").upsert({
        user_id: user.id,
        log_date: today,
        meal_slot: slot,
        kcal: meal.totalKcal,
        protein: meal.protein,
      });
    }
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="bg-panel border border-line border-l-[3px] border-l-accent rounded-sm p-5 mb-4">
      <div className="flex justify-between items-baseline mb-1">
        <h3 className="text-lg text-text normal-case tracking-normal font-display">{label}</h3>
        {meal && <div className="text-accent2 font-display font-bold text-base">{meal.totalKcal} kcal</div>}
      </div>

      {meal && (
        <div className="text-muted text-xs mb-3 flex items-center gap-2 flex-wrap">
          <span>{meal.recipeName}</span>
          {mealPrep && activeUntil && !expired && (
            <span className="bg-ok/10 text-ok px-1.5 py-0.5 rounded-sm">
              Aktiv bis {new Date(activeUntil).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}
            </span>
          )}
          {mealPrep && expired && (
            <span className="bg-accent/15 text-accent px-1.5 py-0.5 rounded-sm">
              Zeit für ein neues Rezept
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowPicker((v) => !v)}
            className="underline underline-offset-2"
          >
            {mealPrep ? "Rezept wechseln" : "Anderer Shake"}
          </button>
        </div>
      )}

      {showPicker && (
        <div className="mb-4">
          <RecipePicker
            slot={slot}
            mealPrep={mealPrep}
            options={recipeOptions}
            currentRecipeId={meal?.recipeId ?? null}
            onDone={() => {
              setShowPicker(false);
              router.refresh();
            }}
          />
        </div>
      )}

      {!meal ? (
        <p className="text-muted text-sm">Kein Rezept vorhanden — leg eins an unter "Rezepte verwalten".</p>
      ) : (
        <>
          {meal.ingredients.map((ing, i) => (
            <div
              key={i}
              className="flex justify-between py-1.5 text-sm border-b border-line last:border-none"
            >
              <span>{ing.name}</span>
              <span className="text-muted">
                {ing.grams}
                {ing.unit}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-line">
            <div className="flex gap-4 text-xs text-muted">
              <span>
                Protein <b className="text-text">{meal.protein}g</b>
              </span>
              <span>
                Carbs <b className="text-text">{meal.carbs}g</b>
              </span>
              <span>
                Fett <b className="text-text">{meal.fat}g</b>
              </span>
            </div>
            <button
              type="button"
              onClick={toggleEaten}
              disabled={loading}
              className={`font-display font-bold uppercase text-xs px-3 py-1.5 rounded-sm shrink-0 ${
                eaten ? "bg-ok text-[#12200a]" : "border border-line text-muted"
              }`}
            >
              {eaten ? "✓ Gegessen" : "Gegessen"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
