"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type ExtraEntry = {
  id: string;
  label: string | null;
  kcal: number;
  protein: number;
};

export default function ExtraLog({ entries }: { entries: ExtraEntry[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const kcalNum = parseFloat(kcal);
    if (!kcalNum) return;

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("extra_log").insert({
      user_id: user.id,
      log_date: new Date().toISOString().slice(0, 10),
      label: label.trim() || null,
      kcal: kcalNum,
      protein: protein ? parseFloat(protein) : 0,
    });

    setLabel("");
    setKcal("");
    setProtein("");
    setShowForm(false);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from("extra_log").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="mt-7 border-t-4 border-line pt-7">
      <div className="flex justify-between items-baseline mb-3">
        <div className="text-muted text-xs uppercase tracking-widest">Extras</div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="text-accent text-xs uppercase tracking-widest font-semibold"
        >
          {showForm ? "Abbrechen" : "+ Extra"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-glass rounded-lg p-4 mb-3 space-y-2.5">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Was war's? (optional)"
            className="w-full px-3 py-2 rounded-md text-sm"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
              placeholder="kcal"
              required
              className="flex-1 px-3 py-2 rounded-md text-sm"
            />
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              placeholder="Protein g"
              className="flex-1 px-3 py-2 rounded-md text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-accent text-white font-semibold text-sm px-4 rounded-md disabled:opacity-60"
            >
              Add
            </button>
          </div>
        </form>
      )}

      {entries.length === 0 && !showForm && (
        <p className="text-muted text-sm">Noch nichts extra gegessen heute.</p>
      )}

      {entries.map((entry) => (
        <div key={entry.id} className="flex items-center justify-between py-2 border-b border-line last:border-b-0">
          <div className="min-w-0">
            <div className="text-sm truncate">{entry.label || "Extra"}</div>
            {entry.protein > 0 && <div className="text-muted text-xs">{entry.protein}g Protein</div>}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-display text-lg">{entry.kcal}</span>
            <span className="text-muted text-[11px]">kcal</span>
            <button
              type="button"
              onClick={() => handleDelete(entry.id)}
              aria-label="Extra löschen"
              className="text-muted hover:text-warn"
            >
              <i className="ti ti-x text-base" aria-hidden="true" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
