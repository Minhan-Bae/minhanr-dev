import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCachedVaultIndex } from "@/lib/vault-index";

export const metadata = {
  title: "Finance | OIKBAS",
  robots: { index: false, follow: false },
};
export const revalidate = 300;

interface FinanceNote {
  path: string;
  title: string;
  created: string;
  excerpt: string;
  sourceType: string;
}

async function FinanceContent() {
  let index;
  try {
    index = await getCachedVaultIndex();
  } catch {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive text-sm">Vault index 로드 실패</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const financeNotes: FinanceNote[] = [];
  const macroNotes: FinanceNote[] = [];

  for (const [path, note] of Object.entries(index.notes)) {
    if (typeof note !== "object" || !note) continue;

    if (path.startsWith("030_Areas/034_Finance/")) {
      financeNotes.push({
        path,
        title: (note.title || path.split("/").pop()?.replace(/\.md$/, "") || "").replace(/_/g, " "),
        created: (note.created as string) || "",
        excerpt: (note.excerpt as string) || "",
        sourceType: (note.source_type as string) || "",
      });
    }

    if (path.startsWith("040_Resources/044_Macro/")) {
      macroNotes.push({
        path,
        title: (note.title || path.split("/").pop()?.replace(/\.md$/, "") || "").replace(/_/g, " "),
        created: (note.created as string) || "",
        excerpt: (note.excerpt as string) || "",
        sourceType: (note.source_type as string) || "",
      });
    }
  }

  financeNotes.sort((a, b) => b.created.localeCompare(a.created));
  macroNotes.sort((a, b) => b.created.localeCompare(a.created));

  const insiderScans = financeNotes.filter((n) => n.title.includes("Insider Scan") || n.title.includes("Insider_Scan"));
  const marketNotes = financeNotes.filter((n) => n.title.includes("Market") || n.title.includes("Daily_Summary"));
  const otherFinance = financeNotes.filter((n) => !insiderScans.includes(n) && !marketNotes.includes(n));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Insider Scan</CardDescription>
            <CardTitle className="text-2xl">{insiderScans.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Market Notes</CardDescription>
            <CardTitle className="text-2xl">{marketNotes.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Macro Analysis</CardDescription>
            <CardTitle className="text-2xl">{macroNotes.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Insider Scan</CardTitle>
          <CardDescription>내부자 매수 신호 (OpenInsider)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insiderScans.slice(0, 10).map((n) => (
              <div key={n.path} className="p-3 rounded-lg border border-neutral-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{n.title}</span>
                  <span className="text-xs text-muted-foreground">{n.created}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">{n.excerpt}</p>
              </div>
            ))}
            {insiderScans.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">아직 Insider Scan이 없습니다</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Macro Analysis</CardTitle>
          <CardDescription>매크로 경제 분석</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {macroNotes.slice(0, 10).map((n) => (
              <div key={n.path} className="flex items-center justify-between py-2 border-b border-neutral-800 last:border-0">
                <div className="flex-1 min-w-0">
                  <span className="text-sm truncate block">{n.title}</span>
                  <p className="text-xs text-muted-foreground line-clamp-1">{n.excerpt}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {n.sourceType && <Badge variant="outline" className="text-xs">{n.sourceType}</Badge>}
                  <span className="text-xs text-muted-foreground">{n.created}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {(marketNotes.length > 0 || otherFinance.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>기타 금융 노트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...marketNotes, ...otherFinance].slice(0, 10).map((n) => (
                <div key={n.path} className="flex items-center justify-between py-1.5 border-b border-neutral-800 last:border-0">
                  <span className="text-sm truncate">{n.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{n.created}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function FinancePage() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Finance</h1>
      <p className="text-muted-foreground">금융 시그널 및 매크로 분석 대시보드</p>
      <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
        <FinanceContent />
      </Suspense>
    </div>
  );
}
