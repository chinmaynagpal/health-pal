"use client";
import { useRef } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "framer-motion";

const DISMISS_THRESHOLD = 80;

export default function Sheet({ open, onClose, title, children }) {
  const sheetRef = useRef(null);
  const y = useMotionValue(0);
  const overlayOpacity = useTransform(y, [0, 300], [1, 0]);

  const handleDragEnd = (_, info) => {
    if (info.offset.y > DISMISS_THRESHOLD || info.velocity.y > 400) {
      onClose();
    } else {
      animate(y, 0, { type: "spring", stiffness: 500, damping: 35 });
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Dim overlay — no blur */}
          <motion.div
            className="fixed inset-0 bg-black/25 z-40"
            style={{ opacity: overlayOpacity }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            className="fixed inset-x-0 bottom-0 z-50 bg-[color:var(--surface)] rounded-t-[20px] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] p-5 pb-8 safe-bottom"
            style={{ y }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.8 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
          >
            {/* Drag handle */}
            <div className="mx-auto mb-4 w-9 h-[5px] rounded-full bg-[color:var(--text-muted)] opacity-30" />

            {title && (
              <motion.h3
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.2 }}
                className="h-display text-lg mb-3"
              >
                {title}
              </motion.h3>
            )}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.2 }}
            >
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
