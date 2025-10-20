/**
 * React 19 Actions 기능을 활용한 카드 관리 컴포넌트
 *
 * 이 컴포넌트는 React 19의 새로운 기능들을 사용합니다:
 * - useActionState: 서버 액션의 상태와 결과를 관리
 * - useTransition: 액션 실행 중 로딩 상태를 관리
 * - useOptimistic: 낙관적 업데이트로 즉시 UI 반영
 *
 * 이러한 기능들을 통해 사용자에게 빠르고 반응성 좋은 경험을 제공합니다.
 */
import {
  useState,
  useTransition,
  useActionState,
  useOptimistic,
  useEffect,
} from "react";
import { CardData } from "@/types/card";
import { createCardAction, deleteCardAction } from "@/lib/actions";
import { initialActionState } from "@/types/action";
import CardItem from "@/components/CardItem";
import CardCreateForm from "@/components/CardCreateForm";

/**
 * 카드 관리 메인 컴포넌트
 *
 * @param cards - 표시할 카드 목록
 *
 * 주요 기능:
 * 1. 카드 생성, 삭제
 * 2. 낙관적 업데이트로 즉시 UI 반영
 * 3. 로딩 상태 및 에러 처리
 * 4. 폼 기반 데이터 제출
 */
export default function CardManager({
  cards: initialCards,
}: {
  cards: CardData[];
}) {
  // 서버 액션 성공 후 업데이트된 카드 목록
  const [cards, setCards] = useState<CardData[]>(initialCards);

  // 임시 상태 관리 (낙관적 업데이트 중인 카드들)
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(
    new Set()
  );
  /**
   * useTransition 훅 사용
   *
   * React 19의 새로운 훅으로, 비동기 작업의 로딩 상태를 관리합니다.
   *
   * 반환값:
   * - isPending: 현재 비동기 작업이 진행 중인지 여부
   * - startTransition: 비동기 작업을 시작하는 함수
   *
   * 장점:
   * - 자동으로 로딩 상태 관리
   * - 사용자 인터랙션을 차단하지 않음
   * - 우선순위 기반 업데이트
   */
  const [isPending, startTransition] = useTransition();

  /**
   * useActionState 훅 사용
   *
   * React 19의 새로운 훅으로, 서버 액션의 상태와 결과를 관리합니다.
   *
   * 카드 생성 액션의 상태를 관리:
   * - createState: 카드 생성 액션의 결과 상태
   *
   * 반환값:
   * - [state, action]: [현재 상태, 액션 실행 함수]
   *
   * 장점:
   * - 액션 결과를 자동으로 상태로 저장
   * - 성공/실패 메시지 자동 관리
   * - 컴포넌트 리렌더링 자동 트리거
   */
  const [createState, createAction] = useActionState(
    createCardAction, // 서버 액션 함수
    initialActionState // 초기 상태
  );

  // 서버 액션 성공 후 로컬 상태 업데이트
  useEffect(() => {
    if (createState.success && createState.card) {
      // 임시 카드 제거하고 실제 카드 추가
      setCards((prev) => [
        ...prev.filter((card) => !card.id.startsWith("temp-")),
        createState.card!,
      ]);

      // 임시 상태 제거
      setPendingOperations((prev) => {
        const newSet = new Set(prev);
        // temp-로 시작하는 모든 ID 제거
        prev.forEach((id) => {
          if (id.startsWith("temp-")) {
            newSet.delete(id);
          }
        });
        return newSet;
      });
    }
  }, [createState]);

  /**
   * useOptimistic 훅 사용 - 낙관적 업데이트
   *
   * 서버 응답을 기다리지 않고 즉시 UI를 업데이트하는 기능입니다.
   * 서버 요청이 실패하면 자동으로 이전 상태로 롤백됩니다.
   *
   * 생성과 삭제 작업을 처리합니다.
   */
  const [optimisticCards, optimisticUpdate] = useOptimistic(
    cards, // 현재 상태 (초기 카드들)
    (state, action: { type: "create" | "delete"; data: CardData | string }) => {
      switch (action.type) {
        case "create":
          return [...state, action.data as CardData];
        case "delete":
          // 삭제 중인 카드는 제거하지 않고 그대로 유지 (로딩 표시를 위해)
          return state;
        default:
          return state;
      }
    }
  );

  // 임시 상태가 포함된 카드 목록 생성
  const displayCards = optimisticCards.map((card) => ({
    ...card,
    isPending: pendingOperations.has(card.id) || card.id.startsWith("temp-"),
  }));

  // ===== 액션 핸들러 함수들 =====

  /**
   * 카드 생성 핸들러
   *
   * @param formData - HTML 폼에서 전송된 데이터
   *
   * 작동 방식:
   * 1. FormData에서 값 추출하여 임시 카드 생성
   * 2. startTransition 내에서 낙관적 업데이트와 서버 액션 실행
   * 3. 서버 응답 후 실제 데이터로 교체 또는 롤백
   *
   * 낙관적 업데이트의 장점:
   * - 사용자가 즉시 피드백을 받음
   * - 네트워크 지연에 영향받지 않음
   * - 실패 시 자동 복구
   */
  const handleCreateCard = (formData: FormData) => {
    // FormData에서 값 추출하여 임시 카드 생성
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const color = formData.get("color") as string;

    // 낙관적 업데이트를 위한 임시 카드 생성
    const optimisticCard: CardData = {
      id: `temp-${Date.now()}`, // 임시 ID
      title: title || "",
      description: description || "",
      color: color || "#000000",
    };

    // startTransition 내에서 낙관적 업데이트와 서버 액션 실행
    startTransition(() => {
      // 임시 상태 추가
      setPendingOperations((prev) => new Set(prev).add(optimisticCard.id));

      // 낙관적 업데이트: 서버 응답을 기다리지 않고 즉시 UI에 추가
      optimisticUpdate({ type: "create", data: optimisticCard });

      // 서버 액션 실행
      // useActionState가 자동으로 prevState를 첫 번째 매개변수로 전달
      // createAction(prevState, formData) 형태로 호출됨
      createAction(formData);
    });
  };

  /**
   * 카드 삭제 핸들러
   *
   * @param cardId - 삭제할 카드의 ID
   *
   * 작동 방식:
   * 1. 낙관적 업데이트로 즉시 UI 반영
   * 2. 비동기로 서버 요청 실행
   * 3. 서버 요청 실패 시 useOptimistic이 자동으로 롤백
   */
  const handleDeleteCard = async (cardId: string) => {
    // 임시 상태 추가 (삭제 중인 카드 표시)
    setPendingOperations((prev) => new Set(prev).add(cardId));

    // 낙관적 업데이트: 삭제 중 상태로 표시 (카드는 유지)
    startTransition(() => {
      optimisticUpdate({ type: "delete", data: cardId });
    });

    try {
      // 일반 async 함수로 서버 요청
      const success = await deleteCardAction(cardId);

      if (success) {
        // 성공 시 실제로 카드 제거
        setCards((prev) => prev.filter((card) => card.id !== cardId));
      }
    } catch (error) {
      console.error("Delete card error:", error);
    } finally {
      // 완료 후 임시 상태 제거
      setPendingOperations((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cardId);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 카드 생성 폼 */}
      <CardCreateForm
        onSubmit={handleCreateCard}
        isPending={isPending}
        actionState={createState}
      />

      {/* 카드 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayCards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            onDelete={handleDeleteCard}
            isPending={card.isPending || isPending}
          />
        ))}
      </div>
    </div>
  );
}
