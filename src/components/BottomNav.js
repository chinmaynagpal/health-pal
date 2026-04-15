"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Camera, LineChart, Settings } from "lucide-react";
import clsx from "clsx";

const items = [
  { href: "/dashboard", label: "Home",     icon: Home },
  { href: "/upload",    label: "Add",      icon: Camera },
  { href: "/progress",  label: "Progress", icon: LineChart },
  { href: "/settings",  label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 md:hidden pointer-events-none">
      <div className="mx-auto max-w-md px-4 pb-3 safe-bottom">
        <div className="glass pointer-events-auto rounded-[28px] px-2 py-2 flex justify-between shadow-ios-lg">
          {items.map((it) => {
            const active =
              it.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname?.startsWith(it.href);
            const Icon = it.icon;
            return (
              <Link
                key={it.href}
                href={it.href}
                className="relative flex-1 flex flex-col items-center gap-0.5 py-2 rounded-2xl text-[11px] font-medium"
              >
                {active && (
                  <motion.span
                    layoutId="bottom-nav-pill"
                    className="absolute inset-1 rounded-2xl bg-brand-400/12 dark:bg-brand-400/18 border border-brand-400/30"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  />
                )}
                <motion.span
                  animate={{
                    scale: active ? 1.05 : 1,
                    color: active ? "#34C759" : "var(--text-muted)",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="relative z-10 flex flex-col items-center gap-0.5"
                >
                  <Icon size={19} strokeWidth={active ? 2.4 : 2} />
                  <span>{it.label}</span>
                </motion.span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
