"use client";
import { memo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export default memo(function MealCard({ log, index = 0 }) {
  const title = log.items.map((i) => i.foodName).join(", ");
  const portions = log.items.map((i) => i.portion).join(" \u2022 ");
  const time = new Date(log.loggedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.06 }}
      whileTap={{ scale: 0.98 }}
      className="surface p-3 flex gap-3 items-center"
    >
      <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-brand-100">
        {log.imageUrl ? (
          <Image
            src={log.imageUrl}
            alt={title}
            width={80}
            height={80}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-brand-600">
            <Flame size={22} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-medium truncate capitalize">{title}</div>
            <div className="text-[12px] text-[color:var(--text-muted)] truncate">
              {portions}
            </div>
          </div>
          <span className="text-[11px] text-[color:var(--text-muted)] shrink-0">{time}</span>
        </div>
        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-400/12 text-brand-600 dark:text-brand-300">
          <Flame size={12} />
          <span className="text-[12px] font-semibold tabular">{log.totalCalories} kcal</span>
        </div>
      </div>
    </motion.div>
  );
});
