import { PRODUCTS, RECIPES } from "./products";

export type Profile = {
  weight: number;
  goal_weight: number;
  goal_date: string; // ISO date
  height: number;
  age: number;
  gender: "m" | "w";
  activity: number;
};

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Zieh durch alter!";
  if (bmi < 25.0) return "Skinny Bitch!";
  if (bmi < 30.0) return "Destroyer 1";
  if (bmi < 35.0) return "Gladiator";
  return "Absoluter Wal-Modus";
}

export function calcBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function calcTDEE(p: Profile): number {
  const bmr =
    p.gender === "m"
      ? 10 * p.weight + 6.25 * p.height - 5 * p.age + 5
      : 10 * p.weight + 6.25 * p.height - 5 * p.age - 161;
  return bmr * p.activity;
}

export function calcDailyTarget(p: Profile) {
  const tdee = calcTDEE(p);
  const today = new Date();
  const goalDate = new Date(p.goal_date);
  const days = Math.max(1, Math.round((goalDate.getTime() - today.getTime()) / 86400000));
  const totalGainKg = p.goal_weight - p.weight;
  const dailySurplus = (totalGainKg * 7700) / days; // ~7700 kcal pro kg
  const target = tdee + dailySurplus;
  return { tdee, target: Math.max(target, tdee), days, totalGainKg };
}

export function calcProteinTarget(currentWeightKg: number): number {
  // ~2g Protein pro kg Körpergewicht — Standard-Richtwert für Muskelaufbau/Bulk
  return Math.round(currentWeightKg * 2);
}

export type ScaledIngredient = {
  name: string;
  grams: number;
  unit: string;
  kcal: number;
};

export type ScaledMeal = {
  key: string;
  label: string;
  totalKcal: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: ScaledIngredient[];
};

export function scaleMeal(recipeKey: string, targetKcal: number): ScaledMeal {
  const recipe = RECIPES.find((r) => r.key === recipeKey)!;
  const baseKcal = recipe.items.reduce(
    (sum, [id, g]) => sum + (PRODUCTS[id].kcal * g) / 100,
    0
  );
  const scale = baseKcal > 0 ? targetKcal / baseKcal : 1;

  let totalKcal = 0,
    protein = 0,
    carbs = 0,
    fat = 0;
  const ingredients: ScaledIngredient[] = recipe.items.map(([id, g]) => {
    const prod = PRODUCTS[id];
    const grams = Math.round(g * scale);
    const kcal = (prod.kcal * grams) / 100;
    totalKcal += kcal;
    protein += (prod.p * grams) / 100;
    carbs += (prod.c * grams) / 100;
    fat += (prod.f * grams) / 100;
    return { name: prod.name, grams, unit: prod.unit, kcal: Math.round(kcal) };
  });

  return {
    key: recipe.key,
    label: recipe.label,
    totalKcal: Math.round(totalKcal),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    ingredients,
  };
}

export function scaleAllMeals(dailyTargetKcal: number): ScaledMeal[] {
  return RECIPES.map((r) => scaleMeal(r.key, dailyTargetKcal * r.pct));
}
