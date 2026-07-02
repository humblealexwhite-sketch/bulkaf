import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  bmiCategory,
  calcBMI,
  calcDailyTarget,
  scaleAllMeals,
  Profile,
} from "@/lib/calculations";
import { PRODUCTS } from "@/lib/products";
import GaugeRing from "@/components/GaugeRing";
import MealCard from "@/components/MealCard";
import LogWeightForm from "@/components/LogWeightForm";

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

  const { data: logs } = await supabase
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

  const latestWeight = logs && logs.length ? logs[logs.length - 1].weight : p.weight;
  const bmi = calcBMI(latestWeight, p.height);
  const { tdee, target, days, totalGainKg } = calcDailyTarget(p);
  const meals = scaleAllMeals(target);

  const totalDelta = p.goal_weight - p.weight;
  const currentDelta = latestWeight - p.weight;
  const pct = totalDelta !== 0 ? currentDelta / totalDelta : 0;

  async function signOut() {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="min-h-screen px-5 py-10">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-start mb-1">
          <h1 className="text-3xl font-bold">
            BULK<span className="text-accent">AF</span>
          </h1>
          <form action={signOut}>
            <button className="text-muted text-[11px] uppercase tracking-wide underline underline-offset-2">
              Logout
            </button>
          </form>
        </div>
        <p className="text-muted text-xs uppercase tracking-widest mb-6">
          Dreckig hoch. Kein Gemüse-Gerede.
        </p>

        {/* Gauge */}
        <div className="bg-panel border border-line rounded-sm p-5 mb-4 flex items-center gap-5">
          <GaugeRing pct={pct} />
          <div className="flex-1">
            <div className="font-display font-bold text-lg">
              {latestWeight.toFixed(1)} kg von {p.weight}kg → {p.goal_weight}kg
            </div>
            <div className="text-muted text-xs mt-1">
              {totalGainKg > 0
                ? `Noch ${(p.goal_weight - latestWeight).toFixed(1)}kg bis zum Ziel`
                : "Zielgewicht erreicht oder Zielrichtung geändert"}
            </div>
            <LogWeightForm />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3.5 mb-4">
          <div className="bg-panel border border-line rounded-sm p-4">
            <div className="font-display font-bold text-2xl text-accent2">{bmi.toFixed(1)}</div>
            <div className="text-[11px] text-muted uppercase tracking-wide mt-1.5">BMI</div>
            <div className="inline-block mt-2.5 bg-accent text-[#171310] font-display font-bold uppercase text-xs px-2.5 py-1 rounded-sm">
              {bmiCategory(bmi)}
            </div>
          </div>
          <div className="bg-panel border border-line rounded-sm p-4">
            <div className="font-display font-bold text-2xl text-accent2">
              {Math.round(target)}
            </div>
            <div className="text-[11px] text-muted uppercase tracking-wide mt-1.5">
              Kalorienziel / Tag
            </div>
            <div className="text-muted text-[11px] mt-2">
              Erhaltung: {Math.round(tdee)} kcal · Ziel: {p.goal_weight}kg in {days} Tagen
            </div>
          </div>
        </div>

        <div className="text-muted text-[13px] tracking-widest uppercase mt-8 mb-3">
          Tagesplan — 4 Mahlzeiten, dreckig kalkuliert
        </div>

        {meals.map((meal) => (
          <MealCard key={meal.key} meal={meal} />
        ))}

        <details className="mt-2">
          <summary className="cursor-pointer text-muted text-xs uppercase tracking-wide">
            Produktdatenbank anzeigen
          </summary>
          <div className="bg-panel border border-line rounded-sm p-4 mt-2.5">
            {Object.values(PRODUCTS).map((prod, i) => (
              <div
                key={i}
                className="flex justify-between py-2 text-[13px] border-b border-line last:border-none"
              >
                <span>{prod.name}</span>
                <span className="text-muted">
                  {prod.kcal} kcal / 100{prod.unit} · P{prod.p} C{prod.c} F{prod.f}
                </span>
              </div>
            ))}
          </div>
        </details>

        <p className="text-muted text-[11px] mt-6 leading-relaxed">
          BMI-Sprüche und Produktdatenbank sind Platzhalter-Schätzungen. Update die Werte in{" "}
          <code>lib/products.ts</code>, sobald deine echte Liste steht.
        </p>
      </div>
    </div>
  );
}
