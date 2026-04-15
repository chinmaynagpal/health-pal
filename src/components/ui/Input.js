"use client";
import clsx from "clsx";
import { forwardRef } from "react";

const Input = forwardRef(function Input(
  { label, hint, error, className, ...rest },
  ref
) {
  return (
    <label className="block">
      {label && <span className="label">{label}</span>}
      <input
        ref={ref}
        className={clsx("input tabular", error && "!border-red-500 !shadow-none", className)}
        {...rest}
      />
      {hint && !error && (
        <span className="text-xs text-[color:var(--text-muted)] mt-1.5 block">{hint}</span>
      )}
      {error && <span className="text-xs text-red-500 mt-1.5 block">{error}</span>}
    </label>
  );
});

export default Input;
