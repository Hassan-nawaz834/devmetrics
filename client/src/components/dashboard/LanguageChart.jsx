import React, { useMemo } from 'react';

const AURORA_PALETTE = [
  '#2dd4bf', // teal
  '#a78bfa', // violet
  '#fb7185', // coral
  '#fbbf67', // gold
  '#60a5fa', // blue
  '#34d399', // emerald
  '#f472b6', // pink
  '#c084fc', // purple
];

function polarToCartesian(cx, cy, r, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ');
}

export default function LanguageChart({ repositories = [] }) {
  const { slices, totalBytes, topLanguages } = useMemo(() => {
    const langMap = {};

    repositories.forEach((repo) => {
      if (repo.languages && typeof repo.languages === 'object') {
        Object.entries(repo.languages).forEach(([lang, bytes]) => {
          if (typeof bytes === 'number' && bytes > 0) {
            langMap[lang] = (langMap[lang] || 0) + bytes;
          }
        });
      } else if (repo.language && repo.language !== 'N/A') {
        // fallback to primary language if full languages object missing
        langMap[repo.language] = (langMap[repo.language] || 0) + 1;
      }
    });

    const sorted = Object.entries(langMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const totalBytes = sorted.reduce((s, [, v]) => s + v, 0) || 1;

    let cumulative = 0;
    const slices = sorted.map(([name, value], i) => {
      const pct = (value / totalBytes) * 100;
      const startAngle = (cumulative / totalBytes) * 360;
      cumulative += value;
      const endAngle = (cumulative / totalBytes) * 360;
      return {
        name,
        value,
        pct: Math.round(pct * 10) / 10,
        startAngle,
        endAngle,
        color: AURORA_PALETTE[i % AURORA_PALETTE.length],
      };
    });

    return { slices, totalBytes, topLanguages: sorted };
  }, [repositories]);

  if (topLanguages.length === 0) {
    return (
      <div className="glass rounded-[18px] p-6 h-full">
        <h3 className="font-display text-[17px] font-medium mb-4">Languages</h3>
        <p className="text-muted-aurora text-sm">No language data yet. Sync repositories to see your stack.</p>
      </div>
    );
  }

  const size = 160;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="glass rounded-[18px] p-6 h-full flex flex-col">
      <h3 className="font-display text-[17px] font-medium mb-1">Languages</h3>
      <p className="text-muted-aurora text-sm mb-5">What you code in</p>

      <div className="flex flex-col sm:flex-row items-center gap-6 flex-1">
        {/* Donut */}
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {slices.map((s, i) => {
              // For very small slices, force a tiny visible arc
              const start = s.startAngle;
              const end = Math.max(s.endAngle, s.startAngle + 0.8);
              return (
                <path
                  key={s.name}
                  d={describeArc(cx, cy, radius, start, end)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={stroke}
                  strokeLinecap="butt"
                  className="transition-all duration-300"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(45,212,191,0.15))' }}
                />
              );
            })}
            {/* center hole look */}
            <circle cx={cx} cy={cy} r={radius - stroke / 2 - 2} fill="rgba(9,10,26,0.6)" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-display text-xl font-medium">{slices.length}</span>
            <span className="text-[10px] text-faint-aurora font-mono-ui uppercase tracking-wider">langs</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2.5 min-w-0">
          {slices.map((s) => (
            <div key={s.name} className="flex items-center gap-2.5">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: s.color, boxShadow: `0 0 8px ${s.color}55` }}
              />
              <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                <span className="text-[13px] truncate">{s.name}</span>
                <span className="font-mono-ui text-[11.5px] text-faint-aurora flex-shrink-0">
                  {s.pct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}