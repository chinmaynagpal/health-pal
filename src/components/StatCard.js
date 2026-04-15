"use client";
import Card from "@/components/ui/Card";

export default function StatCard({ icon, label, value, sub, tint = "#34C759", onClick }) {
  return (
    <Card interactive={!!onClick} onClick={onClick} className="p-4">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-2xl grid place-items-center shrink-0"
          style={{
            background: `color-mix(in oklab, ${tint} 16%, transparent)`,
            color: tint,
          }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[12px] uppercase tracking-wider text-[color:var(--text-muted)] font-medium">
            {label}
          </div>
          <div className="h-display tabular text-xl leading-tight truncate">{value}</div>
          {sub && (
            <div className="text-[11px] text-[color:var(--text-muted)] truncate">{sub}</div>
          )}
        </div>
      </div>
    </Card>
  );
}
