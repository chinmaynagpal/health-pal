"use client";
import { motion } from "framer-motion";
import clsx from "clsx";

export default function Card({ as = "div", interactive, className, children, ...rest }) {
  const Comp = interactive ? motion.button : motion.div;
  return (
    <Comp
      whileTap={interactive ? { scale: 0.985 } : undefined}
      whileHover={interactive ? { y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={clsx("surface p-5 text-left w-full", className)}
      {...rest}
    >
      {children}
    </Comp>
  );
}
