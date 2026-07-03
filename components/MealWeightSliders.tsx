"use client";

import { useState } from "react";
import { MEAL_SLOTS, MealSlot } from "@/lib/mealPlan";

type Pct = Record<MealSlot, number>; // 0-100

export default function MealWeightSliders({
  initial,
  onChange,
}: {
  initial: Pct;
  onChange: (pct: Pct) => void;
}) {
  const [pct, setPct] = useState<Pct>(initial);

  function handleSlide(slot: MealSlot, rawValue: number) {
    const others = MEAL_SLOTS.map((s) => s.key).filter((k) => k !== slot) as MealSlot[];
    const oldValue = pct[slot];
    const newValue = Math.max(2, Math.min(94, rawValue)); // keep each between 2% and 94%
    const delta = newValue - oldValue;

    const othersTotal = others.reduce((s, k) => s + pct[k], 0);
    const next: Pct = { ...pct, [slot]: newValue };

    if (othersTotal <= 0) {
      const share = -delta / others.length;
      others.forEach((k) => (next[k] = Math.max(2, pct[k] + share)));
    } else {
      others.forEach((k) => {
        const ratio = pct[k] / othersTotal;
        next[k] = Math.max(2, pct[k] - delta * ratio);
      });
    }

    // normalize to exactly 100 to absorb rounding drift
    const total = MEAL_SLOTS.reduce((s, sl) => s + next[sl.key], 0);
    const scale = 100 / total;
    const final = {} as Pct;
    MEAL_SLOTS.forEach((sl) => (final[sl.key] = Math.round(next[sl.key] * scale * 10) / 10));

    setPct(final);
    onChange(final);
  }

  return (
    <div className="space-y-5">
      {MEAL_SLOTS.map((slot) => (
        <div key={slot.key}>
          <div className="flex justify-between text-sm mb-1.5">
            <span>{slot.label}</span>
            <span className="text-accent font-semibold">{pct[slot.key].toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min={2}
            max={94}
            step={1}
            value={pct[slot.key]}
            onChange={(e) => handleSlide(slot.key, parseFloat(e.target.value))}
            className="w-full accent-accent"
          />
        </div>
      ))}
      <div className="text-muted text-xs">
        Summe: {MEAL_SLOTS.reduce((s, sl) => s + pct[sl.key], 0).toFixed(0)}% (immer automatisch 100%)
      </div>
    </div>
  );
}
