"use client";
import { motion } from "framer-motion";
import clsx from "clsx";

const styles = {
  primary: "btn-primary",
  ghost: "btn-ghost",
  plain:
    "btn bg-transparent text-[color:var(--text)] hover:bg-[color:var(--surface-2)] border border-transparent",
};

export default function Button({
  variant = "primary",
  className,
  children,
  loading,
  disabled,
  ...rest
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      disabled={disabled || loading}
      className={clsx(
        styles[variant],
        "disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...rest}
    >
      {loading && (
        <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
      )}
      {children}
    </motion.button>
  );
}
