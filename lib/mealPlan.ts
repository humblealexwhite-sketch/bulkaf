export type MealSlot = "fruehstueck" | "mittag" | "nachmittag" | "abend";

export const MEAL_SLOTS: { key: MealSlot; label: string; mealPrep: boolean }[] = [
  { key: "fruehstueck", label: "Frühstück", mealPrep: false },
  { key: "mittag", label: "Mittagessen", mealPrep: true },
  { key: "nachmittag", label: "Nachmittags-Shake", mealPrep: false },
  { key: "abend", label: "Abendessen", mealPrep: true },
];

export const DEFAULT_MEAL_PCT: Record<MealSlot, number> = {
  fruehstueck: 0.28,
  mittag: 0.32,
  nachmittag: 0.18,
  abend: 0.22,
};

export function getMealPct(
  profile: { pct_fruehstueck?: number | null; pct_mittag?: number | null; pct_nachmittag?: number | null; pct_abend?: number | null },
  slot: MealSlot
): number {
  const map: Record<MealSlot, number | null | undefined> = {
    fruehstueck: profile.pct_fruehstueck,
    mittag: profile.pct_mittag,
    nachmittag: profile.pct_nachmittag,
    abend: profile.pct_abend,
  };
  return map[slot] ?? DEFAULT_MEAL_PCT[slot];
}

export type Food = {
  id: string;
  name: string;
  unit: "g" | "ml";
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number | null;
  price_note: string | null;
};

export type RecipeItem = { amount: number; food: Food };

export type Recipe = {
  id: string;
  name: string;
  meal_type: MealSlot;
  user_id: string | null;
  items: RecipeItem[];
};

export type ScaledIngredient = { name: string; grams: number; unit: string; kcal: number };

export type ScaledMeal = {
  recipeId: string;
  recipeName: string;
  slot: MealSlot;
  totalKcal: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: ScaledIngredient[];
  estimatedPrice: number | null;
};

export function scaleRecipe(recipe: Recipe, targetKcal: number): ScaledMeal {
  const baseKcal = recipe.items.reduce((s, it) => s + (it.food.kcal * it.amount) / 100, 0);
  const scale = baseKcal > 0 ? targetKcal / baseKcal : 1;

  let totalKcal = 0,
    protein = 0,
    carbs = 0,
    fat = 0;

  const ingredients: ScaledIngredient[] = recipe.items.map((it) => {
    const grams = Math.round(it.amount * scale);
    const kcal = (it.food.kcal * grams) / 100;
    totalKcal += kcal;
    protein += (it.food.protein * grams) / 100;
    carbs += (it.food.carbs * grams) / 100;
    fat += (it.food.fat * grams) / 100;
    return { name: it.food.name, grams, unit: it.food.unit, kcal: Math.round(kcal) };
  });

  return {
    recipeId: recipe.id,
    recipeName: recipe.name,
    slot: recipe.meal_type,
    totalKcal: Math.round(totalKcal),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    ingredients,
    // Preis pro Portion braucht eine normierte Referenzmenge pro Produkt (z.B. immer "pro kg").
    // Bis deine echte Produktliste mit einheitlichem Preisformat da ist, zeigen wir nur den
    // Packungspreis in der Datenbank-Ansicht an, rechnen ihn aber noch nicht auf Portionen um.
    estimatedPrice: null,
  };
}

export function isExpired(plannedUntil: string | null): boolean {
  if (!plannedUntil) return false;
  const today = new Date().toISOString().slice(0, 10);
  return plannedUntil < today;
}
