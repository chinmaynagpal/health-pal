"use client";
import Link from "next/link";
import { Moon, Sun, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Logo from "@/components/Logo";

export default function TopNav() {
  const { logout, user } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-30 glass">
      <div className="max-w-3xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Logo size={28} />
          <span className="h-display text-[17px]">Health Pal</span>
        </Link>
        <div className="flex items-center gap-1">
          {user?.name && (
            <span className="hidden sm:block text-sm text-[color:var(--text-muted)] mr-2">
              Hi, {user.name.split(" ")[0]}
            </span>
          )}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="w-9 h-9 grid place-items-center rounded-full hover:bg-[color:var(--surface-2)] transition"
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            onClick={logout}
            aria-label="Logout"
            className="w-9 h-9 grid place-items-center rounded-full hover:bg-[color:var(--surface-2)] transition"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
