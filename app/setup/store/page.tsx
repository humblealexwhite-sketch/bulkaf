"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { STORE_OPTIONS } from "@/lib/equipment";

export default function StoreSetupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [store, setStore] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!store) {
      setError("Bitte einen Laden auswählen.");
      return;
    }
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
      .update({ go_to_store: store })
      .eq("user_id", user.id);

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen px-5 py-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-1">
          BULK<span className="text-accent">AF</span>
        </h1>
        <p className="text-muted text-xs uppercase tracking-widest mb-6">Setup · Laden</p>

        <form onSubmit={handleSubmit} className="card-glass rounded-lg p-6 space-y-5">
          <div>
            <label className="block text-xs text-muted uppercase tracking-wide mb-2">
              Was ist dein Go-to-Laden?
            </label>
            <p className="text-muted text-[11px] mb-3">
              Die Nahrungsmittel-Seite ist danach direkt auf diesen Laden eingestellt.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {STORE_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStore(s)}
                  className={`py-2.5 rounded-md text-sm font-semibold uppercase tracking-wide transition-colors ${
                    store === s ? "bg-accent text-white" : "bg-white/5 text-text"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-accent text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white font-semibold uppercase tracking-wide py-3 rounded-sm text-sm disabled:opacity-60"
          >
            {loading ? "Speichern..." : "Los geht's"}
          </button>
        </form>
      </div>
    </div>
  );
}
