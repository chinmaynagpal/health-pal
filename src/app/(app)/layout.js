"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";

export default function AppLayout({ children }) {
  const { ready, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !token) router.replace("/login");
  }, [ready, token, router]);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-mesh-light dark:bg-mesh-dark pb-28 md:pb-12">
      <TopNav />
      <main className="max-w-3xl mx-auto px-4 md:px-6 pt-4 md:pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}
