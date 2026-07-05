"use client";

import { useState } from "react";

type RecipeRow = {
  id: string;
  name: string;
  meal_type: string;
  user_id: string | null;
  recipe_items?: { foods?: { name: string } | null }[];
};

const BUTTONS: { key: string; label: string; filterKey: string }[] = [
  { key: "fruehstueck", label: "Früh", filterKey: "nachmittag" }, // vorerst: gleiche Auswahl wie Shakes
  { key: "mittag", label: "Mittag", filterKey: "mittag" },
  { key: "abend", label: "Abend", filterKey: "abend" },
  { key: "nachmittag", label: "Shakes", filterKey: "nachmittag" },
];

export default function RecipesAccordion({ recipes }: { recipes: RecipeRow[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [openRecipe, setOpenRecipe] = useState<string | null>(null);

  const activeRecipes = active
    ? recipes.filter((r) => r.meal_type === BUTTONS.find((b) => b.key === active)?.filterKey)
    : [];

  return (
    <div>
      <div className="grid grid-cols-4 gap-1.5">
        {BUTTONS.map((b) => (
          <button
            key={b.key}
            type="button"
            onClick={() => setActive((cur) => (cur === b.key ? null : b.key))}
            className={`text-[11px] uppercase tracking-wide font-semibold py-2.5 rounded-md text-center transition-colors ${
              active === b.key ? "bg-accent text-white" : "bg-white/5 text-muted"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {active && (
        <div className="mt-3 card-glass rounded-lg p-4">
          {activeRecipes.length === 0 && (
            <p className="text-muted text-sm py-2">Noch keine Rezepte.</p>
          )}
          {activeRecipes.map((r, i) => {
            const ingredients = (r.recipe_items ?? [])
              .map((it) => it.foods?.name)
              .filter(Boolean) as string[];
            const isOpen = openRecipe === r.id;
            return (
              <div key={r.id}>
                <button
                  type="button"
                  onClick={() => setOpenRecipe((cur) => (cur === r.id ? null : r.id))}
                  className="w-full flex justify-between items-baseline py-3 text-left"
                >
                  <div>
                    <div className="font-semibold text-[15px]">{r.name}</div>
                    <div className="text-muted text-xs mt-0.5">{ingredients.join(", ")}</div>
                  </div>
                  {r.user_id === null && (
                    <span className="text-muted text-[10px] uppercase shrink-0 ml-3">Standard</span>
                  )}
                </button>

                {isOpen && (
                  <div className="pb-3 pl-1">
                    {ingredients.map((name, idx) => (
                      <div key={idx} className="text-[13px] text-text py-1">
                        {name}
                      </div>
                    ))}
                  </div>
                )}

                {i < activeRecipes.length - 1 && <div className="border-t border-line" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}