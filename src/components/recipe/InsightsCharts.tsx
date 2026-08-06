"use client";

import { useRef, useState } from "react";

export type DayPoint = { day: string; views: number };

// Hand-rolled SVG area chart - no chart library. Yellow gradient fill,
// hover tooltip snapping to the nearest day.
export function ViewsAreaChart({ points }: { points: DayPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 720;
  const H = 220;
  const PAD = { top: 16, right: 12, bottom: 28, left: 40 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const max = Math.max(1, ...points.map((p) => p.views));
  const x = (i: number) =>
    PAD.left + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.views)}`).join(" ");
  const areaPath = `${linePath} L${x(points.length - 1)},${PAD.top + innerH} L${x(0)},${PAD.top + innerH} Z`;

  const yTicks = [0, Math.ceil(max / 2), max];

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - PAD.left) / innerW) * (points.length - 1));
    setHover(Math.max(0, Math.min(points.length - 1, i)));
  };

  const fmtDay = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

  const total = points.reduce((s, p) => s + p.views, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Views · last 30 days
      </p>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Area chart of daily views over the last 30 days, ${total} total views, peak ${max} in one day`}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="views-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5C518" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F5C518" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Gridlines + y labels */}
        {yTicks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke="currentColor"
              className="text-border"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x={PAD.left - 8}
              y={y(t) + 4}
              textAnchor="end"
              fontSize="11"
              fill="currentColor"
              className="text-muted-foreground"
            >
              {t}
            </text>
          </g>
        ))}

        {/* X labels: first, middle, last */}
        {[0, Math.floor(points.length / 2), points.length - 1].map((i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 8}
            textAnchor="middle"
            fontSize="11"
            fill="currentColor"
            className="text-muted-foreground"
          >
            {points[i] ? fmtDay(points[i].day) : ""}
          </text>
        ))}

        <path d={areaPath} fill="url(#views-fill)" />
        <path d={linePath} fill="none" stroke="#F5C518" strokeWidth="2" strokeLinejoin="round" />

        {/* Hover */}
        {hover !== null && points[hover] && (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.top}
              y2={PAD.top + innerH}
              stroke="currentColor"
              className="text-muted-foreground/40"
              strokeWidth="1"
            />
            <circle cx={x(hover)} cy={y(points[hover].views)} r="4" fill="#F5C518" />
            <g
              transform={`translate(${Math.min(W - 130, Math.max(PAD.left, x(hover) - 55))}, ${PAD.top})`}
            >
              <rect width="110" height="40" rx="6" fill="currentColor" className="text-popover" stroke="#F5C518" strokeOpacity="0.4" />
              <text x="55" y="17" textAnchor="middle" fontSize="11" fill="currentColor" className="text-muted-foreground">
                {fmtDay(points[hover].day)}
              </text>
              <text x="55" y="32" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor" className="text-foreground">
                {points[hover].views} view{points[hover].views === 1 ? "" : "s"}
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}

export function StatTile({
  label,
  value,
  delta,
}: {
  label: string;
  value: number;
  delta?: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground mt-1">{value.toLocaleString()}</p>
      {delta !== undefined && (
        <p className={`text-[11px] mt-0.5 ${delta > 0 ? "text-green-500" : "text-muted-foreground"}`}>
          {delta > 0 ? `+${delta}` : delta} last 7 days
        </p>
      )}
    </div>
  );
}
