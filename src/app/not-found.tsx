import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <FileQuestion className="h-12 w-12 text-muted-foreground/30 mb-4" />
      <h1 className="text-5xl font-bold tracking-tight text-gradient">
        404
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        페이지를 찾을 수 없습니다.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
