"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const config = {
  count: { label: "Notes", color: "var(--chart-2)" },
} satisfies ChartConfig;

export interface TagTopBarChartProps {
  data: Array<{ tag: string; count: number }>;
}

export function TagTopBarChart({ data }: TagTopBarChartProps) {
  return (
    <ChartContainer config={config} className="h-72 w-full">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
      >
        <XAxis type="number" hide />
        <YAxis
          dataKey="tag"
          type="category"
          tickLine={false}
          axisLine={false}
          width={120}
          fontSize={11}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
