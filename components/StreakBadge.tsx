export default function StreakBadge({ days }: { days: number }) {
  return (
    <div className="card-glass rounded-lg px-4 py-2.5 flex items-center gap-2 mb-4 w-fit">
      <i className={`ti ti-flame text-xl ${days > 0 ? "text-accent" : "text-muted"}`} aria-hidden="true" />
      {days > 0 ? (
        <>
          <span className="font-display text-lg leading-none">{days}</span>
          <span className="text-muted text-xs uppercase tracking-wide">
            {days === 1 ? "Tag Streak" : "Tage Streak"}
          </span>
        </>
      ) : (
        <span className="text-muted text-xs uppercase tracking-wide">Streak starten</span>
      )}
    </div>
  );
}
