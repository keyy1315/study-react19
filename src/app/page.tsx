import { Suspense } from "react";
import Main from "@/components/Main";
import Sidebar from "@/components/common/Sidebar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ErrorBoundary로 에러를 캐치하고, Suspense로 로딩 상태를 처리 */}
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <Main />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
