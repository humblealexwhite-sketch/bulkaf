# BulkAF

Dreckige Massephase-App. Next.js + Supabase (Login & Datenbank) + Vercel (Hosting).

## 1. Supabase-Projekt anlegen

1. Auf [supabase.com](https://supabase.com) ein kostenloses Projekt erstellen.
2. Im Dashboard: **SQL Editor** öffnen, den Inhalt von `supabase/schema.sql` einfügen und ausführen.
   Das legt die Tabellen `profiles` und `weight_logs` an (inkl. Row Level Security, damit jeder Nutzer nur seine eigenen Daten sieht).
3. Unter **Project Settings -> API** findest du:
   - `Project URL`
   - `anon public` Key

   (Optional: Unter **Authentication -> Providers -> Email** kannst du "Confirm email" ausschalten, wenn du ohne E-Mail-Bestätigung testen willst.)

## 2. Lokal einrichten

```bash
cp .env.local.example .env.local
# Trage dort NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY ein

npm install
npm run dev
```

App läuft dann auf `http://localhost:3000`.

## 3. Auf GitHub pushen

```bash
git init
git add .
git commit -m "BulkAF initial commit"
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/bulkaf.git
git push -u origin main
```

(`.env.local` wird durch `.gitignore` nicht mit hochgeladen — gut so, Keys gehören nicht ins Repo.)

## 4. Auf Vercel deployen

1. Auf [vercel.com](https://vercel.com) einloggen, **New Project**, das GitHub-Repo auswählen.
2. Unter **Environment Variables** die gleichen zwei Werte eintragen wie in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy klicken. Vercel erkennt Next.js automatisch, kein weiteres Setup nötig.

Jeder Push auf `main` deployed danach automatisch neu.

## Produktdatenbank aktualisieren

Alle Lebensmittel/Makros liegen fest im Code in `lib/products.ts`. Rezept-Verhältnisse
(welche Zutat wie viel Anteil an einer Mahlzeit hat) stehen in derselben Datei unter `RECIPES`.
Einfach Werte ändern, committen, pushen — Vercel deployed automatisch neu.

## Struktur

```
app/
  login/      Login & Registrierung (Supabase Auth)
  setup/      Onboarding-Formular (Gewicht, Ziel, Größe, Alter, Aktivität)
  dashboard/  BMI, Kalorienziel, Gain-Gauge, Tages-Mahlzeitenplan
lib/
  products.ts       Produktdatenbank + Basis-Rezepte
  calculations.ts   BMI/TDEE/Kalorienziel/Mahlzeiten-Skalierung
  supabase/         Browser- & Server-Client
middleware.ts       Schützt /setup und /dashboard, leitet zu /login um
supabase/schema.sql Datenbank-Schema für Supabase
```
