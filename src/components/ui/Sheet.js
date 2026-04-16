"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "framer-motion";

const SNAP_FRACTIONS = [0.55, 1]; // half, full (0 = closed, handled separately)
const VELOCITY_DISMISS = 400;
const DISMISS_DISTANCE = 100;
const SPRING = { type: "spring", stiffness: 500, damping: 38, mass: 0.8 };

export default function Sheet({ open, onClose, title, children }) {
  const sheetRef = useRef(null);
  const contentRef = useRef(null);
  const [maxH, setMaxH] = useState(0);
  const [snapIdx, setSnapIdx] = useState(0); // 0=half, 1=full
  const y = useMotionValue(0);
  const dragging = useRef(false);
  const startY = useRef(0);
  const startMotionY = useRef(0);

  // Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  // Measure max sheet height
  useEffect(() => {
    if (open && sheetRef.current) {
      const frame = requestAnimationFrame(() => {
        setMaxH(sheetRef.current?.scrollHeight || 0);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [open, children]);

  // y offset for a snap index (y=0 = fully expanded, positive = pushed down)
  const getSnapY = useCallback(
    (idx) => maxH > 0 ? maxH * (1 - SNAP_FRACTIONS[idx]) : 0,
    [maxH]
  );

  // Open to half snap on mount
  useEffect(() => {
    if (open && maxH > 0) {
      const target = getSnapY(0);
      y.set(maxH); // start off screen
      animate(y, target, SPRING);
      setSnapIdx(0);
    }
  }, [open, maxH, getSnapY, y]);

  const overlayOpacity = useTransform(y, [0, maxH || 500], [1, 0]);

  // Snap to nearest or dismiss
  const snapTo = useCallback(
    (velocityY) => {
      if (!maxH) return;
      const currentY = y.get();

      // Fast flick down → dismiss or go lower
      if (velocityY > VELOCITY_DISMISS) {
        if (snapIdx === 0) {
          onClose();
        } else {
          setSnapIdx(0);
          animate(y, getSnapY(0), SPRING);
        }
        return;
      }
      // Fast flick up → expand
      if (velocityY < -VELOCITY_DISMISS) {
        const next = Math.min(snapIdx + 1, SNAP_FRACTIONS.length - 1);
        setSnapIdx(next);
        animate(y, getSnapY(next), SPRING);
        return;
      }

      // Dismiss if pulled far enough down past half snap
      if (currentY > getSnapY(0) + DISMISS_DISTANCE) {
        onClose();
        return;
      }

      // Snap to nearest
      let closest = 0;
      let closestDist = Infinity;
      for (let i = 0; i < SNAP_FRACTIONS.length; i++) {
        const d = Math.abs(currentY - getSnapY(i));
        if (d < closestDist) {
          closestDist = d;
          closest = i;
        }
      }
      setSnapIdx(closest);
      animate(y, getSnapY(closest), SPRING);
    },
    [maxH, snapIdx, y, getSnapY, onClose]
  );

  // Pointer-based drag on handle
  const onPointerDown = useCallback(
    (e) => {
      dragging.current = true;
      startY.current = e.clientY;
      startMotionY.current = y.get();
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [y]
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!dragging.current) return;
      const delta = e.clientY - startY.current;
      const raw = startMotionY.current + delta;
      // Allow slight overscroll above fully expanded (elastic)
      const clamped = Math.max(-30, raw);
      y.set(clamped);
    },
    [y]
  );

  const onPointerUp = useCallback(
    (e) => {
      if (!dragging.current) return;
      dragging.current = false;
      // Estimate velocity from last movement
      const delta = e.clientY - startY.current;
      const elapsed = Math.max(16, e.timeStamp % 10000); // rough
      // Simple velocity: use delta direction and magnitude
      const vy = delta > 30 ? 500 : delta < -30 ? -500 : 0;
      // Snap back if pulled above top
      if (y.get() < 0) {
        animate(y, 0, SPRING);
        setSnapIdx(SNAP_FRACTIONS.length - 1);
        return;
      }
      snapTo(vy);
    },
    [y, snapTo]
  );

  // Touch-based drag on content area (only when content is at scroll top)
  const contentDrag = useRef({ active: false, startY: 0, startMotionY: 0, lastClientY: 0, lastTime: 0 });

  const onContentTouchStart = useCallback(
    (e) => {
      const el = contentRef.current;
      const atTop = !el || el.scrollTop <= 0;
      // Only start drag if at scroll top or not fully expanded
      if (atTop || snapIdx < SNAP_FRACTIONS.length - 1) {
        contentDrag.current = {
          active: false, // activate after threshold
          startY: e.touches[0].clientY,
          startMotionY: y.get(),
          lastClientY: e.touches[0].clientY,
          lastTime: Date.now(),
        };
      }
    },
    [y, snapIdx]
  );

  const onContentTouchMove = useCallback(
    (e) => {
      const cd = contentDrag.current;
      if (cd.startY === 0) return;

      const touchY = e.touches[0].clientY;
      const delta = touchY - cd.startY;
      const el = contentRef.current;
      const atTop = !el || el.scrollTop <= 0;

      // Activate sheet drag if pulling down from scroll top, or not expanded
      if (!cd.active) {
        if ((delta > 6 && atTop) || snapIdx < SNAP_FRACTIONS.length - 1) {
          cd.active = true;
        } else {
          return; // let content scroll
        }
      }

      if (cd.active) {
        e.preventDefault();
        const raw = cd.startMotionY + delta;
        y.set(Math.max(-30, raw));
        cd.lastClientY = touchY;
        cd.lastTime = Date.now();
      }
    },
    [y, snapIdx]
  );

  const onContentTouchEnd = useCallback(
    () => {
      const cd = contentDrag.current;
      if (cd.active) {
        const vy = cd.lastClientY > cd.startY + 30 ? 500 : cd.lastClientY < cd.startY - 30 ? -500 : 0;
        if (y.get() < 0) {
          animate(y, 0, SPRING);
          setSnapIdx(SNAP_FRACTIONS.length - 1);
        } else {
          snapTo(vy);
        }
      }
      contentDrag.current = { active: false, startY: 0, startMotionY: 0, lastClientY: 0, lastTime: 0 };
    },
    [y, snapTo]
  );

  const isExpanded = snapIdx === SNAP_FRACTIONS.length - 1;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/25 z-40"
            style={{ opacity: overlayOpacity }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            ref={sheetRef}
            className="fixed inset-x-0 bottom-0 z-50 bg-[color:var(--surface)] rounded-t-[20px] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] flex flex-col safe-bottom"
            style={{ y, maxHeight: "90dvh" }}
            initial={{ y: "100%" }}
            exit={{ y: "110%" }}
            transition={SPRING}
          >
            {/* Drag handle */}
            <div
              className="pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0 touch-none"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div className="mx-auto w-9 h-[5px] rounded-full bg-[color:var(--text-muted)] opacity-30" />
            </div>

            {/* Content */}
            <div
              ref={contentRef}
              className={`px-5 pb-8 flex-1 ${isExpanded ? "overflow-y-auto overscroll-contain" : "overflow-hidden"}`}
              onTouchStart={onContentTouchStart}
              onTouchMove={onContentTouchMove}
              onTouchEnd={onContentTouchEnd}
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

            {!isExpanded && maxH > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => {
                  const next = SNAP_FRACTIONS.length - 1;
                  setSnapIdx(next);
                  animate(y, getSnapY(next), SPRING);
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
