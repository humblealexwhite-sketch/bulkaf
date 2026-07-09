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
  piece_weight: number | null;
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

const POWDER_KEYWORDS = ["Proteinpulver", "Protein 90", "Kakaopulver", "Kakaupulver"];
const SPREAD_KEYWORDS = ["Nuss Nougat", "Nutella", "Erdnussbutter", "Konfitüre", "Marmelade", "Pesto", "Lotus", "Biscoff", "Dessertsoße", "Apfelmus", "Honig", "Blütenhonig"];
const LIQUID_KEYWORDS = ["Milch", "Saft", "Schlagsahne", "Kaffee", "Orangensaft"];

function smartRound(rawGrams: number, food: Food): number {
  const name = food.name;

  // Stück-Produkte: auf ganze Stücke runden
  if (food.piece_weight && food.piece_weight > 0) {
    const pieces = Math.max(1, Math.round(rawGrams / food.piece_weight));
    return pieces * food.piece_weight;
  }

  // Flüssigkeiten: auf nächste 50ml runden
  if (food.unit === "ml" || LIQUID_KEYWORDS.some(k => name.includes(k))) {
    return Math.max(50, Math.round(rawGrams / 50) * 50);
  }

  // Pulver: auf 10g runden
  if (POWDER_KEYWORDS.some(k => name.includes(k))) {
    return Math.max(10, Math.round(rawGrams / 10) * 10);
  }

  // Aufstriche & Soßen: auf 10g runden
  if (SPREAD_KEYWORDS.some(k => name.includes(k))) {
    return Math.max(10, Math.round(rawGrams / 10) * 10);
  }

  // Alles andere: auf 5g runden
  return Math.max(5, Math.round(rawGrams / 5) * 5);
}

export function scaleRecipe(recipe: Recipe, targetKcal: number): ScaledMeal {
  const baseKcal = recipe.items.reduce((s, it) => s + (it.food.kcal * it.amount) / 100, 0);
  const scale = baseKcal > 0 ? targetKcal / baseKcal : 1;

  let totalKcal = 0,
    protein = 0,
    carbs = 0,
    fat = 0;

  let estimatedPrice: number | null = null;

  const ingredients: ScaledIngredient[] = recipe.items.map((it) => {
    const rawGrams = it.amount * scale;
    const grams = smartRound(rawGrams, it.food);
    const kcal = Math.round((it.food.kcal * grams) / 100);
    protein += (it.food.protein * grams) / 100;
    carbs += (it.food.carbs * grams) / 100;
    fat += (it.food.fat * grams) / 100;

    // Preis: (Preis pro Packung / Packungsgewicht) × verwendete Menge
    if (it.food.price != null && it.food.price_note) {
      const totalWeightMatch = it.food.price_note.match(/(\d+(?:[.,]\d+)?)/);
      if (totalWeightMatch) {
        const packWeight = parseFloat(totalWeightMatch[1].replace(",", "."));
        if (packWeight > 0) {
          const pricePerUnit = it.food.price / packWeight;
          const ingredientPrice = pricePerUnit * grams;
          estimatedPrice = (estimatedPrice ?? 0) + ingredientPrice;
        }
      }
    }

    return { name: it.food.name, grams, unit: it.food.unit, kcal };
  });

  totalKcal = ingredients.reduce((s, ing) => s + ing.kcal, 0);

  return {
    recipeId: recipe.id,
    recipeName: recipe.name,
    slot: recipe.meal_type,
    totalKcal: Math.round(totalKcal),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    ingredients,
    estimatedPrice,
  };
}

export function isExpired(plannedUntil: string | null): boolean {
  if (!plannedUntil) return false;
  const today = new Date().toISOString().slice(0, 10);
  return plannedUntil < today;
}