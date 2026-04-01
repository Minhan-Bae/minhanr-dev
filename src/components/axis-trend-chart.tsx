"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { useMemo } from "react";
import { AXIS_LABELS, type Axis } from "@/lib/agents";

interface AxisMetricRow {
  id: string;
  date: string;
  axis: string;
  utilization: number;
  notes_count: number;
  delta: Record<string, number> | null;
}

const AXIS_HEX: Record<Axis, string> = {
  acquisition: "#4ade80",
  convergence: "#60a5fa",
  amplification: "#c084fc",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function AxisTrendChart({ history }: { history: AxisMetricRow[] }) {
  const chartData = useMemo(() => {
    const byDate = new Map<
      string,
      { date: string; acquisition: number; convergence: number; amplification: number }
    >();

    for (const row of history) {
      const key = row.date;
      if (!byDate.has(key)) {
        byDate.set(key, { date: key, acquisition: 0, convergence: 0, amplification: 0 });
      }
      const entry = byDate.get(key)!;
      if (row.axis === "acquisition" || row.axis === "convergence" || row.axis === "amplification") {
        entry[row.axis] = row.utilization;
      }
    }

    return Array.from(byDate.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [history]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-neutral-500 text-sm">
        No trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fill: "#737373", fontSize: 11 }}
          axisLine={{ stroke: "#404040" }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#737373", fontSize: 11 }}
          axisLine={{ stroke: "#404040" }}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1c1c1c",
            border: "1px solid #333",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelFormatter={(label) => formatDate(String(label))}
          formatter={(value, name) => [
            `${value}%`,
            AXIS_LABELS[String(name) as Axis] ?? name,
          ]}
        />
        <Legend
          formatter={(value: string) => AXIS_LABELS[value as Axis] ?? value}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Line
          type="monotone"
          dataKey="acquisition"
          stroke={AXIS_HEX.acquisition}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="convergence"
          stroke={AXIS_HEX.convergence}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="amplification"
          stroke={AXIS_HEX.amplification}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
