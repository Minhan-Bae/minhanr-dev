/**
 * StateBadge — 노트의 상태(growing / mature / published / etc)를 색 코드된
 * 작은 배지로 렌더링한다.
 *
 * Tenet 2 (Garage door open) 구현의 시각적 어휘. 색은 globals.css의
 * `--state-{growing,mature,published}` 토큰에서 오며 dark / light / gray
 * 3 테마 모두 자동 대응한다.
 *
 * 사용처:
 *  - 홈 페이지의 "Now growing" 섹션
 *  - 노트 상세 페이지의 "Links to this note" 섹션 (Phase E)
 *  - 향후 /papers, /projects 카드 등으로 확장 가능
 *
 * OG 라우트의 stateColor() 함수와 시맨틱 동일 — 향후 src/lib/brand/state.ts
 * 같은 헬퍼로 통합 가능 (Phase F 후보).
 */
type Props = {
  status: string | null;
};

export function StateBadge({ status }: Props) {
  let colorVar = "var(--muted-foreground)";
  let label = status ?? "note";
  switch (status) {
    case "growing":
    case "draft":
    case "seedling":
      colorVar = "var(--state-growing)";
      label = status ?? "growing";
      break;
    case "mature":
    case "evergreen":
      colorVar = "var(--state-mature)";
      label = status ?? "mature";
      break;
    case "published":
    case "archived":
      colorVar = "var(--state-published)";
      label = status ?? "published";
      break;
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border whitespace-nowrap mt-0.5"
      style={{ borderColor: colorVar, color: colorVar }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: colorVar }}
      />
      {label}
    </span>
  );
}
