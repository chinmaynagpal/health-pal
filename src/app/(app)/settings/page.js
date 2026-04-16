"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { User, Ruler, Scale, Phone, Flame, Footprints, Target } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function SettingsPage() {
  const { user, authFetch, refresh } = useAuth();
  const [form, setForm] = useState({
    name: "", heightCm: "", weightKg: "", whatsappNumber: "",
    dailyCalories: 2000, dailySteps: 10000, targetWeightKg: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      heightCm: user.heightCm || "",
      weightKg: user.weightKg || "",
      whatsappNumber: user.whatsappNumber || "",
      dailyCalories: user.goals?.dailyCalories || 2000,
      dailySteps: user.goals?.dailySteps || 10000,
      targetWeightKg: user.goals?.targetWeightKg || "",
    });
  }, [user]);

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    const cal = Number(form.dailyCalories);
    const stp = Number(form.dailySteps);
    const tw = form.targetWeightKg ? Number(form.targetWeightKg) : null;
    if (!cal || cal < 500 || cal > 10000)
      return toast.error("Daily calories must be between 500 and 10,000");
    if (!stp || stp < 100 || stp > 200000)
      return toast.error("Daily steps must be between 100 and 200,000");
    if (tw !== null && (tw < 20 || tw > 500))
      return toast.error("Target weight must be between 20 and 500 kg");
    if (form.heightCm && (Number(form.heightCm) < 50 || Number(form.heightCm) > 300))
      return toast.error("Height must be between 50 and 300 cm");
    if (form.weightKg && (Number(form.weightKg) < 20 || Number(form.weightKg) > 500))
      return toast.error("Weight must be between 20 and 500 kg");

    setSaving(true);
    try {
      await authFetch("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name.trim(),
          heightCm: Number(form.heightCm) || undefined,
          weightKg: Number(form.weightKg) || undefined,
          whatsappNumber: form.whatsappNumber,
          goals: {
            dailyCalories: cal,
            dailySteps: stp,
            targetWeightKg: tw || undefined,
          },
        }),
      });
      await refresh();
      toast.success("Saved");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-6"
    >
      <motion.div variants={fadeUp}>
        <h1 className="h-display text-[26px]">Settings</h1>
        <p className="text-sm text-[color:var(--text-muted)] mt-0.5">
          Profile, goals, and notifications
        </p>
      </motion.div>

      <Section title="Profile">
        <Row icon={<User size={16} />} label="Name">
          <InlineInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Your name" />
        </Row>
        <Row icon={<Ruler size={16} />} label="Height">
          <InlineInput
            type="number"
            value={form.heightCm}
            onChange={(v) => setForm({ ...form, heightCm: v })}
            suffix="cm"
          />
        </Row>
        <Row icon={<Scale size={16} />} label="Weight">
          <InlineInput
            type="number"
            value={form.weightKg}
            onChange={(v) => setForm({ ...form, weightKg: v })}
            suffix="kg"
          />
        </Row>
        <Row icon={<Phone size={16} />} label="WhatsApp">
          <InlineInput
            value={form.whatsappNumber}
            onChange={(v) => setForm({ ...form, whatsappNumber: v })}
            placeholder="+15551234567"
          />
        </Row>
      </Section>

      <Section title="Daily goals" subtitle="We'll track your progress against these numbers.">
        <Row icon={<Flame size={16} />} label="Calories">
          <InlineInput
            type="number"
            value={form.dailyCalories}
            onChange={(v) => setForm({ ...form, dailyCalories: v })}
            suffix="kcal"
          />
        </Row>
        <Row icon={<Footprints size={16} />} label="Steps">
          <InlineInput
            type="number"
            value={form.dailySteps}
            onChange={(v) => setForm({ ...form, dailySteps: v })}
          />
        </Row>
        <Row icon={<Target size={16} />} label="Target weight">
          <InlineInput
            type="number"
            value={form.targetWeightKg}
            onChange={(v) => setForm({ ...form, targetWeightKg: v })}
            suffix="kg"
          />
        </Row>
      </Section>

      <motion.div variants={fadeUp}>
        <Button className="w-full" loading={saving} onClick={save}>
          Save changes
        </Button>
      </motion.div>
    </motion.div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <motion.div variants={fadeUp}>
      <div className="px-1 mb-2">
        <div className="text-[11px] uppercase tracking-wider text-[color:var(--text-muted)] font-semibold">
          {title}
        </div>
      </div>
      <div className="list-group">{children}</div>
      {subtitle && (
        <p className="px-1 mt-2 text-[12px] text-[color:var(--text-muted)]">{subtitle}</p>
      )}
    </motion.div>
  );
}

function Row({ icon, label, children }) {
  return (
    <motion.div
      whileTap={{ scale: 0.99, backgroundColor: "rgba(0,0,0,0.02)" }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="list-row"
    >
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-[color:var(--surface-2)] grid place-items-center text-[color:var(--text-muted)]">
          {icon}
        </div>
        <div className="text-[15px]">{label}</div>
      </div>
      <div className="flex-1 flex justify-end">{children}</div>
    </motion.div>
  );
}

function InlineInput({ value, onChange, suffix, ...rest }) {
  return (
    <div className="flex items-center gap-1 max-w-[60%]">
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-right w-full py-1 outline-none tabular text-[15px] placeholder:text-[color:var(--text-muted)]"
      />
      {suffix && (
        <span className="text-[13px] text-[color:var(--text-muted)]">{suffix}</span>
      )}
    </div>
  );
}
