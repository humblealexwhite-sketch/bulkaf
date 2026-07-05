import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CreateFoodForm from "@/components/CreateFoodForm";
import CreateRecipeForm from "@/components/CreateRecipeForm";
import RecipesAccordion from "@/components/RecipesAccordion";
import FoodsAccordion from "@/components/FoodsAccordion";

export default async function RecipesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: foods } = await supabase
    .from("foods")
    .select("*")
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order("name");

  const { data: recipesRaw } = await supabase
    .from("recipes")
    .select("id, name, meal_type, user_id, recipe_items(amount, foods(name, unit))")
    .or(`user_id.is.null,user_id.eq.${user.id}`);

  const recipes = recipesRaw ?? [];

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto relative w-full overflow-hidden" style={{ aspectRatio: "1915 / 1382" }}>
        <img src="/hangry-hero1.png" alt="BulkAF" className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-bg" />
        <Link
          href="/dashboard"
          className="absolute top-6 right-6 bg-black/70 text-white text-[11px] uppercase tracking-wide px-3 py-2 rounded-md"
        >
          Zurück
        </Link>
      </div>

      <div className="px-6 relative z-10 pb-8">
      <div className="max-w-md mx-auto pt-6">

        <div className="mb-4">
          <div className="text-muted text-xs uppercase tracking-widest mb-2">Rezepte</div>
          <RecipesAccordion recipes={recipes as any} />
        </div>

        <div className="mb-10 pt-2">
          <CreateRecipeForm
            foods={(foods ?? []).map((f) => ({ id: f.id, name: f.name, unit: f.unit }))}
          />
        </div>

        <div className="border-t border-line pt-6">
          <div className="text-muted text-xs uppercase tracking-widest mb-2">Nahrungsmittel</div>
          <FoodsAccordion foods={(foods ?? []) as any} />
        </div>

        <div className="pt-4">
          <CreateFoodForm />
        </div>
      </div>
      </div>
    </div>
  );
}