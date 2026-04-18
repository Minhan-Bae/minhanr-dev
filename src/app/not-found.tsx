import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="kicker mb-6">404</p>
      <h1
        className="font-display leading-[1.15] tracking-[-0.02em]"
        style={{ fontSize: "var(--font-size-h1)" }}
      >
        페이지를 찾을 수 없습니다.
      </h1>
      <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
        요청하신 페이지가 존재하지 않습니다. 이동되었거나 처음부터
        없었던 주소일 수 있습니다.
      </p>
      <Link
        href="/"
        className="font-technical mt-10 inline-flex items-center gap-2 border-b border-primary pb-1 text-[13px] uppercase tracking-[0.16em] text-foreground transition-colors hover:text-primary"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
