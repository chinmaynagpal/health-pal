"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Trash2, Plus, Flame, AlertTriangle, Search } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const QUICK_PORTIONS = ["100g", "150g", "200g", "1 bowl", "1 cup", "1 piece", "2 rotis", "1 plate"];

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function FoodInput({ value, onChange, onSelect, authFetch }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const debouncedValue = useDebounce(value, 200);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!debouncedValue || debouncedValue.length < 2) {
      setSuggestions([]);
      return;
    }
    authFetch(`/api/foods/search?q=${encodeURIComponent(debouncedValue)}`)
      .then((r) => r.json())
      .then((d) => {
        setSuggestions(d.results || []);
        setOpen(true);
      })
      .catch(() => setSuggestions([]));
  }, [debouncedValue, authFetch]);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
        <Input
          placeholder="Search food (e.g. roti, dal, biryani)"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          className="pl-9"
        />
      </div>
      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 right-0 mt-1 rounded-2xl overflow-hidden shadow-lg"
            style={{ background: "var(--surface)", border: "1px solid var(--separator)" }}
          >
            {suggestions.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => { onSelect(s); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-[color:var(--surface-2)] transition"
              >
                <span className="text-[14px] font-medium capitalize">{s.name}</span>
                <span className="text-[11px] text-[color:var(--text-muted)]">
                  {s.calories_per_100g} kcal/100g
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LogMealPage() {
  const { authFetch } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState([{ foodName: "", portion: "", suggested: "" }]);
  const [logging, setLogging] = useState(false);
  const [result, setResult] = useState(null);

  const updateItem = (i, patch) =>
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const removeItem = (i) => setItems((arr) => arr.filter((_, idx) => idx !== i));
  const addItem = () =>
    setItems((arr) => [...arr, { foodName: "", portion: "", suggested: "" }]);

  const allValid = items.length > 0 && items.every((it) => it.foodName?.trim() && it.portion?.trim());

  const onLog = async () => {
    if (!allValid) return toast.error("Add a name and portion for every item");
    setLogging(true);
    setResult(null);
    try {
      const res = await authFetch("/api/foods/log", {
        method: "POST",
        body: JSON.stringify({
          items: items.map(({ foodName, portion }) => ({ foodName, portion })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.log);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLogging(false);
    }
  };

  const goToDashboard = () => router.push("/dashboard");

  const stableAuthFetch = useCallback((...args) => authFetch(...args), [authFetch]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="h-display text-[26px]">Log a meal</h1>
        <p className="text-sm text-[color:var(--text-muted)] mt-0.5">
          Search, portion, log — done.
        </p>
      </div>

      {/* Result breakdown */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="surface p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-brand-400/15 text-brand-500 grid place-items-center">
                  <Check size={18} />
                </div>
                <div>
                  <div className="font-semibold">Meal logged</div>
                  <div className="text-[12px] text-[color:var(--text-muted)]">
                    {result.items.length} item{result.items.length > 1 ? "s" : ""} &bull; {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>

              {/* Per-item breakdown */}
              <div className="space-y-2">
                {result.items.map((it, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-[color:var(--separator)] last:border-0">
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-medium capitalize truncate">{it.foodName}</div>
                      <div className="text-[11px] text-[color:var(--text-muted)]">
                        {it.portion} &bull; {it.grams}g
                        {it.matched && <span> &bull; {it.matched}</span>}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: it.source === "indian_db" ? "var(--brand-500)" : "#F59E0B" }}>
                        {it.source === "indian_db" ? "Indian DB" : "USDA"}
                      </div>
                      {it.error && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-500 mt-0.5">
                          <AlertTriangle size={10} />
                          {it.error === "no_usda_match" ? "No match found" : "Invalid portion"}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="text-[15px] font-semibold tabular">{it.calories}</div>
                      <div className="text-[10px] text-[color:var(--text-muted)]">kcal</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between pt-2 border-t border-[color:var(--separator)]">
                <div className="flex items-center gap-2">
                  <Flame size={16} className="text-brand-500" />
                  <span className="font-semibold">Total</span>
                </div>
                <div className="h-display tabular text-xl">{result.totalCalories} kcal</div>
              </div>

              {/* Macros summary */}
              <div className="flex gap-3 text-center">
                {[
                  { label: "Protein", val: result.items.reduce((s, x) => s + (x.protein || 0), 0).toFixed(1), unit: "g", color: "#3B82F6" },
                  { label: "Carbs", val: result.items.reduce((s, x) => s + (x.carbs || 0), 0).toFixed(1), unit: "g", color: "#F59E0B" },
                  { label: "Fat", val: result.items.reduce((s, x) => s + (x.fat || 0), 0).toFixed(1), unit: "g", color: "#EF4444" },
                ].map((m) => (
                  <div key={m.label} className="flex-1 rounded-xl bg-[color:var(--surface-2)] p-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-[color:var(--text-muted)] font-semibold">{m.label}</div>
                    <div className="text-[15px] font-semibold tabular mt-0.5" style={{ color: m.color }}>{m.val}{m.unit}</div>
                  </div>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={goToDashboard}>
              Back to dashboard
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => { setResult(null); setItems([{ foodName: "", portion: "", suggested: "" }]); }}>
              Log another meal
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input form */}
      {!result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="h-display text-lg">Food items</h2>
            <span className="text-[11px] uppercase tracking-wider text-[color:var(--text-muted)] font-medium">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          </div>

          {items.map((it, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="surface p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <FoodInput
                  value={it.foodName}
                  onChange={(v) => updateItem(i, { foodName: v })}
                  onSelect={(food) => updateItem(i, { foodName: food.name, suggested: `${food.default_weight}g` })}
                  authFetch={stableAuthFetch}
                />
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(i)}
                    className="w-11 h-11 grid place-items-center rounded-2xl text-[color:var(--text-muted)] hover:bg-[color:var(--surface-2)] shrink-0"
                    aria-label="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div>
                <div className="label flex items-center justify-between">
                  <span>Portion <span className="text-red-500">*</span></span>
                  {it.suggested && (
                    <button
                      type="button"
                      onClick={() => updateItem(i, { portion: it.suggested })}
                      className="text-[11px] text-brand-500 font-medium lowercase"
                    >
                      use default &middot; {it.suggested}
                    </button>
                  )}
                </div>
                <Input
                  placeholder={it.suggested || "e.g. 150g, 1 bowl, 2 rotis"}
                  value={it.portion}
                  onChange={(e) => updateItem(i, { portion: e.target.value })}
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {QUICK_PORTIONS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => updateItem(i, { portion: p })}
                      className={`chip ${it.portion === p ? "chip-active" : ""}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}

          <button
            onClick={addItem}
            className="w-full surface-flat p-3.5 flex items-center justify-center gap-2 text-sm font-medium text-[color:var(--text-muted)] hover:text-[color:var(--text)] hover:bg-[color:var(--surface-2)] transition"
          >
            <Plus size={16} /> Add another item
          </button>

          <Button className="w-full" loading={logging} disabled={!allValid} onClick={onLog}>
            <Check size={16} /> {logging ? "Calculating..." : "Log meal"}
          </Button>
          {!allValid && (
            <p className="text-xs text-center text-[color:var(--text-muted)]">
              Every item needs a name and portion size
            </p>
          )}
        </div>
      )}
    </div>
  );
}
