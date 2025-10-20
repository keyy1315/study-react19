import { Suspense } from "react";
import MainClient from "./MainClient";
import { fetchCards } from "@/lib/actions";
import LoadingSpinner from "./common/LoadingSpinner";

/**
 * Main Server Component
 * 
 * 서버에서 데이터를 가져와서 클라이언트 컴포넌트에 전달합니다.
 * 이렇게 하면 초기 렌더링 시 fetch waterfall을 방지할 수 있습니다.
 */
export default async function Main() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MainClient cardPromise={fetchCards()} />
    </Suspense>
  );
}