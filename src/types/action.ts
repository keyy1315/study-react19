import { CardData } from "@/types/card";

/**
 * 액션 상태 타입 정의
 *
 * React 19의 useActionState 훅과 함께 사용되는 상태 타입입니다.
 * 각 액션의 실행 결과(성공/실패, 메시지, 에러 정보)를 담습니다.
 */
export interface ActionState {
  success: boolean; // 액션 실행 성공 여부
  message: string; // 사용자에게 표시할 메시지
  error?: string; // 에러 타입 (선택적)
  card?: CardData; // 액션 결과로 반환된 카드 데이터 (선택적)
}

/**
 * 초기 액션 상태
 *
 * useActionState 훅의 초기값으로 사용됩니다.
 * 액션이 실행되기 전의 기본 상태를 정의합니다.
 */
export const initialActionState: ActionState = {
  success: false,
  message: "",
};
