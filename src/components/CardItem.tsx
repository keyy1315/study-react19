import { CardData } from "@/types/card";

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
export default function CardItem({
  card,
  onDelete,
  isPending,
}: {
  card: CardData & { isPending?: boolean };
  onDelete: (cardId: string) => void;
  isPending: boolean;
}) {
  const isCardPending = card.isPending && isPending;

  return (
    <div
      className={`bg-white p-4 rounded-lg shadow-md border ${
        isCardPending ? "opacity-60" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">
          {card.title}
          {isCardPending && (
            <span className="ml-2 text-xs text-blue-600 font-normal">
              {card.id.startsWith("temp-") ? "(생성중...)" : "(삭제중...)"}
            </span>
          )}
        </h3>
        <button
          type="button"
          onClick={() => onDelete(card.id)}
          disabled={isCardPending}
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
