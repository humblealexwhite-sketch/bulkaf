import { ScaledMeal } from "@/lib/calculations";

export default function MealCard({ meal }: { meal: ScaledMeal }) {
  return (
    <div className="bg-panel border border-line border-l-[3px] border-l-accent rounded-sm p-5 mb-4">
      <div className="flex justify-between items-baseline mb-3">
        <h3 className="text-lg text-text normal-case tracking-normal font-display">
          {meal.label}
        </h3>
        <div className="text-accent2 font-display font-bold text-base">{meal.totalKcal} kcal</div>
      </div>
      {meal.ingredients.map((ing, i) => (
        <div
          key={i}
          className="flex justify-between py-1.5 text-sm border-b border-line last:border-none"
        >
          <span>{ing.name}</span>
          <span className="text-muted">
            {ing.grams}
            {ing.unit}
          </span>
        </div>
      ))}
      <div className="flex gap-4 mt-3 pt-3 border-t border-dashed border-line text-xs text-muted">
        <span>
          Protein <b className="text-text">{meal.protein}g</b>
        </span>
        <span>
          Carbs <b className="text-text">{meal.carbs}g</b>
        </span>
        <span>
          Fett <b className="text-text">{meal.fat}g</b>
        </span>
      </div>
    </div>
  );
}
