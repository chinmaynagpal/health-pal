"use client";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";

export default function StatCard({ icon, label, value, sub, tint = "#34C759", onClick, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 26,
        delay: index * 0.06,
      }}
    >
      <Card interactive={!!onClick} onClick={onClick} className="p-4">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
              delay: 0.15 + index * 0.06,
            }}
            className="w-10 h-10 rounded-2xl grid place-items-center shrink-0"
            style={{
              background: `color-mix(in oklab, ${tint} 16%, transparent)`,
              color: tint,
            }}
          >
            {icon}
          </motion.div>
          <div className="min-w-0">
            <div className="text-[12px] uppercase tracking-wider text-[color:var(--text-muted)] font-medium">
              {label}
            </div>
            <div className="h-display tabular text-xl leading-tight truncate">{value}</div>
            {sub && (
              <div className="text-[11px] text-[color:var(--text-muted)] truncate">{sub}</div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
