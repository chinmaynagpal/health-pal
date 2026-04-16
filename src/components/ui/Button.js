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
      whileTap={{ scale: 0.95, y: 1 }}
      whileHover={{ scale: 1.015 }}
      transition={{ type: "spring", stiffness: 500, damping: 25, mass: 0.6 }}
      disabled={disabled || loading}
      className={clsx(
        styles[variant],
        "disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...rest}
    >
      {loading && (
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
        />
      )}
      {children}
    </motion.button>
  );
}
