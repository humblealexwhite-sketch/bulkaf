export default function CalorieBar({ target, eaten }: { target: number; eaten: number }) {
  const remaining = Math.round(target - eaten);
  const pct = Math.max(0, Math.min(100, (eaten / target) * 100));

  return (
    <div className="bg-panel border border-line rounded-sm p-5 mb-4">
      <div className="flex justify-between items-baseline mb-3">
        <div className="text-muted text-xs uppercase tracking-widest">Kalorien heute</div>
        <div className="text-muted text-xs">
          Ziel: <span className="text-accent2 font-display font-bold">{Math.round(target)} kcal</span>
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <div className="font-display font-bold text-3xl">{Math.round(eaten)}</div>
        <div className="text-muted text-sm">
          gegessen ·{" "}
          <span className={remaining >= 0 ? "text-ok" : "text-accent"}>
            {remaining >= 0 ? remaining : Math.abs(remaining)} {remaining >= 0 ? "verbleibend" : "über Ziel"}
          </span>
        </div>
      </div>
      <div className="h-2.5 bg-panel2 rounded-sm overflow-hidden">
        <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
