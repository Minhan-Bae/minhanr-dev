/**
 * vault-types.ts — vault server actions가 쓰는 타입·상수.
 *
 * Next.js 16의 "use server" 모듈 규칙은 async 함수 외에 어떤 export도
 * 허용하지 않는다 (interface, type, const, default 모두 포함). 이 규칙을
 * 위반하면 해당 action을 호출하는 모든 경로가 런타임에 500으로 터진다
 * (예: /deadlines가 DeadlinesBucket → transitionNoteAction을 호출할 때).
 *
 * 그래서 타입·상수는 "use server"가 없는 sibling 파일로 분리한다. actions
 * 본체(vault.ts)와 client 컴포넌트 양쪽이 이 파일에서 동일 타입을 import
 * 한다.
 */

export type VaultAction = "pause" | "complete" | "archive";

export interface VaultActionResult {
  ok: boolean;
  path: string;
  action: VaultAction;
  error?: string;
}

export interface QuickCaptureState {
  ok: boolean;
  message: string;
  path?: string;
  ts?: number;
}

export const initialQuickCaptureState: QuickCaptureState = {
  ok: false,
  message: "",
};
