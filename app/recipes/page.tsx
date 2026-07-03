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
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-start mb-1">
          <h1 className="text-3xl font-bold">
            BULK<span className="text-accent">AF</span>
          </h1>
          <Link href="/dashboard" className="text-muted text-[11px] uppercase tracking-wide underline underline-offset-2">
            Zurück
          </Link>
        </div>
        <p className="text-muted text-xs uppercase tracking-widest mb-8">Rezepte & Nahrungsmittel</p>

        {MEAL_SLOTS.map((slot, slotIdx) => {
          const slotRecipes = recipes.filter((r: any) => r.meal_type === slot.key);
          return (
            <div key={slot.key} className="mb-6">
              <div className="text-muted text-xs uppercase tracking-widest mb-2">{slot.label}</div>
              {slotRecipes.length === 0 && (
                <p className="text-muted text-sm py-2">Noch keine Rezepte.</p>
              )}
              {slotRecipes.map((r: any, i: number) => (
                <div key={r.id}>
                  <div className="flex justify-between items-baseline py-3">
                    <div>
                      <div className="font-semibold text-[15px]">{r.name}</div>
                      <div className="text-muted text-xs mt-0.5">
                        {(r.recipe_items ?? []).map((it: any) => it.foods?.name).join(", ")}
                      </div>
                    </div>
                    {r.user_id === null && (
                      <span className="text-muted text-[10px] uppercase shrink-0 ml-3">Standard</span>
                    )}
                  </div>
                  {i < slotRecipes.length - 1 && <div className="border-t border-line" />}
                </div>
              ))}
              {slotIdx < MEAL_SLOTS.length - 1 && <div className="border-t border-line mt-3" />}
            </div>
          );
        })}

        <div className="mb-10 pt-2">
          <CreateRecipeForm
            foods={(foods ?? []).map((f) => ({ id: f.id, name: f.name, unit: f.unit }))}
          />
        </div>

        <div className="border-t border-line pt-4">
          <div className="text-muted text-xs uppercase tracking-widest mb-3">Nahrungsmittel</div>
          {(foods ?? []).map((f, i) => (
            <div key={f.id}>
              <div className="flex justify-between py-2.5 text-[13px]">
                <span>
                  {f.name} {f.user_id !== null && <span className="text-muted">(eigenes)</span>}
                </span>
                <span className="text-muted text-right">
                  {f.kcal} kcal / 100{f.unit} · P{f.protein} C{f.carbs} F{f.fat}
                  {f.price != null && ` · ${f.price.toFixed(2)}€ ${f.price_note ?? ""}`}
                </span>
              </div>
              {i < (foods?.length ?? 0) - 1 && <div className="border-t border-line" />}
            </div>
          ))}
        </div>

        <div className="pt-4">
          <CreateFoodForm />
        </div>
      </div>
    </div>
  );
}
