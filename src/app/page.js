"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, LineChart, Sparkles, Flame } from "lucide-react";
import Logo from "@/components/Logo";

export default function Landing() {
  return (
    <main className="min-h-screen bg-mesh-light relative overflow-hidden">
      {/* Noise / grain overlay for depth */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
           style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.8'/></svg>\")" }} />

      <nav className="relative max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={32} />
          <span className="h-display text-[18px]">Health Pal</span>
        </Link>
        <div className="flex gap-2">
          <Link className="btn-ghost text-sm" href="/login">Log in</Link>
          <Link className="btn-primary text-sm" href="/signup">Get started</Link>
        </div>
      </nav>

      <section className="relative max-w-6xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 text-brand-600 bg-white/70 backdrop-blur rounded-full px-3 py-1.5 text-[12px] font-semibold border border-brand-200">
            <Sparkles size={13} /> Smart calorie tracking
          </span>
          <h1 className="mt-5 h-display text-5xl md:text-6xl leading-[1.02] tracking-tightest">
            Log your meal.<br />
            <span className="bg-gradient-to-br from-brand-500 to-brand-700 bg-clip-text text-transparent">
              Know your calories.
            </span>
          </h1>
          <p className="mt-5 text-[17px] text-ink-700 max-w-md leading-relaxed">
            Health Pal lets you search from 200+ Indian foods, log portions instantly,
            and accurately tracks your calories, steps, weight, and goals in one calm, Apple-clean app.
          </p>
          <div className="mt-8 flex gap-3">
            <Link className="btn-primary" href="/signup">Start free</Link>
            <Link className="btn-ghost" href="/login">I have an account</Link>
          </div>
          <div className="mt-8 flex items-center gap-5 text-[12px] text-ink-600">
            <span>• No card required</span>
            <span>• 200+ Indian foods</span>
            <span>• Free forever</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          <FeatureCard icon={<Flame />}     tint="#EF4444" title="Smart meal logs" desc="Search → portion → instant kcal" />
          <FeatureCard icon={<Search />}    tint="#34C759" title="200+ foods"       desc="Indian food database built-in" />
          <FeatureCard icon={<LineChart />} tint="#3B82F6" title="Beautiful trends" desc="Weekly & monthly analytics" />
          <FeatureCard icon={<Sparkles />}  tint="#F59E0B" title="WhatsApp nudges"  desc="Instant meal summaries" />
        </motion.div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, tint, title, desc }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      className="surface p-5"
    >
      <div
        className="w-10 h-10 rounded-2xl grid place-items-center mb-3"
        style={{
          background: `color-mix(in oklab, ${tint} 16%, transparent)`,
          color: tint,
        }}
      >
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-[13px] text-[color:var(--text-muted)] mt-0.5 leading-snug">{desc}</p>
    </motion.div>
  );
}
