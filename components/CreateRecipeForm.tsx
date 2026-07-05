"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MealSlot } from "@/lib/mealPlan";
import { EQUIPMENT_OPTIONS } from "@/lib/equipment";

type FoodOption = { id: string; name: string; unit: string };

export default function CreateRecipeForm({ foods }: { foods: FoodOption[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [mealType, setMealType] = useState<MealSlot>("mittag");
  const [equipment, setEquipment] = useState<Set<string>>(new Set());
  const [rows, setRows] = useState<{ foodId: string; amount: string }[]>([
    { foodId: foods[0]?.id ?? "", amount: "" },
  ]);

  function toggleEquipment(key: string) {
    setEquipment((cur) => {
      const next = new Set(cur);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function updateRow(i: number, field: "foodId" | "amount", value: string) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    setRows((r) => [...r, { foodId: foods[0]?.id ?? "", amount: "" }]);
  }

  function removeRow(i: number) {
    setRows((r) => r.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validRows = rows.filter((r) => r.foodId && parseFloat(r.amount) > 0);
    if (!name || validRows.length === 0) {
      setError("Name und mindestens eine Zutat mit Menge sind Pflicht.");
      return;
    }
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .insert({ user_id: user.id, name, meal_type: mealType, required_equipment: Array.from(equipment) })
      .select()
      .single();

    if (recipeError || !recipe) {
      setLoading(false);
      setError(recipeError?.message ?? "Fehler beim Speichern.");
      return;
    }

    const { error: itemsError } = await supabase.from("recipe_items").insert(
      validRows.map((r) => ({
        recipe_id: recipe.id,
        food_id: r.foodId,
        amount: parseFloat(r.amount),
      }))
    );

    setLoading(false);
    if (itemsError) {
      setError(itemsError.message);
      return;
    }

    setName("");
    setEquipment(new Set());
    setRows([{ foodId: foods[0]?.id ?? "", amount: "" }]);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-accent text-xs uppercase tracking-wide underline underline-offset-2"
      >
        + Neues Rezept
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-panel2 border border-line rounded-sm p-4 space-y-3">
      <input
        placeholder="Rezeptname"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2 rounded-sm text-sm"
      />
      <select
        value={mealType}
        onChange={(e) => setMealType(e.target.value as MealSlot)}
        className="w-full px-3 py-2 rounded-sm text-sm"
      >
        <option value="fruehstueck">Frühstück (Shake)</option>
        <option value="mittag">Mittagessen</option>
        <option value="nachmittag">Nachmittags-Shake</option>
        <option value="abend">Abendessen</option>
      </select>

      <div>
        <div className="text-muted text-[11px] uppercase tracking-wide mb-1.5">Benötigtes Equipment</div>
        <div className="flex flex-wrap gap-1.5">
          {EQUIPMENT_OPTIONS.map((eq) => (
            <button
              key={eq.key}
              type="button"
              onClick={() => toggleEquipment(eq.key)}
              className={`text-xs px-2.5 py-1.5 rounded-sm transition-colors ${
                equipment.has(eq.key) ? "bg-accent text-white" : "bg-white/5 text-muted"
              }`}
            >
              {eq.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2">
            <select
              value={row.foodId}
              onChange={(e) => updateRow(i, "foodId", e.target.value)}
              className="flex-1 px-3 py-2 rounded-sm text-sm"
            >
              {foods.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <input
              placeholder="Menge"
              type="number"
              value={row.amount}
              onChange={(e) => updateRow(i, "amount", e.target.value)}
              className="w-24 px-3 py-2 rounded-sm text-sm"
            />
            {rows.length > 1 && (
              <button type="button" onClick={() => removeRow(i)} className="text-muted px-2">
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      <button type="button" onClick={addRow} className="text-muted text-xs uppercase tracking-wide underline underline-offset-2">
        + Zutat
      </button>

      {error && <p className="text-accent text-xs">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="bg-accent text-white font-semibold uppercase tracking-wide py-2 px-4 rounded-sm text-xs disabled:opacity-60">
          {loading ? "Speichern..." : "Rezept speichern"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-muted text-xs uppercase tracking-wide">
          Abbrechen
        </button>
      </div>
    </form>
  );
}