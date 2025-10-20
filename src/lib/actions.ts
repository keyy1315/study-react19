/**
 * React 19 Server Actions 구현
 *
 * "use server" 지시어는 이 파일의 모든 함수가 서버에서 실행됨을 의미합니다.
 * 클라이언트에서 호출되더라도 실제로는 서버에서 실행되어 보안과 성능을 보장합니다.
 */
"use server";

import { CardData } from "@/types/card";
import { ActionState } from "@/types/action";

/**
 * 카드 생성 액션
 *
 * React 19의 useActionState와 함께 사용되는 서버 액션입니다.
 *
 * @param prevState - 이전 액션 상태 (useActionState에서 자동으로 전달)
 * @param formData - 폼에서 전송된 데이터 (HTML FormData 객체)
 * @returns Promise<ActionState> - 액션 실행 결과
 *
 * 작동 방식:
 * 1. 폼 데이터에서 필요한 값들을 추출
 * 2. 클라이언트 사이드 유효성 검사 수행
 * 3. 서버 API에 POST 요청 전송
 * 4. 응답에 따라 성공/실패 상태 반환
 *
 * useActionState 훅에서 이 함수를 호출하면:
 * - 자동으로 로딩 상태 관리
 * - 액션 결과를 상태로 저장
 * - 컴포넌트 리렌더링 트리거
 */
export async function createCardAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // FormData에서 값 추출
    // HTML 폼의 name 속성과 일치하는 키로 데이터를 가져옵니다
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const iconUrl = formData.get("iconUrl") as string;
    const color = formData.get("color") as string;

    console.log("prevState:: ", prevState);

    // 클라이언트 사이드 유효성 검사
    // 서버로 요청을 보내기 전에 기본적인 검증을 수행합니다
    if (!title || !description) {
      return {
        success: false,
        message: "제목과 설명은 필수입니다.",
        error: "validation_error", // 에러 타입을 구분하여 UI에서 다르게 처리 가능
      };
    }

    // 서버 API 호출
    // 실제 데이터베이스나 외부 서비스와 통신합니다
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/cards`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(), // 공백 제거
          description: description.trim(),
          iconUrl: iconUrl || undefined, // 빈 문자열 대신 undefined 사용
          color: color || "#000000", // 기본 색상 설정
        }),
      }
    );

    const result = await response.json();

    // API 응답 상태 확인
    if (!result.success) {
      return {
        success: false,
        message: result.error || "카드 생성에 실패했습니다.",
        error: "api_error",
      };
    }

    // 3초 지연
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 성공 응답 반환
    return {
      success: true,
      message: "카드가 성공적으로 생성되었습니다.",
      card: result.card, // 생성된 카드 데이터를 반환하여 UI에서 활용
    };
  } catch (error) {
    // 예상치 못한 에러 처리
    console.error("Create card action error:", error);
    return {
      success: false,
      message: "카드 생성 중 오류가 발생했습니다.",
      error: "server_error",
    };
  }
}

// 카드 삭제 함수 (일반 async 함수)
export async function deleteCardAction(cardId: string): Promise<boolean> {
  try {
    // 유효성 검사
    if (!cardId) {
      throw new Error("카드 ID가 필요합니다.");
    }

    // API 호출
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/cards?id=${cardId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "카드 삭제에 실패했습니다.");
    }

    // 3초 지연
    await new Promise((resolve) => setTimeout(resolve, 3000));

    return true;
  } catch (error) {
    console.error("Delete card error:", error);
    return false;
  }
}

// 카드 목록 조회 액션
export async function fetchCards(): Promise<CardData[]> {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/cards`,
      {
        method: "GET",
        cache: "no-store", // 항상 최신 데이터 가져오기
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "카드 목록 조회에 실패했습니다.");
    }

    // 3초 지연
    await new Promise((resolve) => setTimeout(resolve, 3000));

    return result.cards;
  } catch (error) {
    console.error("Fetch cards action error:", error);
    throw error; // 에러를 다시 던져서 컴포넌트에서 처리할 수 있도록 함
  }
}
