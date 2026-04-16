"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "framer-motion";

// Snap points as fraction of sheet height from bottom:
// 1 = fully expanded, 0.55 = half, 0 = closed
const SNAPS = [0, 0.55, 1];
const VELOCITY_THRESHOLD = 300;

export default function Sheet({ open, onClose, title, children }) {
  const sheetRef = useRef(null);
  const contentRef = useRef(null);
  const [sheetH, setSheetH] = useState(0);
  const [snap, setSnap] = useState(1); // index into SNAPS — start at half (index 1)
  const y = useMotionValue(0);
  const isDraggingSheet = useRef(false);

  // Measure sheet height once mounted
  useEffect(() => {
    if (open && sheetRef.current) {
      // Small delay to let content render
      const frame = requestAnimationFrame(() => {
        const h = sheetRef.current?.offsetHeight || 0;
        setSheetH(h);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [open, children]);

  // Compute the y offset for a given snap index
  const snapY = useCallback(
    (idx) => {
      if (!sheetH) return 0;
      // y=0 is fully expanded, y = sheetH*(1-frac) shifts it down
      return sheetH * (1 - SNAPS[idx]);
    },
    [sheetH]
  );

  // Animate to initial snap (half) once we know the height
  useEffect(() => {
    if (open && sheetH > 0) {
      const target = snapY(1);
      animate(y, target, { type: "spring", stiffness: 450, damping: 36 });
      setSnap(1);
    }
  }, [open, sheetH, snapY, y]);

  const overlayOpacity = useTransform(y, [0, sheetH || 600], [1, 0]);

  const handleDragEnd = (_, info) => {
    if (!sheetH) return;

    const currentY = y.get();
    const vy = info.velocity.y;

    // Fast flick detection
    if (vy > VELOCITY_THRESHOLD) {
      // Flicking down — go to next lower snap or close
      const nextSnap = snap > 0 ? snap - 1 : 0;
      if (nextSnap === 0) {
        onClose();
        return;
      }
      setSnap(nextSnap);
      animate(y, snapY(nextSnap), { type: "spring", stiffness: 450, damping: 36 });
      return;
    }
    if (vy < -VELOCITY_THRESHOLD) {
      // Flicking up — go to next higher snap
      const nextSnap = Math.min(snap + 1, SNAPS.length - 1);
      setSnap(nextSnap);
      animate(y, snapY(nextSnap), { type: "spring", stiffness: 450, damping: 36 });
      return;
    }

    // Otherwise snap to nearest
    let closest = 1;
    let closestDist = Infinity;
    for (let i = 0; i < SNAPS.length; i++) {
      const sy = snapY(i);
      const dist = Math.abs(currentY - sy);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    }

    if (closest === 0) {
      onClose();
    } else {
      setSnap(closest);
      animate(y, snapY(closest), { type: "spring", stiffness: 450, damping: 36 });
    }
  };

  // Fully expanded = snap index 2
  const isExpanded = snap === 2;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Dim overlay */}
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
            className="fixed inset-x-0 bottom-0 z-50 bg-[color:var(--surface)] rounded-t-[20px] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] flex flex-col safe-bottom"
            style={{ y, maxHeight: "90dvh", touchAction: "none" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.8 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: sheetH || 600 }}
            dragElastic={0.08}
            onDragStart={() => { isDraggingSheet.current = true; }}
            onDragEnd={(e, info) => {
              isDraggingSheet.current = false;
              handleDragEnd(e, info);
            }}
          >
            {/* Drag handle — always draggable */}
            <div className="pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0">
              <div className="mx-auto w-9 h-[5px] rounded-full bg-[color:var(--text-muted)] opacity-30" />
            </div>

            {/* Content */}
            <div
              ref={contentRef}
              className={`px-5 pb-8 flex-1 ${isExpanded ? "overflow-y-auto overscroll-contain" : "overflow-hidden"}`}
            >
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
            </div>

            {/* Expand hint when half-open */}
            {!isExpanded && sheetH > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => {
                  setSnap(2);
                  animate(y, snapY(2), { type: "spring", stiffness: 450, damping: 36 });
                }}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] text-[color:var(--text-muted)] font-medium pb-1 safe-bottom"
              >
                Swipe up for more
              </motion.button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
