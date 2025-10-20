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
   * 각 액션마다 별도의 상태를 관리:
   * - createState: 카드 생성 액션의 결과 상태
   * - deleteState: 카드 삭제 액션의 결과 상태
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
  const [deleteState, deleteAction] = useActionState(
    deleteCardAction,
    initialActionState
  );

  // 서버 액션 성공 후 로컬 상태 업데이트
  useEffect(() => {
    if (createState.success && createState.card) {
      // 임시 카드 제거하고 실제 카드 추가
      setCards((prev) => [
        ...prev.filter((card) => !card.id.startsWith("temp-")),
        createState.card!,
      ]);
    } else if (createState.success === false && createState.message) {
      // 실패 시 임시 카드만 제거 (useOptimistic이 자동으로 롤백)
      setCards((prev) => prev.filter((card) => !card.id.startsWith("temp-")));
    }
  }, [createState]);

  useEffect(() => {
    if (deleteState.success && deleteState.card) {
      // 성공 시 실제로 삭제
      setCards((prev) =>
        prev.filter((card) => card.id !== deleteState.card!.id)
      );
    } else if (deleteState.success === false && deleteState.message) {
      // 실패 시 삭제된 카드 복원 (useOptimistic이 자동으로 롤백)
      // 별도 처리 불필요 - useOptimistic이 자동으로 이전 상태로 복원
    }
  }, [deleteState]);

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
          return state.filter((card) => card.id !== action.data);
        default:
          return state;
      }
    }
  );

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
   * 1. FormData 객체 생성 및 ID 추가
   * 2. startTransition 내에서 낙관적 업데이트와 서버 액션 실행
   * 3. 서버 요청 실패 시 자동으로 롤백
   *
   * 낙관적 업데이트의 장점:
   * - 사용자가 즉시 피드백을 받음
   * - 네트워크 지연에 영향받지 않음
   * - 실패 시 자동 복구
   */
  const handleDeleteCard = (cardId: string) => {
    const formData = new FormData();
    formData.append("id", cardId);

    // startTransition 내에서 낙관적 업데이트와 서버 액션 실행
    startTransition(() => {
      // 낙관적 업데이트: 서버 응답을 기다리지 않고 즉시 UI에서 제거
      optimisticUpdate({ type: "delete", data: cardId });

      // 서버 액션 실행
      // useActionState가 자동으로 prevState를 첫 번째 매개변수로 전달
      // deleteAction(prevState, formData) 형태로 호출됨
      deleteAction(formData);
    });
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
        {optimisticCards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            onDelete={handleDeleteCard}
            isPending={isPending}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 카드 생성 폼 컴포넌트
 *
 * React 19의 Server Actions와 함께 작동하는 폼 컴포넌트입니다.
 *
 * @param onSubmit - 폼 제출 시 실행될 핸들러 함수
 * @param isPending - 현재 액션이 실행 중인지 여부 (useTransition에서 제공)
 * @param actionState - 액션 실행 결과 상태 (useActionState에서 제공)
 *
 * 주요 특징:
 * 1. HTML 폼의 action 속성 사용
 * 2. FormData를 통한 데이터 전송
 * 3. 로딩 상태에 따른 UI 비활성화
 * 4. 액션 결과에 따른 메시지 표시
 *
 * 작동 방식:
 * 1. 사용자가 폼을 제출
 * 2. 브라우저가 FormData 객체 생성
 * 3. onSubmit 핸들러가 서버 액션 호출
 * 4. useActionState가 결과를 상태에 저장
 * 5. 컴포넌트가 자동으로 리렌더링
 */
function CardCreateForm({
  onSubmit,
  isPending,
  actionState,
}: {
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
  actionState: any;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">새 카드 생성</h2>

      {/* 
        HTML 폼 요소
        - action 속성에 onSubmit 핸들러 연결
        - 브라우저가 자동으로 FormData 객체 생성
        - 제출 시 preventDefault 없이도 정상 작동
      */}
      <form action={onSubmit} className="space-y-4">
        {/* 제목 입력 필드 */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            제목
          </label>
          <input
            type="text"
            id="title"
            name="title" // FormData에서 이 키로 값을 가져옴
            required // HTML5 유효성 검사
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isPending} // 로딩 중에는 입력 비활성화
          />
        </div>

        {/* 설명 입력 필드 */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            설명
          </label>
          <textarea
            id="description"
            name="description" // FormData에서 이 키로 값을 가져옴
            required // HTML5 유효성 검사
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isPending} // 로딩 중에는 입력 비활성화
          />
        </div>

        {/* 색상 선택 필드 */}
        <div>
          <label
            htmlFor="color"
            className="block text-sm font-medium text-gray-700"
          >
            색상
          </label>
          <input
            type="color"
            id="color"
            name="color" // FormData에서 이 키로 값을 가져옴
            defaultValue="#000000" // 기본 색상 설정
            className="mt-1 block w-20 h-10 border border-gray-300 rounded-md"
            disabled={isPending} // 로딩 중에는 입력 비활성화
          />
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isPending} // 로딩 중에는 버튼 비활성화
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* 로딩 상태에 따라 버튼 텍스트 변경 */}
          {isPending ? "생성 중..." : "카드 생성"}
        </button>

        {/* 
          액션 상태 메시지 표시
          useActionState에서 제공하는 상태를 기반으로 성공/실패 메시지 표시
          - success가 true면 녹색 배경으로 성공 메시지
          - success가 false면 빨간색 배경으로 에러 메시지
        */}
        {actionState.message && (
          <div
            className={`text-sm p-3 rounded-md ${
              actionState.success
                ? "bg-green-100 text-green-800" /* 성공 메시지 스타일 */
                : "bg-red-100 text-red-800" /* 에러 메시지 스타일 */
            }`}
          >
            {actionState.message}
          </div>
        )}
      </form>
    </div>
  );
}

/**
 * 카드 아이템 컴포넌트
 *
 * 개별 카드를 표시하고 삭제 버튼을 제공하는 컴포넌트입니다.
 *
 * @param card - 표시할 카드 데이터
 * @param onDelete - 삭제 버튼 클릭 시 실행될 함수
 * @param isPending - 현재 액션이 실행 중인지 여부
 *
 * 주요 기능:
 * 1. 카드 정보 표시 (제목, 설명, 색상)
 * 2. 삭제 버튼 제공
 * 3. 로딩 상태에 따른 버튼 비활성화
 * 4. 낙관적 업데이트 지원
 */
function CardItem({
  card,
  onDelete,
  isPending,
}: {
  card: CardData;
  onDelete: (cardId: string) => void;
  isPending: boolean;
}) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{card.title}</h3>
        <button
          onClick={() => onDelete(card.id)}
          disabled={isPending}
          className="text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          삭제
        </button>
      </div>

      <p className="text-gray-600 text-sm mb-3">{card.description}</p>

      {card.color && (
        <div
          className="w-full h-2 rounded"
          style={{ backgroundColor: card.color }}
        />
      )}
    </div>
  );
}
