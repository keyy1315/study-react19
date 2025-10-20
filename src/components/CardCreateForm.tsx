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
export default function CardCreateForm({
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
        - onSubmit 이벤트 핸들러 사용
        - preventDefault로 기본 폼 제출 방지
        - FormData 객체를 수동으로 생성하여 전달
      */}
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          onSubmit(formData);
        }}
      >
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
