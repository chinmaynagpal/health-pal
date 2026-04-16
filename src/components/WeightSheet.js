"use client";
import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Scale, Minus, Plus, TrendingDown, TrendingUp, Minus as Dash } from "lucide-react";
import Sheet from "@/components/ui/Sheet";
import Button from "@/components/ui/Button";

const WEIGHT_STEP = 0.1;

export default function WeightSheet({ open, onClose, onSave, currentWeight, previousWeight, targetWeight, saving }) {
  const [val, setVal] = useState(currentWeight || previousWeight || 70);
  const intervalRef = useRef(null);

  const diff = previousWeight ? +(val - previousWeight).toFixed(1) : null;

  const adjust = useCallback((delta) => {
    setVal((v) => Math.max(20, +(v + delta).toFixed(1)));
  }, []);

  const startHold = useCallback((delta) => {
    adjust(delta);
    let speed = 150;
    const tick = () => {
      adjust(delta);
      speed = Math.max(40, speed - 10);
      intervalRef.current = setTimeout(tick, speed);
    };
    intervalRef.current = setTimeout(tick, speed);
  }, [adjust]);

  const stopHold = useCallback(() => {
    clearTimeout(intervalRef.current);
  }, []);

  const handleInputChange = (e) => {
    const raw = e.target.value.replace(/[^\d.]/g, "");
    if (raw === "" || raw === ".") { setVal(0); return; }
    const n = parseFloat(raw);
    if (!isNaN(n)) setVal(n);
  };

  const TrendIcon = diff === null ? Dash : diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Dash;
  const trendColor = diff === null ? "var(--text-muted)" : diff > 0 ? "#EF4444" : diff < 0 ? "#34C759" : "var(--text-muted)";
  const trendLabel = diff === null ? "No previous entry" : diff === 0 ? "Same as last" : `${diff > 0 ? "+" : ""}${diff} kg`;

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl grid place-items-center"
            style={{ background: "color-mix(in oklab, #F59E0B 16%, transparent)", color: "#F59E0B" }}>
            <Scale size={20} />
          </div>
          <div>
            <h3 className="h-display text-lg">Log weight</h3>
            <p className="text-[12px] text-[color:var(--text-muted)]">
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* Big number display */}
        <div className="text-center py-2">
          <div className="flex items-center justify-center gap-4">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onPointerDown={() => startHold(-WEIGHT_STEP)}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              className="w-14 h-14 rounded-2xl bg-[color:var(--surface-2)] grid place-items-center text-[color:var(--text-muted)] hover:text-[color:var(--text)] active:bg-[color:var(--separator)] transition select-none touch-none"
            >
              <Minus size={22} />
            </motion.button>

            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={val}
                onChange={handleInputChange}
                className="bg-transparent text-center h-display tabular text-[44px] leading-none w-36 outline-none"
              />
              <div className="text-[13px] text-[color:var(--text-muted)] mt-1">kg</div>
            </div>

            <motion.button
              whileTap={{ scale: 0.85 }}
              onPointerDown={() => startHold(WEIGHT_STEP)}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              className="w-14 h-14 rounded-2xl bg-[color:var(--surface-2)] grid place-items-center text-[color:var(--text-muted)] hover:text-[color:var(--text)] active:bg-[color:var(--separator)] transition select-none touch-none"
            >
              <Plus size={22} />
            </motion.button>
          </div>
        </div>

        {/* Trend card */}
        <div className="flex gap-3">
          <div className="flex-1 rounded-2xl bg-[color:var(--surface-2)] p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendIcon size={14} style={{ color: trendColor }} />
              <span className="text-[11px] uppercase tracking-wider text-[color:var(--text-muted)] font-semibold">Change</span>
            </div>
            <div className="text-[15px] font-semibold tabular" style={{ color: trendColor }}>
              {trendLabel}
            </div>
          </div>

          {targetWeight && (
            <div className="flex-1 rounded-2xl bg-[color:var(--surface-2)] p-3">
              <div className="text-[11px] uppercase tracking-wider text-[color:var(--text-muted)] font-semibold mb-1">
                Target
              </div>
              <div className="text-[15px] font-semibold tabular">
                {targetWeight} kg
              </div>
              {val > 0 && (
                <div className="text-[11px] text-[color:var(--text-muted)] tabular">
                  {Math.abs(+(val - targetWeight).toFixed(1))} kg {val > targetWeight ? "to go" : "under"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick presets based on previous */}
        {previousWeight && (
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[color:var(--text-muted)] font-semibold mb-2">
              Quick set
            </div>
            <div className="flex flex-wrap gap-2">
              {[-0.5, -0.2, 0, +0.2, +0.5].map((offset) => {
                const preset = +(previousWeight + offset).toFixed(1);
                const label = offset === 0 ? "Same" : `${offset > 0 ? "+" : ""}${offset}`;
                return (
                  <motion.button
                    key={offset}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setVal(preset)}
                    className={`px-3 py-2 rounded-xl text-[13px] font-medium tabular transition ${
                      val === preset
                        ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                        : "bg-[color:var(--surface-2)] text-[color:var(--text-muted)] hover:text-[color:var(--text)]"
                    }`}
                  >
                    <div>{preset}</div>
                    <div className="text-[10px] opacity-70">{label}</div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Save */}
        <Button className="w-full" loading={saving} onClick={() => onSave(val)} disabled={val <= 0}>
          Save weight
        </Button>
      </div>
    </Sheet>
  );
}
