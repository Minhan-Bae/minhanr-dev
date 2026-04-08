import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

export interface StatKpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

export function StatKpiCard({ label, value, hint }: StatKpiCardProps) {
  return (
    <Card>
      <CardContent className="py-4">
        <CardDescription className="text-[11px] uppercase tracking-wider">
          {label}
        </CardDescription>
        <CardTitle className="mt-1 text-3xl font-bold tabular-nums">
          {value}
        </CardTitle>
        {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
