import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { bmiCategory, calcBMI, calcDailyTarget, calcProteinTarget, Profile } from "@/lib/calculations";
import { MEAL_SLOTS, MealSlot, Recipe, isExpired, scaleRecipe } from "@/lib/mealPlan";
import NutritionCard from "@/components/NutritionCard";
import WeightCard from "@/components/WeightCard";
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
  const bmi = calcBMI(latestWeight, p.height);
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
    <div className="min-h-screen px-5 py-10">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-start mb-1">
          <h1 className="text-3xl font-bold">
            BULK<span className="text-accent">AF</span>
          </h1>
          <div className="flex items-center gap-4">
            <Link href="/recipes" className="text-muted text-[11px] uppercase tracking-wide underline underline-offset-2">
              Rezepte
            </Link>
            <SignOutButton />
          </div>
        </div>
        <p className="text-muted text-xs uppercase tracking-widest mb-6">
          Dreckig hoch. Kein Gemüse-Gerede.
        </p>

        <NutritionCard
          calorieTarget={calorieTarget}
          calorieEaten={eatenKcal}
          proteinTarget={proteinTarget}
          proteinEaten={eatenProtein}
          manualCalorieTarget={profile.manual_calorie_target}
          manualProteinTarget={profile.manual_protein_target}
        />

        <WeightCard logs={weightLogs ?? []} startWeight={p.weight} goalWeight={p.goal_weight} />

        {/* BMI */}
        <div className="bg-panel border border-line rounded-sm p-4 mb-4">
          <div className="font-display font-bold text-2xl text-accent2">{bmi.toFixed(1)}</div>
          <div className="text-[11px] text-muted uppercase tracking-wide mt-1.5">
            BMI · Erhaltung {Math.round(tdee)} kcal · Ziel {p.goal_weight}kg in {days} Tagen
          </div>
          <div className="inline-block mt-2.5 bg-accent text-[#171310] font-display font-bold uppercase text-xs px-2.5 py-1 rounded-sm">
            {bmiCategory(bmi)}
          </div>
        </div>

        <div className="text-muted text-[13px] tracking-widest uppercase mt-8 mb-3">
          Tagesplan — meal-prep-fähig
        </div>

        {MEAL_SLOTS.map((slotDef) => {
          const recipesForSlot = allRecipes.filter((r) => r.meal_type === slotDef.key);
          const plan = (activePlans ?? []).find((pl) => pl.meal_slot === slotDef.key);
          const expired = plan ? isExpired(plan.planned_until) : false;

          let activeRecipe: Recipe | undefined;
          if (plan && !expired) {
            activeRecipe = recipesForSlot.find((r) => r.id === plan.recipe_id);
          }
          if (!activeRecipe) {
            // Fallback: globales Standard-Rezept (oder erstes verfügbares) für diesen Slot
            activeRecipe =
              recipesForSlot.find((r) => r.user_id === null) ?? recipesForSlot[0];
          }

          const meal = activeRecipe ? scaleRecipe(activeRecipe, calorieTarget * slotDef.pct) : null;

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
            />
          );
        })}

        <p className="text-muted text-[11px] mt-6 leading-relaxed">
          Standard-Rezepte sind Platzhalter. Unter{" "}
          <Link href="/recipes" className="underline underline-offset-2">
            Rezepte verwalten
          </Link>{" "}
          kannst du eigene Nahrungsmittel und Rezepte anlegen.
        </p>
      </div>
    </div>
  );
}

function SignOutButton() {
  async function signOut() {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }
  return (
    <form action={signOut}>
      <button className="text-muted text-[11px] uppercase tracking-wide underline underline-offset-2">
        Logout
      </button>
    </form>
  );
}
