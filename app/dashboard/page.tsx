import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calcDailyTarget, calcProteinTarget, Profile } from "@/lib/calculations";
import { MEAL_SLOTS, MealSlot, Recipe, getMealPct, isExpired, scaleRecipe } from "@/lib/mealPlan";
import NutritionCard from "@/components/NutritionCard";
import StatsHeader from "@/components/StatsHeader";
import MealCard from "@/components/MealCard";
import SideMenu from "@/components/SideMenu";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/setup");
  if (!profile.go_to_store) redirect("/setup/equipment");

  const { data: weightLogs } = await supabase
    .from("weight_logs")
    .select("weight, log_date")
    .eq("user_id", user.id)
    .order("log_date", { ascending: true });

  const p: Profile = {
    weight: profile.weight,
    goal_weight: profile.goal_weight,
    goal_date: profile.goal_date,
    height: profile.height,
    age: profile.age,
    gender: profile.gender,
    activity: profile.activity,
  };

  const latestWeight =
    weightLogs && weightLogs.length ? weightLogs[weightLogs.length - 1].weight : p.weight;
  const { tdee, target: calcCalorieTarget, days } = calcDailyTarget(p);
  const calcProteinGoal = calcProteinTarget(latestWeight);

  const calorieTarget = profile.manual_calorie_target ?? calcCalorieTarget;
  const proteinTarget = profile.manual_protein_target ?? calcProteinGoal;

  // Rezepte laden (global + eigene), inkl. Zutaten
  const { data: recipesRaw } = await supabase
    .from("recipes")
    .select(
      "id, name, meal_type, user_id, required_equipment, recipe_items(amount, foods(id, name, unit, kcal, protein, carbs, fat, price, price_note, piece_weight))"
    )
    .or(`user_id.is.null,user_id.eq.${user.id}`);

  const userEquipment: string[] = profile.equipment ?? [];
  const allRecipes: Recipe[] = (recipesRaw ?? [])
    .filter((r: any) => (r.required_equipment ?? []).every((eq: string) => userEquipment.includes(eq)))
    .map((r: any) => ({
      id: r.id,
      name: r.name,
      meal_type: r.meal_type,
      user_id: r.user_id,
      items: (r.recipe_items ?? []).map((it: any) => ({ amount: it.amount, food: it.foods })),
    }));

  const { data: activePlans } = await supabase
    .from("active_meal_plan")
    .select("*")
    .eq("user_id", user.id);

  const today = new Date().toISOString().slice(0, 10);
  const { data: todaysLog } = await supabase
    .from("meal_log")
    .select("meal_slot, kcal, protein")
    .eq("user_id", user.id)
    .eq("log_date", today);

  const eatenSlots = new Set((todaysLog ?? []).map((l) => l.meal_slot));
  const eatenKcal = (todaysLog ?? []).reduce((s, l) => s + Number(l.kcal), 0);
  const eatenProtein = (todaysLog ?? []).reduce((s, l) => s + Number(l.protein ?? 0), 0);

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto relative w-full h-[440px] overflow-hidden">
        <img src="/hero-bull.png" alt="BulkAF" className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-bg" />
        <SideMenu signOutAction={signOut} name={profile.name} />
      </div>

      <div className="px-6 -mt-24 relative z-10 pb-8">
      <div className="max-w-md mx-auto">
        <NutritionCard
          calorieTarget={calorieTarget}
          calorieEaten={eatenKcal}
          proteinTarget={proteinTarget}
          proteinEaten={eatenProtein}
          manualCalorieTarget={profile.manual_calorie_target}
          manualProteinTarget={profile.manual_protein_target}
        />

        <StatsHeader
          startWeight={p.weight}
          latestWeight={latestWeight}
          goalWeight={p.goal_weight}
          goalDate={p.goal_date}
          startDate={profile.start_date}
          daysLeft={days}
          weightLogs={weightLogs ?? []}
        />

        <div className="mt-7 border-t-4 border-line pt-7">
          {(() => {
            const totalPrice = MEAL_SLOTS.reduce((sum, slotDef) => {
              let recipesForSlot = allRecipes.filter((r) => r.meal_type === slotDef.key);
              if (slotDef.key === "fruehstueck") {
                const shakes = allRecipes.filter((r) => r.meal_type === "nachmittag");
                recipesForSlot = [...recipesForSlot, ...shakes];
              }
              const plan = (activePlans ?? []).find((pl) => pl.meal_slot === slotDef.key);
              const expired = plan ? isExpired(plan.planned_until) : false;
              let activeRecipe: Recipe | undefined;
              if (plan && !expired) activeRecipe = recipesForSlot.find((r) => r.id === plan.recipe_id);
              if (!activeRecipe) activeRecipe = recipesForSlot.find((r) => r.user_id === null) ?? recipesForSlot[0];
              const meal = activeRecipe ? scaleRecipe(activeRecipe, calorieTarget * getMealPct(profile, slotDef.key)) : null;
              return sum + (meal?.estimatedPrice ?? 0);
            }, 0);

            return (
              <div className="flex justify-between items-baseline mb-3">
                <div className="text-muted text-xs uppercase tracking-widest">Heutige Mahlzeiten</div>
                {totalPrice > 0 && (
                  <div className="text-muted text-xs uppercase tracking-widest">
                    ≈ {totalPrice.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                  </div>
                )}
              </div>
            );
          })()}

          {MEAL_SLOTS.map((slotDef, i) => {
            let recipesForSlot = allRecipes.filter((r) => r.meal_type === slotDef.key);
            // Frühstück: Shakes zusätzlich erlauben, aber ans Listenende
            if (slotDef.key === "fruehstueck") {
              const shakes = allRecipes.filter((r) => r.meal_type === "nachmittag");
              recipesForSlot = [...recipesForSlot, ...shakes];
            }
            const plan = (activePlans ?? []).find((pl) => pl.meal_slot === slotDef.key);
            const expired = plan ? isExpired(plan.planned_until) : false;

            let activeRecipe: Recipe | undefined;
            if (plan && !expired) {
              activeRecipe = recipesForSlot.find((r) => r.id === plan.recipe_id);
            }
            if (!activeRecipe) {
              activeRecipe = recipesForSlot.find((r) => r.user_id === null) ?? recipesForSlot[0];
            }

            const meal = activeRecipe ? scaleRecipe(activeRecipe, calorieTarget * getMealPct(profile, slotDef.key)) : null;

            return (
              <MealCard
                key={slotDef.key}
                slot={slotDef.key}
                label={slotDef.label}
                meal={meal}
                eaten={eatenSlots.has(slotDef.key)}
                mealPrep={slotDef.mealPrep}
                activeUntil={plan && !expired ? plan.planned_until : null}
                expired={!!plan && expired}
                recipeOptions={recipesForSlot.map((r) => ({ id: r.id, name: r.name }))}
                isLast={i === MEAL_SLOTS.length - 1}
              />
            );
          })}
        </div>

        <div className="h-4" />
      </div>
      </div>
    </div>
  );
}

async function signOut() {
  "use server";
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}