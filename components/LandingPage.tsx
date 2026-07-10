import Link from "next/link";
import Image from "next/image";

const iconClass = "w-6 h-6 text-accent shrink-0";

function IconTarget() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={iconClass}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

function IconChefHat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={iconClass}>
      <path d="M7 21h10" />
      <path d="M8 21v-5.5" />
      <path d="M16 21v-5.5" />
      <path d="M6 10.5a3.5 3.5 0 0 1 3.5-3.5c.17-1.68 1.6-3 3.35-3 1.5 0 2.79.96 3.24 2.3A3 3 0 0 1 18 12v3.5H8V12a3.5 3.5 0 0 1-2-4.5" />
    </svg>
  );
}

function IconChartLine() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={iconClass}>
      <path d="M4 19h16" />
      <path d="M4 19V5" />
      <path d="M4 15l4-4 3 3 6-7" />
    </svg>
  );
}

function IconAdjustments() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={iconClass}>
      <path d="M5 6h14" />
      <path d="M5 12h14" />
      <path d="M5 18h14" />
      <circle cx="9" cy="6" r="2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

const FEATURES = [
  {
    Icon: IconTarget,
    title: "Kalorienziel mit Zieldatum",
    body: "Gewicht und Zieldatum rein. TDEE und Tagesziel raus.",
  },
  {
    Icon: IconChefHat,
    title: "Tagesplan, automatisch skaliert",
    body: "Dreckige Rezepte, passend auf dein Kalorienziel skaliert.",
  },
  {
    Icon: IconChartLine,
    title: "Gewichts-Tracking",
    body: "Der Trend zählt. Nicht der einzelne Tag.",
  },
  {
    Icon: IconAdjustments,
    title: "Eigene Foods & Rezepte",
    body: "Datenbank passt nicht? Bau dir deine eigene.",
  },
];

const STEPS = [
  { n: "01", title: "Account anlegen", body: "E-Mail, Passwort, fertig. Keine Kreditkarte, kein Quatsch." },
  { n: "02", title: "Setup ausfüllen", body: "Gewicht, Zielgewicht, Zieldatum, Größe, Alter, Aktivität: zwei Minuten." },
  { n: "03", title: "Tagesplan bekommen", body: "Kalorienziel und Mahlzeiten, passend auf dich skaliert. Los geht's." },
];

