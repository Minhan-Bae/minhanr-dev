import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex min-h-svh flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4 bg-background/90 backdrop-blur-md sticky top-0 z-30">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center justify-between">
            <span className="text-sm font-bold tracking-tight text-foreground">
              Workspace
            </span>
          </div>
        </header>
        <main className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </main>
        <footer className="border-t border-border/30 px-6 py-2.5 text-xs text-muted-foreground/50 text-center">
          minhanr.dev
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
