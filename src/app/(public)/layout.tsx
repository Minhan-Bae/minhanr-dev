import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { SiteBackground } from "@/components/site-background";
import { RainEffect } from "@/components/rain-effect";
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
      <RainEffect />
      <PublicHeader isAuthenticated={isAuthenticated} />
      <main className="flex-1">{children}</main>

      <footer className="hairline-t mt-16 font-technical">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-8 gap-y-4 px-6 py-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:px-10">
          <span className="font-display text-base normal-case tracking-[-0.015em] text-foreground">
            {BRAND_IDENTITY.studio}
            <span className="text-muted-foreground">.dev</span>
          </span>

          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/work" className="transition-colors hover:text-foreground">
              Work
            </Link>
            <Link href="/blog" className="transition-colors hover:text-foreground">
              Writing
            </Link>
            <Link href="/about" className="transition-colors hover:text-foreground">
              About
            </Link>
            <a
              href="/feed.xml"
              className="transition-colors hover:text-foreground"
              aria-label="RSS"
            >
              RSS
            </a>
            <a
              href="https://github.com/Minhan-Bae"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              GitHub
            </a>
          </nav>

          <span className="tabular-nums">© {year} {BRAND_IDENTITY.domain}</span>
        </div>
      </footer>
    </div>
  );
}
