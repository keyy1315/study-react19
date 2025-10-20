// 로딩 상태를 표시하는 컴포넌트
// Suspense의 fallback으로 사용됩니다
export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      {/* 스피너 애니메이션 */}
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>

      {/* 로딩 텍스트 */}
      <div className="text-lg text-gray-600">데이터를 불러오는 중...</div>

      {/* 추가적인 로딩 인디케이터 */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        <div
          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
    </div>
  );
}
