"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MealSlot, ScaledMeal } from "@/lib/mealPlan";
import RecipePicker, { RecipeOption } from "@/components/RecipePicker";

const SLOT_ICON: Record<MealSlot, string> = {
  fruehstueck: "ti-bottle",
  mittag: "ti-soup",
  nachmittag: "ti-bottle",
  abend: "ti-soup",
};

export default function MealCard({
  slot,
  label,
  meal,
  eaten,
  mealPrep,
  activeUntil,
  expired,
  recipeOptions,
  isLast,
}: {
  slot: MealSlot;
  label: string;
  meal: ScaledMeal | null;
  eaten: boolean;
  mealPrep: boolean;
  activeUntil: string | null;
  expired: boolean;
  recipeOptions: RecipeOption[];
  isLast?: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
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
    <div>
      <div className="flex items-center py-3 cursor-pointer" onClick={() => setOpen((v) => !v)}>
        <i className={`ti ${SLOT_ICON[slot]} text-accent text-[22px] mr-4 shrink-0`} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[16px]">{label}</div>
          <div className="text-muted text-xs uppercase tracking-wide truncate">
            {meal ? meal.recipeName : "Kein Rezept"}
          </div>
        </div>
        {meal && (
          <input
            type="checkbox"
            checked={eaten}
            disabled={loading}
            onClick={(e) => e.stopPropagation()}
            onChange={toggleEaten}
            className="w-4 h-4 mr-3 accent-accent shrink-0"
          />
        )}
        {meal && (
          <div className="text-right mr-2">
            <span className="font-display text-xl">{meal.totalKcal}</span>{" "}
            <span className="text-muted text-[11px]">kcal</span>
          </div>
        )}
        <i
          className={`ti ti-chevron-right text-muted text-base transition-transform shrink-0 ${
            open ? "rotate-90" : ""
          }`}
          aria-hidden="true"
        />
      </div>

      {open && (
        <div className="pl-[38px] pb-3">
          {mealPrep && meal && (
            <div className="mb-2">
              {activeUntil && !expired && (
                <span className="inline-block text-xs bg-ok/10 text-ok px-1.5 py-0.5 rounded-sm mb-2">
                  Aktiv bis {new Date(activeUntil).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}
                </span>
              )}
              {expired && (
                <span className="inline-block text-xs bg-warn/10 text-warn px-1.5 py-0.5 rounded-sm mb-2">
                  Zeit für ein neues Rezept
                </span>
              )}
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPicker((v) => !v);
                  }}
                  className="bg-accent text-white text-[11px] font-bold uppercase tracking-wide rounded-md py-1.5 px-4"
                >
                  Rezept Wechseln
                </button>
                <span className="text-muted text-xs">
                  <b className="text-text">{meal.protein}g</b> Protein
                </span>
              </div>
            </div>
          )}
          {!mealPrep && meal && (
            <div className="flex justify-between items-center mb-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPicker((v) => !v);
                }}
                className="bg-accent text-white text-[11px] font-bold uppercase tracking-wide rounded-md py-1.5 px-4"
              >
                Rezept Wechseln
              </button>
              <span className="text-muted text-xs">
                <b className="text-text">{meal.protein}g</b> Protein
              </span>
            </div>
          )}

          {showPicker && (
            <div className="mb-3" onClick={(e) => e.stopPropagation()}>
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
                <div key={i} className="flex justify-between py-1 text-sm">
                  <span>{ing.name}</span>
                  <span className="text-muted">
                    {ing.grams}
                    {ing.unit}
                  </span>
                </div>
              ))}
              {meal.estimatedPrice != null && (
                <div className="text-center text-muted text-sm mt-2">
                  Durchschnittlicher Gesamtpreis* | {meal.estimatedPrice.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                </div>
              )}
            </>
          )}
        </div>
      )}
      {!isLast && <div className="border-t border-line" />}
    </div>
  );
}