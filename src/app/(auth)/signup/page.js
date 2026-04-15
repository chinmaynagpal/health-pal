"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SignupPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    heightCm: "", weightKg: "", whatsappNumber: "",
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
      };
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      login(data.token, data.user);
      toast.success("Account created");
      router.push("/dashboard");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center px-6 py-10 bg-mesh-light">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-6">
          <Logo size={36} />
          <span className="h-display text-xl">Health Pal</span>
        </Link>
        <div className="surface p-6">
          <h1 className="h-display text-[22px]">Create your account</h1>
          <p className="text-sm text-[color:var(--text-muted)] mt-1 mb-5">
            A few details to personalize your goals.
          </p>
          <form onSubmit={onSubmit} className="space-y-3">
            <Input
              label="Full name" required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Email" type="email" required autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Password" type="password" required minLength={6} autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Height (cm)" type="number" inputMode="decimal"
                value={form.heightCm}
                onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
              />
              <Input
                label="Weight (kg)" type="number" inputMode="decimal"
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
              />
            </div>
            <Input
              label="WhatsApp (optional)"
              placeholder="+15551234567"
              hint="For meal notifications via Twilio sandbox"
              value={form.whatsappNumber}
              onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
            />
            <Button className="w-full mt-2" loading={loading}>Create account</Button>
          </form>
          <p className="text-sm text-[color:var(--text-muted)] mt-5 text-center">
            Already have an account?{" "}
            <Link className="text-brand-500 font-semibold" href="/login">Log in</Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
