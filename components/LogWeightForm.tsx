"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogWeightForm() {
  const router = useRouter();
  const supabase = createClient();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const weight = parseFloat(value);
    if (!weight) return;

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("weight_logs").insert({ user_id: user.id, weight });
    setValue("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
      <input
        type="number"
        step="0.1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Heutiges Gewicht"
        className="flex-1 px-3 py-2 rounded-sm text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="border border-line text-muted hover:text-text hover:border-muted px-3 py-2 rounded-sm text-xs uppercase tracking-wide font-display"
      >
        Eintragen
      </button>
    </form>
  );
}
