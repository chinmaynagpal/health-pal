"use client";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";

const NAV_ORDER = ["/dashboard", "/upload", "/progress", "/settings"];

export default function AppLayout({ children }) {
  const { ready, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (ready && !token) router.replace("/login");
  }, [ready, token, router]);

  const prevIdx = NAV_ORDER.indexOf(prevPath.current);
  const currIdx = NAV_ORDER.indexOf(pathname);
  const direction = currIdx >= prevIdx ? 1 : -1;

  useEffect(() => {
    prevPath.current = pathname;
  }, [pathname]);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-mesh-light dark:bg-mesh-dark pb-28 md:pb-12">
      <TopNav />
      <main className="max-w-3xl mx-auto px-4 md:px-6 pt-4 md:pt-8 overflow-x-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: direction * 40, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction * -40, scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 36,
              mass: 0.8,
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}
