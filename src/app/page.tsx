import { Suspense } from "react";
import Sidebar from "@/components/common/Sidebar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { fetchCards } from "@/lib/actions";
import MainClient from "@/components/MainClient";

/**
 * Main Server Component
 *
 * 서버에서 데이터를 가져와서 클라이언트 컴포넌트에 전달합니다.
 * 이렇게 하면 초기 렌더링 시 fetch waterfall을 방지할 수 있습니다.
 */
export default function Home() {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ErrorBoundary로 에러를 캐치하고, Suspense로 로딩 상태를 처리 */}
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <MainClient cardPromise={fetchCards()} />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
