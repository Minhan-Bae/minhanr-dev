import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchVaultIndex } from "@/lib/vault-index";

export const metadata = { title: "Links | OIKBAS" };
export const revalidate = 300;

interface LinkItem {
  path: string;
  title: string;
  url: string;
  domain: string;
  tags?: string[];
  status?: string;
  source_type?: string;
  created?: string;
}

function deriveTitle(path: string): string {
  return (path.split("/").pop() || path).replace(/\.md$/, "");
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

async function LinksContent() {
  let index;
  try {
    index = await fetchVaultIndex();
  } catch (e) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive text-sm">Vault index 로드 실패</CardTitle>
          <CardDescription>{e instanceof Error ? e.message : String(e)}</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  const items: LinkItem[] = [];
  for (const [path, rec] of Object.entries(index.notes || {})) {
    const url = typeof rec.source_url === "string" ? rec.source_url : "";
    if (!url.startsWith("http")) continue;
    items.push({
      path,
      title: deriveTitle(path),
      url,
      domain: domainOf(url),
      tags: Array.isArray(rec.tags) ? rec.tags : undefined,
      status: typeof rec.status === "string" ? rec.status : undefined,
      source_type: typeof rec.source_type === "string" ? rec.source_type : undefined,
      created: typeof rec.created === "string" ? rec.created : undefined,
    });
  }
  items.sort((a, b) => (b.created || "").localeCompare(a.created || ""));

  if (items.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          source_url 필드가 있는 노트가 없다
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <p className="text-xs text-muted-foreground">총 {items.length.toLocaleString()}건</p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((it) => (
          <li key={it.path}>
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardContent className="py-3 space-y-2">
                <a
                  href={it.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block font-medium text-sm leading-tight line-clamp-2 hover:underline"
                >
                  {it.title}
                </a>
                <p className="text-[10px] text-muted-foreground truncate">{it.domain}</p>
                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  {it.source_type && (
                    <Badge variant="outline" className="font-normal">
                      {it.source_type}
                    </Badge>
                  )}
                  {it.created && (
                    <span className="text-muted-foreground tabular-nums">{it.created}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function LinksPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Links</h1>
        <p className="text-sm text-muted-foreground">
          source_url 프론트매터 필드를 가진 노트 — 외부 자료 링크 모음
        </p>
      </div>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted" />}>
        <LinksContent />
      </Suspense>
    </div>
  );
}
