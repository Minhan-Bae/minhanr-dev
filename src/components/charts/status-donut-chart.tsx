"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export interface StatusDonutChartProps {
  data: Array<{ status: string; count: number }>;
}

export function StatusDonutChart({ data }: StatusDonutChartProps) {
  const top = data.slice(0, 5);
  const config: ChartConfig = Object.fromEntries(
    top.map((d, i) => [d.status, { label: d.status, color: PALETTE[i % PALETTE.length] }])
  );
  return (
    <ChartContainer config={config} className="h-64 w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
        <Pie data={top} dataKey="count" nameKey="status" innerRadius={50} outerRadius={80} paddingAngle={2}>
          {top.map((d, i) => (
            <Cell key={d.status} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="status" />} />
      </PieChart>
    </ChartContainer>
  );
}
