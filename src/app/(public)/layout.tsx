import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { SiteBackground } from "@/components/site-background";
import { createSupabaseServer } from "@/lib/supabase-server";
import { BRAND_IDENTITY } from "@/lib/brand/tokens";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-svh flex-col">
      <SiteBackground />
      <PublicHeader isAuthenticated={isAuthenticated} />
      <main className="flex-1">{children}</main>

      <footer className="hairline-t mt-24 font-technical">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-16 sm:grid-cols-[1fr_auto] sm:items-end sm:px-10">
          <div className="space-y-4">
            <div className="font-display text-3xl leading-[1.15] tracking-[-0.02em]">
              {BRAND_IDENTITY.studio}
              <span className="ml-1 text-muted-foreground">.dev</span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {BRAND_IDENTITY.manifesto}
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-x-8 gap-y-4 text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
            <Link
              href="/work"
              className="transition-colors hover:text-foreground"
            >
              작업
            </Link>
            <Link
              href="/blog"
              className="transition-colors hover:text-foreground"
            >
              글
            </Link>
            <Link
              href="/about"
              className="transition-colors hover:text-foreground"
            >
              소개
            </Link>
            <a
              href="/feed.xml"
              className="transition-colors hover:text-foreground"
              aria-label="RSS 피드"
            >
              RSS
            </a>
            <a
              href="https://github.com/Minhan-Bae"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
              aria-label="GitHub"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="hairline-t">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:px-10">
            <span>© {year} {BRAND_IDENTITY.domain}</span>
            <span>{BRAND_IDENTITY.domain}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
