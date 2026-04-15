"use client";
import { motion } from "framer-motion";

export default function ProgressRing({
  value = 0,
  max = 100,
  size = 140,
  stroke = 12,
  label,
  sub,
  trackColor = "rgba(255,255,255,0.22)",
  gradientFrom = "#FFFFFF",
  gradientTo = "#D0F5DE",
  textClassName = "",
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / (max || 1));
  const id = `ring-${gradientFrom.replace("#", "")}-${gradientTo.replace("#", "")}`;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ type: "spring", stiffness: 80, damping: 22, delay: 0.1 }}
        />
      </svg>
      <div className={`absolute inset-0 grid place-items-center text-center ${textClassName}`}>
        <div>
          <div className="h-display tabular text-[26px] leading-none">{label}</div>
          {sub && <div className="text-[11px] mt-1 opacity-80">{sub}</div>}
        </div>
      </div>
    </div>
  );
}
