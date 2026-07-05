"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EQUIPMENT_OPTIONS } from "@/lib/equipment";

export default function EquipmentSetupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(key: string) {
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ equipment: Array.from(selected) })
      .eq("user_id", user.id);

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/setup/store");
  }

  return (
    <div className="min-h-screen px-5 py-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-1">
          BULK<span className="text-accent">AF</span>
        </h1>
        <p className="text-muted text-xs uppercase tracking-widest mb-6">Setup · Küche</p>

        <form onSubmit={handleSubmit} className="card-glass rounded-lg p-6 space-y-5">
          <div>
            <label className="block text-xs text-muted uppercase tracking-wide mb-2">
              Was hast du in deiner Küche?
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {EQUIPMENT_OPTIONS.map((eq) => (
                <button
                  key={eq.key}
                  type="button"
                  onClick={() => toggle(eq.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-2.5 rounded-md text-[13px] leading-tight text-left transition-colors ${
                    selected.has(eq.key) ? "bg-accent text-white" : "bg-white/5 text-text"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${
                      selected.has(eq.key) ? "bg-white border-white" : "border-white/30"
                    }`}
                  >
                    {selected.has(eq.key) && <span className="w-2 h-2 bg-accent rounded-sm" />}
                  </span>
                  <span className="min-w-0 whitespace-pre-line">{eq.label}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-muted text-[11px] leading-relaxed border-t border-line pt-4">
            Wir gehen davon aus, dass du diese Basics sowieso in der Küche hast: Salz, Pfeffer,
            verschiedene Gewürze, Leitungswasser, Öl. Die tauchen deshalb zwar in Zutatenlisten
            auf, aber nie auf deiner Einkaufsliste oder bei den Nahrungsmitteln.
          </p>

          {error && <p className="text-accent text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white font-semibold uppercase tracking-wide py-3 rounded-sm text-sm disabled:opacity-60"
          >
            {loading ? "Speichern..." : "Weiter"}
          </button>
        </form>
      </div>
    </div>
  );
}