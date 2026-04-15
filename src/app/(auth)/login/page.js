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

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}`);
      router.push("/dashboard");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center px-6 bg-mesh-light">
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
          <h1 className="h-display text-[22px]">Welcome back</h1>
          <p className="text-sm text-[color:var(--text-muted)] mt-1 mb-5">
            Log in to continue your journey.
          </p>
          <form onSubmit={onSubmit} className="space-y-3">
            <Input
              label="Email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Password"
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button className="w-full mt-2" loading={loading}>Sign in</Button>
          </form>
          <p className="text-sm text-[color:var(--text-muted)] mt-5 text-center">
            No account?{" "}
            <Link className="text-brand-500 font-semibold" href="/signup">Create one</Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
