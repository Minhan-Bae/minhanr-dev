import { PublicHeader } from "@/components/public-header";
import { createSupabaseServer } from "@/lib/supabase-server";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth resolution drives the trailing NAV item
  // (Login ↔ Dashboard) so non-authenticated visitors don't hit a dead-end.
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  return (
    <div className="flex min-h-svh flex-col">
      <PublicHeader isAuthenticated={isAuthenticated} />
      <main className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {children}
      </main>
      <footer className="border-t border-border/30 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            © 2026 Minhan Bae · AI Researcher
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Minhan-Bae"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground/50 hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <span className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors">
              Built with Next.js
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
