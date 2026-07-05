"use client";

import { useState } from "react";

type FoodRow = {
  id: string;
  name: string;
  unit: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number | null;
  price_note: string | null;
  brand: string | null;
  user_id: string | null;
  store: string | null;
};

const STORES = ["Lidl", "Aldi", "Rewe", "Kaufland"];

export default function FoodsAccordion({
  foods,
  defaultStore,
}: {
  foods: FoodRow[];
  defaultStore?: string | null;
}) {
  const [active, setActive] = useState<string | null>(defaultStore ?? null);

  const activeFoods = active
    ? foods.filter((f) => (f.store ?? "").toLowerCase() === active.toLowerCase())
    : [];

  return (
    <div>
      <div className="grid grid-cols-4 gap-1.5">
        {STORES.map((store) => (
          <button
            key={store}
            type="button"
            onClick={() => setActive((cur) => (cur === store ? null : store))}
            className={`text-[11px] uppercase tracking-wide font-semibold py-2.5 rounded-md text-center transition-colors ${
              active === store ? "bg-accent text-white" : "bg-white/5 text-muted"
            }`}
          >
            {store}
          </button>
        ))}
      </div>

      {active && (
        <div className="mt-3 card-glass rounded-lg p-4">
          {activeFoods.length === 0 && (
            <p className="text-muted text-sm py-2 text-center">Kommt bald!</p>
          )}
          {activeFoods.map((f, i) => (
            <div key={f.id}>
              <div className="flex justify-between items-start gap-3 py-2.5">
                <span className="text-[13px]">
                  {f.name} {f.user_id !== null && <span className="text-muted">(eigenes)</span>}
                </span>
                <div className="text-right shrink-0">
                  <span className="inline-block bg-white text-black text-[11px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap">
                    {f.kcal} kcal | {f.protein}g
                  </span>
                  {f.price != null && (
                    <div className="text-muted text-[11px] mt-1">
                      {f.price.toFixed(2)}€{f.price_note ? ` · ${f.price_note}` : ""}
                    </div>
                  )}
                  {(f.brand || f.store) && (
                    <div className="text-muted text-[11px] mt-0.5">
                      {[f.brand, f.store].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </div>
              </div>
              {i < activeFoods.length - 1 && <div className="border-t border-line" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}