"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type FoodOption = { id: string; name: string; unit: string; kcal: number; protein: number };

export type SnackEntry = {
  id: string;
  foodName: string;
  grams: number;
  unit: string;
  kcal: number;
  protein: number;
};

export default function SnackLog({ entries, foods }: { entries: SnackEntry[]; foods: FoodOption[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [showForm, setShowForm] = useState(false);
  const [foodId, setFoodId] = useState(foods[0]?.id ?? "");
  const [grams, setGrams] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedFood = foods.find((f) => f.id === foodId);
  const gramsNum = parseFloat(grams);
  const preview =
    selectedFood && gramsNum > 0
      ? {
          kcal: Math.round((selectedFood.kcal * gramsNum) / 100),
          protein: Math.round((selectedFood.protein * gramsNum) / 100),
        }
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!foodId || !gramsNum) return;

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("snack_log").insert({
      user_id: user.id,
      log_date: new Date().toISOString().slice(0, 10),
      food_id: foodId,
      grams: gramsNum,
    });

    setGrams("");
    setShowForm(false);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from("snack_log").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="mt-7 border-t-4 border-line pt-7">
      <div className="flex justify-between items-baseline mb-3">
        <div className="text-muted text-xs uppercase tracking-widest">Snacks</div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="text-accent text-xs uppercase tracking-widest font-semibold"
        >
          {showForm ? "Abbrechen" : "+ Snack"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-glass rounded-lg p-4 mb-3 space-y-2.5">
          <select
            value={foodId}
            onChange={(e) => setFoodId(e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm"
          >
            {foods.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              placeholder={selectedFood?.unit === "ml" ? "ml" : "g"}
              required
              className="flex-1 px-3 py-2 rounded-md text-sm"
            />
            <button
              type="submit"
              disabled={loading || !preview}
              className="bg-accent text-white font-semibold text-sm px-4 py-2 rounded-md disabled:opacity-60"
            >
              Add
            </button>
          </div>
          {preview && (
            <p className="text-muted text-xs">
              ≈ <span className="text-text font-semibold">{preview.kcal} kcal</span> ·{" "}
              <span className="text-text font-semibold">{preview.protein}g</span> Protein
            </p>
          )}
        </form>
      )}

      {entries.length === 0 && !showForm && (
        <p className="text-muted text-sm">Noch keinen Snack geloggt heute.</p>
      )}

      {entries.map((entry) => (
        <div key={entry.id} className="flex items-center justify-between py-2 border-b border-line last:border-b-0">
          <div className="min-w-0">
            <div className="text-sm truncate">{entry.foodName}</div>
            <div className="text-muted text-xs">
              {entry.grams}
              {entry.unit} · {entry.protein}g Protein
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-display text-lg">{entry.kcal}</span>
            <span className="text-muted text-[11px]">kcal</span>
            <button
              type="button"
              onClick={() => handleDelete(entry.id)}
              aria-label="Snack löschen"
              className="text-muted hover:text-warn"
            >
              <i className="ti ti-x text-base" aria-hidden="true" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
