"use client";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Skeleton from "@/components/ui/Skeleton";

export default function ProgressPage() {
  const { authFetch } = useAuth();
  const [range, setRange] = useState("week");
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    authFetch(`/api/analytics?range=${range}`)
      .then((r) => r.json())
      .then(setData);
  }, [range, authFetch]);

  const avg = (arr, key) => {
    const nums = (arr || []).map((x) => x[key]).filter((n) => n > 0);
    if (!nums.length) return 0;
    return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="h-display text-[26px]">Progress</h1>
          <p className="text-sm text-[color:var(--text-muted)] mt-0.5">Trends & totals</p>
        </div>
        <SegmentedControl
          value={range}
          onChange={setRange}
          options={[
            { value: "week", label: "Week" },
            { value: "month", label: "Month" },
          ]}
        />
      </div>

      <ChartCard
        title="Calories"
        subtitle={data ? `${avg(data.calories, "calories")} kcal avg` : null}
        loading={!data}
      >
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data?.calories || []} margin={{ top: 10, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="barGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34C759" stopOpacity={1} />
                <stop offset="100%" stopColor="#34C759" stopOpacity={0.35} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--separator)" strokeDasharray="3 6" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => d.slice(5)}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              stroke="var(--text-muted)"
            />
            <YAxis hide />
            <Tooltip {...tooltipProps} formatter={(v) => [`${v} kcal`, "Calories"]} />
            <Bar dataKey="calories" fill="url(#barGreen)" radius={[10, 10, 4, 4]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Steps"
        subtitle={data ? `${avg(data.steps, "steps").toLocaleString()} avg/day` : null}
        loading={!data}
      >
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data?.steps || []} margin={{ top: 10, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.35} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--separator)" strokeDasharray="3 6" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => d.slice(5)}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              stroke="var(--text-muted)"
            />
            <YAxis hide />
            <Tooltip {...tooltipProps} formatter={(v) => [`${Number(v).toLocaleString()} steps`, "Steps"]} />
            <Bar dataKey="steps" fill="url(#barBlue)" radius={[10, 10, 4, 4]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Weight"
        subtitle={
          data?.weights?.length
            ? `${data.weights[0].weight} → ${data.weights.at(-1).weight} kg`
            : null
        }
        loading={!data}
      >
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data?.weights || []} margin={{ top: 10, right: 6, left: 6, bottom: 0 }}>
            <defs>
              <linearGradient id="lineAmber" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--separator)" strokeDasharray="3 6" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => d.slice(5)}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              stroke="var(--text-muted)"
            />
            <YAxis hide domain={["dataMin-1", "dataMax+1"]} />
            <Tooltip {...tooltipProps} formatter={(v) => [`${v} kg`, "Weight"]} />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="url(#lineAmber)"
              strokeWidth={3}
              dot={{ r: 3, strokeWidth: 0, fill: "#F59E0B" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

const tooltipProps = {
  cursor: { fill: "rgba(52,199,89,0.08)" },
  contentStyle: {
    background: "rgba(28,28,30,0.94)",
    color: "white",
    border: "none",
    borderRadius: 12,
    fontSize: 12,
    padding: "8px 10px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
  },
  labelStyle: { color: "rgba(255,255,255,0.65)", fontSize: 11 },
};

function ChartCard({ title, subtitle, children, loading }) {
  return (
    <div className="surface p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="h-display text-[17px]">{title}</h3>
        {subtitle && (
          <span className="text-[12px] text-[color:var(--text-muted)] tabular">{subtitle}</span>
        )}
      </div>
      {loading ? <Skeleton className="w-full h-[200px]" /> : children}
    </div>
  );
}
