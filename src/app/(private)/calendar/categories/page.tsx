import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listCategories } from "@/lib/actions/time";
import { CategoryManager } from "@/components/time/category-manager";
import { SeedCategoriesButton } from "@/components/time/seed-categories-button";

export const metadata = {
  title: "Time Categories | minhanr.dev",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/**
 * /calendar/categories — manage time_categories (label + color + order).
 *
 * Every change re-validates /calendar so the grid immediately reflects
 * rename/recolour. Deleted categories leave existing blocks
 * uncategorised (SQL ON DELETE SET NULL); the confirm dialog in the
 * manager is explicit about this.
 */
export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="font-technical mb-1 text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
            Calendar / Settings
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">카테고리 관리</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            이름과 색상을 자유롭게 변경하세요. 색상 변경은 타임블록 그리드에 즉시 반영됩니다.
          </p>
        </div>
        <Link
          href="/calendar"
          className="font-technical inline-flex items-center gap-1.5 rounded-sm border border-border bg-card/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden />
          Back to grid
        </Link>
      </header>

      {categories.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card/50 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            아직 카테고리가 없습니다. 기본 6개로 시작하거나, 직접 만드실 수 있습니다.
          </p>
          <div className="mt-5 flex items-center justify-center">
            <SeedCategoriesButton />
          </div>
        </div>
      ) : (
        <CategoryManager categories={categories} />
      )}
    </div>
  );
}
