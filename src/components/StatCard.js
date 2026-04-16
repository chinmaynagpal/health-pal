"use client";
import { memo } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";

export default memo(function StatCard({ icon, label, value, sub, tint = "#34C759", onClick, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.05 }}
    >
      <Card interactive={!!onClick} onClick={onClick} className="p-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl grid place-items-center shrink-0"
            style={{
              background: `color-mix(in oklab, ${tint} 16%, transparent)`,
              color: tint,
            }}
          >
            {icon}
          </div>
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
});
