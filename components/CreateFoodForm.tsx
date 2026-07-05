"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CreateFoodForm() {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [unit, setUnit] = useState<"g" | "ml">("g");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [price, setPrice] = useState("");
  const [priceNote, setPriceNote] = useState("");
  const [brand, setBrand] = useState("");
  const [store, setStore] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !kcal) {
      setError("Name und Kalorien sind Pflicht.");
      return;
    }
    setLoading(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error: insertError } = await supabase.from("foods").insert({
      user_id: user.id,
      name,
      unit,
      kcal: parseFloat(kcal),
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      price: price ? parseFloat(price) : null,
      price_note: priceNote || null,
      brand: brand || null,
      store: store || null,
    });

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setName("");
    setKcal("");
    setProtein("");
    setCarbs("");
    setFat("");
    setPrice("");
    setPriceNote("");
    setBrand("");
    setStore("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-accent text-white text-[11px] font-bold uppercase tracking-wide rounded-md py-1.5 px-5"
        >
          + Neues Nahrungsmittel
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-panel2 border border-line rounded-sm p-4 space-y-3">
      <input
        placeholder="Name (z.B. Magerquark)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2 rounded-sm text-sm"
      />
      <div className="grid grid-cols-2 gap-3">
        <select value={unit} onChange={(e) => setUnit(e.target.value as "g" | "ml")} className="px-3 py-2 rounded-sm text-sm">
          <option value="g">pro 100g</option>
          <option value="ml">pro 100ml</option>
        </select>
        <input
          placeholder="kcal"
          type="number"
          value={kcal}
          onChange={(e) => setKcal(e.target.value)}
          className="px-3 py-2 rounded-sm text-sm"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <input placeholder="Protein g" type="number" value={protein} onChange={(e) => setProtein(e.target.value)} className="px-3 py-2 rounded-sm text-sm" />
        <input placeholder="Carbs g" type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} className="px-3 py-2 rounded-sm text-sm" />
        <input placeholder="Fett g" type="number" value={fat} onChange={(e) => setFat(e.target.value)} className="px-3 py-2 rounded-sm text-sm" />
      </div>
      <input
        placeholder="Marke (optional)"
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        className="w-full px-3 py-2 rounded-sm text-sm"
      />
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Preis (optional)" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="px-3 py-2 rounded-sm text-sm" />
        <input placeholder="z.B. 500g" value={priceNote} onChange={(e) => setPriceNote(e.target.value)} className="px-3 py-2 rounded-sm text-sm" />
      </div>
      <select value={store} onChange={(e) => setStore(e.target.value)} className="w-full px-3 py-2 rounded-sm text-sm">
        <option value="">Supermarkt (optional)</option>
        <option value="Lidl">Lidl</option>
        <option value="Aldi">Aldi</option>
        <option value="Rewe">Rewe</option>
        <option value="Kaufland">Kaufland</option>
      </select>
      {error && <p className="text-accent text-xs">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="bg-accent text-white font-semibold uppercase tracking-wide py-2 px-4 rounded-sm text-xs disabled:opacity-60">
          {loading ? "Speichern..." : "Speichern"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-muted text-xs uppercase tracking-wide">
          Abbrechen
        </button>
      </div>
    </form>
  );
}