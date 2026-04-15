"use client";
import { AnimatePresence, motion } from "framer-motion";

export default function Sheet({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 bg-[color:var(--surface)] rounded-t-4xl shadow-ios-lg p-5 pb-8 safe-bottom border-t border-[color:var(--separator)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 34 }}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[color:var(--separator)]" />
            {title && <h3 className="h-display text-lg mb-3">{title}</h3>}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
