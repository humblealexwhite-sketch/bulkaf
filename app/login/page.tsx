"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      setInfo("Account erstellt. Falls Bestätigung aktiv ist, check deine Mails, sonst einfach einloggen.");
      setMode("login");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-1 flex items-baseline gap-2">
          <h1 className="text-4xl font-bold">
            BULK<span className="text-accent">AF</span>
          </h1>
        </div>
        <p className="text-muted text-xs uppercase tracking-widest mb-8">
          Kalorien ohne Kompromisse.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-panel border border-line rounded-sm p-6 space-y-4"
        >
          <h2 className="text-sm text-muted tracking-widest">
            {mode === "login" ? "Login" : "Account erstellen"}
          </h2>

          <div>
            <label className="block text-xs text-muted uppercase tracking-wide mb-1">
              E-Mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-sm text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wide mb-1">
              Passwort
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-sm text-sm"
            />
          </div>

          {error && <p className="text-accent text-xs">{error}</p>}
          {info && <p className="text-ok text-xs">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white font-semibold uppercase tracking-wide py-3 rounded-sm text-sm disabled:opacity-60"
          >
            {loading ? "Moment..." : mode === "login" ? "Einloggen" : "Account erstellen"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setInfo(null);
            }}
            className="w-full text-muted text-xs uppercase tracking-wide underline underline-offset-2"
          >
            {mode === "login" ? "Noch keinen Account? Registrieren" : "Schon einen Account? Einloggen"}
          </button>
        </form>
      </div>
    </div>
  );
}
