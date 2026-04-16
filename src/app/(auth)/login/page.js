"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState("credentials"); // "credentials" | "otp"
  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const sendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("OTP sent to your email");
      setStep("otp");
      setResendCooldown(30);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onCredentialsSubmit = async (e) => {
    e.preventDefault();
    await sendOtp();
  };

  const verifyOtp = async (code) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}`);
      router.push("/dashboard");
    } catch (e) {
      toast.error(e.message);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (next.every((d) => d !== "")) {
      verifyOtp(next.join(""));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(text)) {
      e.preventDefault();
      const digits = text.split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
      verifyOtp(text);
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
          <AnimatePresence mode="wait">
            {step === "credentials" ? (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="h-display text-[22px]">Welcome back</h1>
                <p className="text-sm text-[color:var(--text-muted)] mt-1 mb-5">
                  Log in to continue your journey.
                </p>
                <form onSubmit={onCredentialsSubmit} className="space-y-3">
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
                  <Button className="w-full mt-2" loading={loading}>
                    Continue
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => { setStep("credentials"); setOtp(["", "", "", "", "", ""]); }}
                  className="text-sm text-[color:var(--text-muted)] hover:text-[color:var(--text)] mb-3 flex items-center gap-1"
                >
                  &larr; Back
                </button>
                <h1 className="h-display text-[22px]">Check your email</h1>
                <p className="text-sm text-[color:var(--text-muted)] mt-1 mb-5">
                  We sent a 6-digit code to <strong>{form.email}</strong>
                </p>
                <div className="flex gap-2 justify-center mb-4" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      disabled={loading}
                      className="input tabular w-12 h-14 text-center text-xl font-semibold"
                    />
                  ))}
                </div>
                {loading && (
                  <p className="text-sm text-[color:var(--text-muted)] text-center mb-3">
                    Verifying...
                  </p>
                )}
                <p className="text-sm text-[color:var(--text-muted)] text-center">
                  Didn&apos;t receive the code?{" "}
                  {resendCooldown > 0 ? (
                    <span>Resend in {resendCooldown}s</span>
                  ) : (
                    <button
                      onClick={sendOtp}
                      className="text-brand-500 font-semibold hover:underline"
                    >
                      Resend
                    </button>
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="text-sm text-[color:var(--text-muted)] mt-5 text-center">
            No account?{" "}
            <Link className="text-brand-500 font-semibold" href="/signup">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
