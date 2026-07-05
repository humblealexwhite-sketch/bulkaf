"use client";

import { useState } from "react";
import Link from "next/link";

function IconBook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v18H6.5A2.5 2.5 0 0 1 4 18.5v-13Z" strokeLinejoin="round" />
      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v18h5.5a2.5 2.5 0 0 0 2.5-2.5v-13Z" strokeLinejoin="round" />
    </svg>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1-3.5 4-5.5 7.5-5.5s6.5 2 7.5 5.5" strokeLinecap="round" />
    </svg>
  );
}

function IconLogout({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M9 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 16l4-4-4-4M20 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuCard({
  href,
  icon,
  label,
  highlighted,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  highlighted?: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 w-full rounded-lg px-4 py-3.5 transition-colors ${
        highlighted ? "bg-accent/20 border border-accent/40" : "card-glass"
      }`}
    >
      <span className={`w-5 h-5 shrink-0 ${highlighted ? "text-accent" : "text-muted"}`}>{icon}</span>
      <span className="flex-1 text-sm text-text">{label}</span>
      <IconChevronRight className="w-4 h-4 text-muted shrink-0" />
    </Link>
  );
}

export default function SideMenu({
  signOutAction,
  name,
}: {
  signOutAction: () => void;
  name?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menü öffnen"
        className="absolute top-6 right-6 z-20 bg-black/80 w-10 h-10 rounded-md flex flex-col items-center justify-center gap-1.5"
      >
        <span className="w-5 h-0.5 bg-white rounded-full" />
        <span className="w-5 h-0.5 bg-white rounded-full" />
        <span className="w-5 h-0.5 bg-white rounded-full" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />

          <div className="absolute top-0 right-0 h-full w-72 bg-[#141416] border-l border-line shadow-2xl p-6 flex flex-col">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Menü schließen"
              className="self-end text-muted text-lg mb-2"
            >
              ✕
            </button>

            <div className="flex flex-col items-center mb-3">
              <img src="/bull-icon.png" alt="" className="w-[80%] h-auto object-contain" />
              <div className="text-text font-bold text-base mt-3 uppercase tracking-wide">
                {name?.trim() || "Athlet"}
              </div>
              <div className="text-accent text-[11px] uppercase tracking-widest mt-0.5">Bulk Mode</div>
            </div>

            <nav className="flex flex-col gap-2.5">
              <MenuCard
                href="/recipes"
                icon={<IconBook className="w-5 h-5" />}
                label="Rezepte verwalten"
                highlighted
                onClick={() => setOpen(false)}
              />
              <MenuCard
                href="/profile"
                icon={<IconUser className="w-5 h-5" />}
                label="Mein Profil"
                onClick={() => setOpen(false)}
              />
            </nav>

            <form action={signOutAction} className="mt-auto">
              <button
                type="submit"
                className="flex items-center justify-center gap-3 w-full rounded-lg px-4 py-3.5 card-glass border border-red-500/20"
              >
                <IconLogout className="w-5 h-5 text-red-400 shrink-0" />
                <span className="text-sm text-red-400">Logout</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}