const BMI_TIERS = [
  "Zieh durch alter!",
  "Skinny Bitch!",
  "Destroyer 1",
  "Gladiator",
  "Absoluter Wal-Modus",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="fixed top-0 inset-x-0 z-30 backdrop-blur-md bg-bg/50 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Image src="/bull-icon.png" alt="" width={28} height={24} className="h-6 w-auto" />
            <span className="text-xl font-display font-bold tracking-wide">
              BULK<span className="text-accent">AF</span>
            </span>
          </span>
          <nav className="hidden sm:flex items-center gap-8 text-xs uppercase tracking-widest text-muted">
            <a href="#features" className="hover:text-text transition-colors">Features</a>
            <a href="#works" className="hover:text-text transition-colors">Ablauf</a>
          </nav>
          <Link
            href="/login"
            className="text-xs uppercase tracking-widest font-semibold border border-white/15 rounded-md px-4 py-2 hover:border-accent hover:text-accent transition-colors"
          >
            Login
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-bg">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 45% at 50% 30%, rgba(46,147,224,0.2) 0%, rgba(46,147,224,0) 70%)",
            }}
          />

          <div className="relative z-20 max-w-lg mx-auto px-5 pt-36 pb-8 text-center">
            <p className="text-accent text-xs uppercase tracking-[0.2em] mb-4">
              Massephase-Tracking, dreckig gedacht
            </p>
            <h1 className="font-display text-5xl sm:text-6xl leading-[0.95] mb-5 text-shadow-soft">
              KALORIEN OHNE
              <br />
              <span className="text-accent">KOMPROMISSE.</span>
            </h1>
            <p className="text-muted text-base mb-8">
              Dreckig hoch.
              <br />
              <span className="text-text">Kein Gemüse-Gerede.</span>
            </p>
            <Link
              href="/login"
              className="inline-block bg-accent text-white font-display font-semibold uppercase tracking-wide px-10 py-3.5 rounded-md text-sm"
            >
              Kostenlos starten
            </Link>

            <a
              href="#features"
              aria-label="Zu den Features scrollen"
              className="mt-10 flex justify-center text-muted animate-bounce"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-6 h-6">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </a>
          </div>

          <div className="relative z-10 flex justify-center px-5">
            <Image
              src="/login-bull.png"
              alt="BulkAF Bulle"
              width={752}
              height={698}
              priority
              className="pointer-events-none select-none w-full max-w-[420px] h-auto"
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent z-10" />
        </section>

        {/* Problem / positioning */}
        <section className="border-t border-line bg-panel/40">
          <div className="max-w-5xl mx-auto px-5 py-16">
            <h2 className="font-display text-3xl md:text-4xl mb-4 max-w-2xl">
              Die meisten Apps sind fürs Abnehmen gebaut.
            </h2>
            <p className="text-muted max-w-2xl">
              Kalorien zählen, Fotos hochladen, Portionen minimieren: nichts davon hilft dir
              beim Massaufbau. BulkAF dreht den Spieß um: dein Ziel ist Gewicht drauf, nicht
              runter. Der Tagesplan ist entsprechend gebaut, kalorienreich, proteinreich,
              ohne dass du selbst Rezepte zusammensuchen musst.
            </p>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-lg mx-auto px-5 py-16 scroll-mt-24">
          <div className="border-t border-line">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-4 py-6 border-b border-line">
                <f.Icon />
                <div>
                  <h3 className="font-display text-lg tracking-wide mb-1">{f.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="works" className="border-t border-line bg-panel/40 scroll-mt-24">
          <div className="max-w-5xl mx-auto px-5 py-20">
            <h2 className="font-display text-3xl md:text-4xl mb-12">So funktioniert's</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {STEPS.map((s) => (
                <div key={s.n}>
                  <span className="font-display text-4xl text-accent block mb-3">{s.n}</span>
                  <h3 className="font-display text-lg mb-2 tracking-wide">{s.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tone / BMI categories */}
        <section className="max-w-5xl mx-auto px-5 py-20">
          <h2 className="font-display text-3xl md:text-4xl mb-4">Ehrliches Feedback, kein Zuckerguss</h2>
          <p className="text-muted max-w-2xl mb-8">
            Dein BMI-Status bekommt bei uns einen Namen, nicht nur eine Zahl.
          </p>
          <div className="flex flex-wrap gap-2">
            {BMI_TIERS.map((tier, i) => (
              <span
                key={tier}
                className={`rounded-md px-4 py-2 text-xs uppercase tracking-wide font-semibold ${
                  i === BMI_TIERS.length - 1 ? "bg-accent text-white" : "bg-white/5 text-muted"
                }`}
              >
                {tier}
              </span>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-line bg-panel/40">
          <div className="max-w-5xl mx-auto px-5 py-20 text-center">
            <h2 className="font-display text-3xl md:text-5xl mb-6">
              Bereit für die <span className="text-accent">Massephase?</span>
            </h2>
            <Link
              href="/login"
              className="inline-block bg-accent text-white font-display font-semibold uppercase tracking-wide px-10 py-4 rounded-md text-sm"
            >
              Jetzt loslegen
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="max-w-5xl mx-auto px-5 py-8 flex flex-wrap items-center justify-between gap-4 text-xs text-muted">
          <span>&copy; {new Date().getFullYear()} BulkAF</span>
          <Link href="/login" className="hover:text-text transition-colors">
            Login
          </Link>
        </div>
      </footer>
    </div>
  );
}
