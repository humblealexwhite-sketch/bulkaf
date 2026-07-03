import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MEAL_SLOTS } from "@/lib/mealPlan";
import CreateFoodForm from "@/components/CreateFoodForm";
import CreateRecipeForm from "@/components/CreateRecipeForm";

export default async function RecipesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: foods } = await supabase
    .from("foods")
    .select("*")
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order("name");

  const { data: recipesRaw } = await supabase
    .from("recipes")
    .select("id, name, meal_type, user_id, recipe_items(amount, foods(name, unit))")
    .or(`user_id.is.null,user_id.eq.${user.id}`);

  const recipes = recipesRaw ?? [];

  return (
    <div className="min-h-screen px-5 py-10">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-start mb-1">
          <h1 className="text-3xl font-bold">
            BULK<span className="text-accent">AF</span>
          </h1>
          <Link href="/dashboard" className="text-muted text-[11px] uppercase tracking-wide underline underline-offset-2">
            Zurück
          </Link>
        </div>
        <p className="text-muted text-xs uppercase tracking-widest mb-8">Rezepte & Nahrungsmittel</p>

        {/* Recipes by meal type */}
        {MEAL_SLOTS.map((slot) => {
          const slotRecipes = recipes.filter((r: any) => r.meal_type === slot.key);
          return (
            <div key={slot.key} className="mb-6">
              <div className="text-muted text-[13px] tracking-widest uppercase mb-2">{slot.label}</div>
              {slotRecipes.length === 0 && (
                <p className="text-muted text-sm mb-2">Noch keine Rezepte.</p>
              )}
              {slotRecipes.map((r: any) => (
                <div key={r.id} className="bg-panel border border-line rounded-sm p-4 mb-2">
                  <div className="flex justify-between items-baseline">
                    <span className="font-display font-bold">{r.name}</span>
                    {r.user_id === null && (
                      <span className="text-muted text-[10px] uppercase">Standard</span>
                    )}
                  </div>
                  <div className="text-muted text-xs mt-1">
                    {(r.recipe_items ?? []).map((it: any) => it.foods?.name).join(", ")}
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        <div className="mb-10">
          <CreateRecipeForm
            foods={(foods ?? []).map((f) => ({ id: f.id, name: f.name, unit: f.unit }))}
          />
        </div>

        {/* Foods list */}
        <div className="text-muted text-[13px] tracking-widest uppercase mb-3">Nahrungsmittel</div>
        <div className="bg-panel border border-line rounded-sm p-4 mb-4">
          {(foods ?? []).map((f) => (
            <div key={f.id} className="flex justify-between py-2 text-[13px] border-b border-line last:border-none">
              <span>
                {f.name} {f.user_id !== null && <span className="text-muted">(eigenes)</span>}
              </span>
              <span className="text-muted">
                {f.kcal} kcal / 100{f.unit} · P{f.protein} C{f.carbs} F{f.fat}
                {f.price != null && ` · ${f.price.toFixed(2)}€ ${f.price_note ?? ""}`}
              </span>
            </div>
          ))}
        </div>

        <CreateFoodForm />
      </div>
    </div>
  );
}
