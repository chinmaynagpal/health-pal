"use client";
import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Footprints, Minus, Plus, RotateCcw } from "lucide-react";
import Sheet from "@/components/ui/Sheet";
import Button from "@/components/ui/Button";

const PRESETS = [1000, 2000, 5000, 8000, 10000, 15000];
const STEP_INCREMENT = 500;

export default function StepSheet({ open, onClose, onSave, currentSteps, yesterdaySteps, goal, saving }) {
  const [val, setVal] = useState(currentSteps || 0);
  const intervalRef = useRef(null);

  const pct = goal ? Math.min(100, Math.round((val / goal) * 100)) : 0;

  const adjust = useCallback((delta) => {
    setVal((v) => Math.max(0, v + delta));
  }, []);

  const startHold = useCallback((delta) => {
    adjust(delta);
    let speed = 200;
    const tick = () => {
      adjust(delta);
      speed = Math.max(50, speed - 15);
      intervalRef.current = setTimeout(tick, speed);
    };
    intervalRef.current = setTimeout(tick, speed);
  }, [adjust]);

  const stopHold = useCallback(() => {
    clearTimeout(intervalRef.current);
  }, []);

  const handleInputChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setVal(raw === "" ? 0 : parseInt(raw, 10));
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl grid place-items-center"
            style={{ background: "color-mix(in oklab, #3B82F6 16%, transparent)", color: "#3B82F6" }}>
            <Footprints size={20} />
          </div>
          <div>
            <h3 className="h-display text-lg">Log steps</h3>
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
              onPointerDown={() => startHold(-STEP_INCREMENT)}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              className="w-14 h-14 rounded-2xl bg-[color:var(--surface-2)] grid place-items-center text-[color:var(--text-muted)] hover:text-[color:var(--text)] active:bg-[color:var(--separator)] transition select-none touch-none"
            >
              <Minus size={22} />
            </motion.button>

            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={val.toLocaleString()}
                onChange={handleInputChange}
                className="bg-transparent text-center h-display tabular text-[44px] leading-none w-48 outline-none"
              />
              <div className="text-[13px] text-[color:var(--text-muted)] mt-1">steps</div>
            </div>

            <motion.button
              whileTap={{ scale: 0.85 }}
              onPointerDown={() => startHold(STEP_INCREMENT)}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              className="w-14 h-14 rounded-2xl bg-[color:var(--surface-2)] grid place-items-center text-[color:var(--text-muted)] hover:text-[color:var(--text)] active:bg-[color:var(--separator)] transition select-none touch-none"
            >
              <Plus size={22} />
            </motion.button>
          </div>
        </div>

        {/* Progress bar */}
        {goal > 0 && (
          <div>
            <div className="flex justify-between text-[11px] text-[color:var(--text-muted)] mb-1.5">
              <span>{pct}% of daily goal</span>
              <span className="tabular">{goal.toLocaleString()}</span>
            </div>
            <div className="h-2 rounded-full bg-[color:var(--surface-2)] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #3B82F6, #60A5FA)" }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, pct)}%` }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              />
            </div>
          </div>
        )}

        {/* Quick presets */}
        <div>
          <div className="text-[11px] uppercase tracking-wider text-[color:var(--text-muted)] font-semibold mb-2">
            Quick set
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <motion.button
                key={p}
                whileTap={{ scale: 0.92 }}
                onClick={() => setVal(p)}
                className={`px-3 py-2 rounded-xl text-[13px] font-medium tabular transition ${
                  val === p
                    ? "bg-blue-500/15 text-blue-500 border border-blue-500/30"
                    : "bg-[color:var(--surface-2)] text-[color:var(--text-muted)] hover:text-[color:var(--text)]"
                }`}
              >
                {p.toLocaleString()}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Yesterday shortcut */}
        {yesterdaySteps > 0 && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setVal(yesterdaySteps)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[color:var(--surface-2)] hover:bg-[color:var(--separator)] transition"
          >
            <RotateCcw size={16} className="text-[color:var(--text-muted)]" />
            <div className="text-left flex-1">
              <div className="text-[13px] font-medium">Same as yesterday</div>
              <div className="text-[12px] text-[color:var(--text-muted)] tabular">{yesterdaySteps.toLocaleString()} steps</div>
            </div>
          </motion.button>
        )}

        {/* Save */}
        <Button className="w-full" loading={saving} onClick={() => onSave(val)} disabled={val <= 0}>
          Save steps
        </Button>
      </div>
    </Sheet>
  );
}
