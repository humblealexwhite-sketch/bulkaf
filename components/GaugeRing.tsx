"use client";

export default function GaugeRing({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(1, pct));
  const r = 46;
  const cx = 55;
  const cy = 55;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - clamped);

  return (
    <svg width={110} height={110} viewBox="0 0 110 110">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2A2622" strokeWidth={10} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#FF3D1A"
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text
        x={cx}
        y={cy + 6}
        textAnchor="middle"
        fontFamily="var(--font-oswald), sans-serif"
        fontSize={20}
        fontWeight={700}
        fill="#F5F1EA"
      >
        {Math.round(clamped * 100)}%
      </text>
    </svg>
  );
}
