import Link from "next/link";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface StatKpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "flat";
  accentColor?: string;
  href?: string;
}

const trendIcons = {
  up: <TrendingUp className="h-3.5 w-3.5 text-chart-3" />,
  down: <TrendingDown className="h-3.5 w-3.5 text-destructive" />,
  flat: <Minus className="h-3.5 w-3.5 text-muted-foreground" />,
};

export function StatKpiCard({ label, value, hint, icon, trend, accentColor, href }: StatKpiCardProps) {
  const card = (
    <Card
      className={`relative overflow-hidden transition-all duration-200 ${
        accentColor ? `border-l-2 ${accentColor}` : ""
      } ${href ? "card-lift cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10" : ""}`}
    >
      <CardContent className="py-4">
        {icon && (
          <div className="absolute top-3 right-3 text-muted-foreground/15">
            <div className="h-8 w-8">{icon}</div>
          </div>
        )}
        <CardDescription className="text-xs uppercase tracking-wider">
          {label}
        </CardDescription>
        <div className="flex items-end gap-2 mt-1">
          <CardTitle className="text-3xl sm:text-4xl font-bold tabular-nums">
            {value}
          </CardTitle>
          {trend && trendIcons[trend]}
        </div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} aria-label={`${label}: ${value}`} className="block">
        {card}
      </Link>
    );
  }
  return card;
}
