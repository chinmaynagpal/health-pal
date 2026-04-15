"use client";
import { motion } from "framer-motion";
import clsx from "clsx";

export default function SegmentedControl({ value, onChange, options }) {
  return (
    <div className="segmented relative">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={clsx(
              "relative px-4 py-1.5 text-sm font-medium rounded-xl transition-colors",
              active ? "text-[color:var(--text)]" : "text-[color:var(--text-muted)]"
            )}
          >
            {active && (
              <motion.span
                layoutId="segmented-thumb"
                className="absolute inset-0 rounded-xl bg-[color:var(--surface)] shadow-ios-sm border border-[color:var(--separator)]"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative z-10 capitalize">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
