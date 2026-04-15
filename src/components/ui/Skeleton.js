"use client";
import clsx from "clsx";

export default function Skeleton({ className, style }) {
  return <div className={clsx("skeleton", className)} style={style} />;
}
