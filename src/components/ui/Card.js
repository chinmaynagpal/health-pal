"use client";
import { motion } from "framer-motion";
import clsx from "clsx";

export default function Card({ as = "div", interactive, className, children, ...rest }) {
  const Comp = interactive ? motion.button : motion.div;
  return (
    <Comp
      whileTap={interactive ? { scale: 0.96, y: 1 } : undefined}
      whileHover={interactive ? { scale: 1.02, y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.7 }}
      className={clsx("surface p-5 text-left w-full", className)}
      {...rest}
    >
      {children}
    </Comp>
  );
}
