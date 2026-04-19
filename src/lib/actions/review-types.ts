/**
 * review-types.ts — weekly review server action의 타입·상수.
 *
 * "use server" 파일은 async 함수 외 export가 금지되므로 shared state
 * shape은 여기로 분리 (review.ts는 함수만 export).
 */

export interface WeeklyReviewState {
  ok: boolean;
  message: string;
  week?: string;
  path?: string;
  /** 마지막 시도 timestamp — useActionState가 같은 ok 결과 연속 시 React가
   *  re-render를 trigger하도록 변화 보장 */
  ts?: number;
}

export const initialWeeklyReviewState: WeeklyReviewState = {
  ok: false,
  message: "",
};
