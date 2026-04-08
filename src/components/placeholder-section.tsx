import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PlaceholderSectionProps {
  title: string;
  subtitle: string;
  upcoming: string[];
}

export function PlaceholderSection({ title, subtitle, upcoming }: PlaceholderSectionProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Coming soon</CardTitle>
          <CardDescription>다음 단계에서 추가될 위젯</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            {upcoming.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
