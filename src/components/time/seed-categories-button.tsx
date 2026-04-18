"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { seedDefaultCategories } from "@/lib/actions/time";

/**
 * Seeds the six default categories (업무/수면/취미/주말·공휴일/부업·자기계발/
 * 가족·불가피) and refreshes the page. Idempotent — clicking twice on
 * an already-seeded user is a no-op (ON CONFLICT in the SQL fn).
 */
export function SeedCategoriesButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    startTransition(async () => {
      try {
        await seedDefaultCategories();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Seed failed");
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button onClick={onClick} disabled={pending} variant="default" size="default">
        <Sparkles className="mr-2 h-4 w-4" aria-hidden />
        {pending ? "불러오는 중…" : "기본 카테고리 6개 불러오기"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
