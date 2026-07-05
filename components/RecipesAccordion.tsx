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
  { key: "fruehstueck", label: "Frühstück", filterKey: "nachmittag" }, // vorerst: gleiche Auswahl wie Shakes
  { key: "mittag", label: "Mittagessen", filterKey: "mittag" },
  { key: "abend", label: "Abendessen", filterKey: "abend" },
  { key: "nachmittag", label: "Shakes", filterKey: "nachmittag" },
];

export default function RecipesAccordion({ recipes }: { recipes: RecipeRow[] }) {
  const [active, setActive] = useState<string | null>(null);

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
          {activeRecipes.map((r, i) => (
            <div key={r.id}>
              <div className="flex justify-between items-baseline py-3">
                <div>
                  <div className="font-semibold text-[15px]">{r.name}</div>
                  <div className="text-muted text-xs mt-0.5">
                    {(r.recipe_items ?? []).map((it) => it.foods?.name).filter(Boolean).join(", ")}
                  </div>
                </div>
                {r.user_id === null && (
                  <span className="text-muted text-[10px] uppercase shrink-0 ml-3">Standard</span>
                )}
              </div>
              {i < activeRecipes.length - 1 && <div className="border-t border-line" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
