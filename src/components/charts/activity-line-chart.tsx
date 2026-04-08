"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const config = {
  Daily: { label: "Daily", color: "var(--chart-1)" },
  Projects: { label: "Projects", color: "var(--chart-2)" },
  Resources: { label: "Resources", color: "var(--chart-3)" },
  Areas: { label: "Areas", color: "var(--chart-4)" },
} satisfies ChartConfig;

export interface ActivityLineChartProps {
  data: Array<{
    month: string;
    Daily: number;
    Projects: number;
    Resources: number;
    Areas: number;
    Other: number;
  }>;
}

export function ActivityLineChart({ data }: ActivityLineChartProps) {
  return (
    <ChartContainer config={config} className="h-64 w-full">
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
        <YAxis tickLine={false} axisLine={false} fontSize={11} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line type="monotone" dataKey="Daily" stroke="var(--color-Daily)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Projects" stroke="var(--color-Projects)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Resources" stroke="var(--color-Resources)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Areas" stroke="var(--color-Areas)" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  );
}
