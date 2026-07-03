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
    <div className="min-h-screen bg-bg overflow-x-hidden flex flex-col">
      {/* Logo + Tagline */}
      <div className="px-6 pt-12 text-center">
        <h1 className="text-4xl font-bold">
          BULK<span className="text-accent">AF</span>
        </h1>
        <p className="text-accent text-sm font-bold uppercase tracking-widest mt-1">
          Kalorien ohne Kompromisse.
        </p>
      </div>

      {/* Eingabefelder — untereinander, umrandet statt gefüllt */}
      <form onSubmit={handleSubmit} className="px-6 mt-8">
        <div className="max-w-sm mx-auto space-y-3">
          <input
            type="email"
            required
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-center bg-transparent border border-white/25 px-4 py-3 rounded-md text-sm placeholder:text-muted"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-center bg-transparent border border-white/25 px-4 py-3 rounded-md text-sm placeholder:text-muted"
          />

          {error && <p className="text-accent text-xs text-center">{error}</p>}
          {info && <p className="text-ok text-xs text-center">{info}</p>}
        </div>

        {/* Bulle — bricht bewusst aus der schmalen Spalte aus, volle Bildschirmbreite */}
        <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen -my-6 pointer-events-none">
          <img
            src="/login-bull.png"
            alt="BulkAF Bulle"
            className="h-72 sm:h-80 w-auto mx-auto object-contain"
          />
        </div>

        {/* Untere Karte: Button + Umschalten */}
        <div className="max-w-sm mx-auto card-glass rounded-lg p-5 text-center relative z-10">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white font-bold uppercase tracking-wide py-3 rounded-md text-sm disabled:opacity-60"
          >
            {loading
              ? "Moment..."
              : mode === "login"
              ? "Einloggen"
              : "Jetzt registrieren"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setInfo(null);
            }}
            className="text-muted text-xs mt-3"
          >
            {mode === "login" ? (
              <>
                Noch keinen Account? <span className="underline underline-offset-2">Registrieren</span>
              </>
            ) : (
              <>
                Hast du schon einen Account? <span className="underline underline-offset-2">Einloggen</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
