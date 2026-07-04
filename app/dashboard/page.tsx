import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calcDailyTarget, calcProteinTarget, Profile } from "@/lib/calculations";
import { MEAL_SLOTS, MealSlot, Recipe, getMealPct, isExpired, scaleRecipe } from "@/lib/mealPlan";
import NutritionCard from "@/components/NutritionCard";
import StatsHeader from "@/components/StatsHeader";
import MealCard from "@/components/MealCard";
import Link from "next/link";

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
      "id, name, meal_type, user_id, recipe_items(amount, foods(id, name, unit, kcal, protein, carbs, fat, price, price_note))"
    )
    .or(`user_id.is.null,user_id.eq.${user.id}`);

  const allRecipes: Recipe[] = (recipesRaw ?? []).map((r: any) => ({
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
          daysLeft={days}
          weightLogs={weightLogs ?? []}
        />

        <div className="border-t border-line pt-4">
          <div className="text-muted text-xs uppercase tracking-widest mb-3">Heutige Mahlzeiten</div>

          {MEAL_SLOTS.map((slotDef, i) => {
            const recipesForSlot = allRecipes.filter((r) => r.meal_type === slotDef.key);
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

        <div className="text-center mt-8 text-muted text-[11px]">
          <Link href="/recipes" className="underline underline-offset-2">
            Rezepte verwalten
          </Link>
          <span className="mx-2">·</span>
          <Link href="/profile" className="underline underline-offset-2">
            Mein Profil
          </Link>
          <span className="mx-2">·</span>
          <SignOutLink />
        </div>
      </div>
      </div>
    </div>
  );
}

function SignOutLink() {
  async function signOut() {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }
  return (
    <form action={signOut} className="inline">
      <button className="underline underline-offset-2">Logout</button>
    </form>
  );
}
