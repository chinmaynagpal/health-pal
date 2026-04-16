"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, Footprints, Scale, Target, Plus, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import ProgressRing from "@/components/ProgressRing";
import StatCard from "@/components/StatCard";
import MealCard from "@/components/MealCard";
import Skeleton from "@/components/ui/Skeleton";
import Sheet from "@/components/ui/Sheet";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function Dashboard() {
  const { authFetch, user } = useAuth();
  const [foods, setFoods] = useState([]);
  const [steps, setSteps] = useState(0);
  const [weight, setWeight] = useState(null);
  const [loading, setLoading] = useState(true);

  const [sheet, setSheet] = useState(null); // 'steps' | 'weight' | null
  const [sheetVal, setSheetVal] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await authFetch("/api/dashboard").then((r) => r.json());
      setFoods(data.foods || []);
      setSteps(data.steps || 0);
      setWeight(data.latestWeight || user?.weightKg || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line
  }, [user]);

  const caloriesToday = foods.reduce((a, b) => a + (b.totalCalories || 0), 0);
  const calGoal = user?.goals?.dailyCalories || 2000;
  const stepGoal = user?.goals?.dailySteps || 10000;
  const calLeft = Math.max(0, calGoal - caloriesToday);
  const pct = Math.min(100, Math.round((caloriesToday / calGoal) * 100));

  const openSheet = (which) => {
    setSheet(which);
    setSheetVal(which === "steps" ? steps || "" : weight || "");
  };

  const submitSheet = async () => {
    const n = parseFloat(sheetVal);
    if (Number.isNaN(n)) return toast.error("Enter a valid number");
    setSaving(true);
    try {
      if (sheet === "steps") {
        await authFetch("/api/steps", { method: "POST", body: JSON.stringify({ steps: Math.round(n) }) });
        toast.success("Steps updated");
      } else {
        await authFetch("/api/weight", { method: "POST", body: JSON.stringify({ weightKg: n }) });
        toast.success("Weight updated");
      }
      setSheet(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const greeting = getGreeting();
  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        className="pt-2"
      >
        <div className="text-[13px] uppercase tracking-wider text-[color:var(--text-muted)] font-medium">
          {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" })}
        </div>
        <h1 className="h-display text-[28px] leading-tight mt-1">
          {greeting}{firstName ? `, ${firstName}` : ""}
        </h1>
      </motion.div>

      {/* Hero ring card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1], delay: 0.05 }}
        whileTap={{ scale: 0.985 }}
        className="relative overflow-hidden rounded-[28px] p-6 text-white shadow-ios-lg"
        style={{ background: "linear-gradient(135deg,#34C759 0%,#1F8A39 100%)" }}
      >
        {/* Decorative blur orb */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/18 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 w-56 h-56 rounded-full bg-black/10 blur-3xl" />

        <div className="relative flex items-center justify-between gap-6">
          <div>
            <div className="text-[13px] uppercase tracking-wider opacity-80 font-medium">Calories</div>
            <div className="h-display tabular text-[38px] leading-none mt-1">
              {loading ? <Skeleton className="!bg-white/25 h-10 w-28" /> : caloriesToday}
            </div>
            <div className="text-sm opacity-85 mt-1.5">
              {calLeft > 0 ? `${calLeft.toLocaleString()} kcal left` : "Goal reached 🎉"}
            </div>
            <Link
              href="/upload"
              className="inline-flex items-center gap-1.5 mt-4 text-[13px] font-semibold bg-white/18 hover:bg-white/25 backdrop-blur rounded-full px-3 py-1.5 transition"
            >
              Log a meal <ArrowRight size={14} />
            </Link>
          </div>
          <ProgressRing
            value={caloriesToday}
            max={calGoal}
            size={128}
            stroke={11}
            label={`${pct}%`}
            sub={`of ${calGoal.toLocaleString()}`}
          />
        </div>
      </motion.div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          index={0}
          icon={<Footprints size={18} />}
          label="Steps"
          value={loading ? "\u2014" : steps.toLocaleString()}
          sub={`Goal ${stepGoal.toLocaleString()}`}
          tint="#3B82F6"
          onClick={() => openSheet("steps")}
        />
        <StatCard
          index={1}
          icon={<Scale size={18} />}
          label="Weight"
          value={weight ? `${weight} kg` : "Tap to log"}
          sub={user?.goals?.targetWeightKg ? `Target ${user.goals.targetWeightKg} kg` : " "}
          tint="#F59E0B"
          onClick={() => openSheet("weight")}
        />
        <StatCard
          index={2}
          icon={<Flame size={18} />}
          label="Meals"
          value={loading ? "\u2014" : `${foods.length} logged`}
          sub={`${caloriesToday} kcal today`}
          tint="#EF4444"
        />
        <StatCard
          index={3}
          icon={<Target size={18} />}
          label="Goal"
          value={`${pct}%`}
          sub="of daily calories"
          tint="#34C759"
        />
      </div>

      {/* Meals section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
        className="flex items-center justify-between pt-2"
      >
        <h2 className="h-display text-lg">Today's meals</h2>
        <Link
          href="/upload"
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-500 hover:text-brand-600"
        >
          <Plus size={14} /> Add
        </Link>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="surface p-3 flex gap-3 items-center">
              <Skeleton className="w-20 h-20 !rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-6 w-20 !rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : foods.length === 0 ? (
        <EmptyMeals />
      ) : (
        <div className="space-y-3">
          {foods.map((f, i) => (
            <MealCard key={f._id} log={f} index={i} />
          ))}
        </div>
      )}

      <Sheet
        open={!!sheet}
        onClose={() => setSheet(null)}
        title={sheet === "steps" ? "Log today's steps" : "Log today's weight"}
      >
        <div className="space-y-4">
          <Input
            autoFocus
            type="number"
            inputMode="decimal"
            placeholder={sheet === "steps" ? "e.g. 8,200" : "e.g. 72.4"}
            value={sheetVal}
            onChange={(e) => setSheetVal(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setSheet(null)}>
              Cancel
            </Button>
            <Button className="flex-1" loading={saving} onClick={submitSheet}>
              Save
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

function EmptyMeals() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1], delay: 0.25 }}
    >
      <Link href="/upload" className="surface p-8 flex flex-col items-center text-center gap-2 hover:shadow-ios-lg transition-shadow">
        <div className="w-12 h-12 rounded-2xl bg-brand-400/15 text-brand-500 grid place-items-center mb-1">
          <Plus size={20} />
        </div>
        <div className="font-medium">No meals yet today</div>
        <div className="text-sm text-[color:var(--text-muted)] max-w-xs">
          Snap a photo of your food — we'll detect items, ask for portion, and log USDA-accurate calories.
        </div>
      </Link>
    </motion.div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}
