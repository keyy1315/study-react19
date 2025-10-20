"use client";

import { Component, ReactNode } from "react";

// 에러 바운더리의 Props 타입 정의
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// 에러 바운더리의 State 타입 정의
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// React Error Boundary 클래스 컴포넌트
// use() 훅에서 발생하는 에러를 캐치하여 사용자에게 친화적인 에러 UI를 제공합니다
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  // 에러가 발생했을 때 state를 업데이트하는 정적 메서드
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  // 에러가 발생했을 때 실행되는 생명주기 메서드
  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    // 에러가 발생했다면 에러 UI를 렌더링
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            {/* 에러 아이콘 */}
            <div className="text-6xl text-red-500">⚠️</div>

            {/* 에러 메시지 */}
            <div className="text-xl font-semibold text-gray-800">
              오류가 발생했습니다
            </div>

            <div className="text-gray-600 text-center max-w-md">
              데이터를 불러오는 중 문제가 발생했습니다. 페이지를 새로고침하거나
              잠시 후 다시 시도해주세요.
            </div>

            {/* 새로고침 버튼 */}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              페이지 새로고침
            </button>
          </div>
        )
      );
    }

    // 에러가 없다면 자식 컴포넌트들을 정상적으로 렌더링
    return this.props.children;
  }
}
