"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SetupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [weight, setWeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [goalDate, setGoalDate] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"m" | "w">("m");
  const [activity, setActivity] = useState("1.55");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!weight || !goalWeight || !goalDate || !height || !age) {
      setError("Bitte alle Felder ausfüllen.");
      return;
    }

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error: upsertError } = await supabase.from("profiles").upsert({
      user_id: user.id,
      weight: parseFloat(weight),
      goal_weight: parseFloat(goalWeight),
      goal_date: goalDate,
      height: parseFloat(height),
      age: parseFloat(age),
      gender,
      activity: parseFloat(activity),
    });

    if (upsertError) {
      setLoading(false);
      setError(upsertError.message);
      return;
    }

    await supabase.from("weight_logs").insert({
      user_id: user.id,
      weight: parseFloat(weight),
    });

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen px-5 py-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-1">
          BULK<span className="text-accent">AF</span>
        </h1>
        <p className="text-muted text-xs uppercase tracking-widest mb-6">Setup</p>

        <form
          onSubmit={handleSubmit}
          className="bg-panel border border-line rounded-sm p-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted uppercase tracking-wide mb-1">
                Aktuelles Gewicht (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 rounded-sm text-sm"
                placeholder="82"
              />
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-wide mb-1">
                Zielgewicht (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={goalWeight}
                onChange={(e) => setGoalWeight(e.target.value)}
                className="w-full px-3 py-2 rounded-sm text-sm"
                placeholder="90"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted uppercase tracking-wide mb-1">
                Zieldatum
              </label>
              <input
                type="date"
                value={goalDate}
                onChange={(e) => setGoalDate(e.target.value)}
                className="w-full px-3 py-2 rounded-sm text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-wide mb-1">
                Körpergröße (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 rounded-sm text-sm"
                placeholder="180"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted uppercase tracking-wide mb-1">
                Alter
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 rounded-sm text-sm"
                placeholder="27"
              />
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-wide mb-1">
                Geschlecht
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as "m" | "w")}
                className="w-full px-3 py-2 rounded-sm text-sm"
              >
                <option value="m">Männlich</option>
                <option value="w">Weiblich</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted uppercase tracking-wide mb-1">
              Aktivitätslevel
            </label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full px-3 py-2 rounded-sm text-sm"
            >
              <option value="1.2">Sitzend (Bürojob, kein Sport)</option>
              <option value="1.375">Leicht aktiv (1-3x Sport/Woche)</option>
              <option value="1.55">Moderat aktiv (3-5x Sport/Woche)</option>
              <option value="1.725">Sehr aktiv (6-7x Sport/Woche)</option>
              <option value="1.9">Extrem aktiv (Training + körperlicher Job)</option>
            </select>
          </div>

          {error && <p className="text-accent text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-[#171310] font-display font-semibold uppercase tracking-wide py-3 rounded-sm text-sm disabled:opacity-60"
          >
            {loading ? "Speichern..." : "Los geht's"}
          </button>
        </form>

        <p className="text-muted text-[11px] mt-5 leading-relaxed">
          Kalorienbedarf wird per Mifflin-St-Jeor-Formel + Aktivitätsfaktor geschätzt, dann auf
          deinen Zieldatum-Zuwachs hochgerechnet. Keine Diät-Tipps, keine Gesundheits-Warnungen —
          nur Zahlen.
        </p>
      </div>
    </div>
  );
}
