"use client";

import { useState, use } from "react";
import SearchBar from "./common/SearchBar";
import Pagination from "./common/Pagination";
import CardGrid from "./cards/CardGrid";
import CardManager from "./CardManager";
import { CardData } from "@/types/card";

/**
 * MainClient Component
 * 
 * 클라이언트 사이드 상태 관리와 인터랙션을 담당합니다.
 * 서버에서 가져온 초기 데이터를 props로 받아서 사용합니다.
 */
export default function MainClient({ cardPromise }: { cardPromise: Promise<CardData[]> }) {
  const [search, setSearch] = useState<string>("");        // 검색어 상태
  const [currentPage, setCurrentPage] = useState<number>(1); // 현재 페이지 번호
  const [showManager, setShowManager] = useState<boolean>(false); // 카드 관리자 표시 여부

  // 페이지당 표시할 아이템 수
  const itemsPerPage = 12;

  const initialCards = use(cardPromise);

  /**
   * 검색 필터링 (클라이언트 사이드)
   * 
   * 서버에서 가져온 전체 카드 데이터를 클라이언트에서 필터링합니다.
   * 검색어가 제목이나 설명에 포함된 카드만 표시합니다.
   * 
   * 장점:
   * - 즉시 반응하는 검색 (네트워크 요청 없음)
   * - 서버 부하 감소
   * - 사용자 경험 향상
   */
  const filteredCards = initialCards.filter(card =>
    card.title.toLowerCase().includes(search.toLowerCase()) ||
    card.description.toLowerCase().includes(search.toLowerCase())
  );

  /**
   * 검색 기능 핸들러
   * 
   * @param query - 검색어
   * 
   * 검색어가 변경되면:
   * 1. 검색 상태 업데이트
   * 2. 첫 페이지로 이동 (검색 결과의 첫 페이지 표시)
   */
  const handleSearch = (query: string) => {
    setSearch(query);
    setCurrentPage(1);
  };

  /**
   * 페이지네이션 계산
   * 
   * 필터링된 카드 목록을 기반으로 페이지네이션 정보를 계산합니다.
   */
  const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCards = filteredCards.slice(startIndex, endIndex);

  return (
    <>
      {/* 헤더 영역: 제목, 모드 전환 버튼, 검색바 */}
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Integrations</h1>
          
          {/* 카드 관리 모드 전환 버튼 */}
          <button
            onClick={() => setShowManager(!showManager)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {/* 현재 모드에 따라 버튼 텍스트 변경 */}
            {showManager ? "목록 보기" : "카드 관리"}
          </button>
        </div>
        
        {/* 검색바 컴포넌트 */}
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 overflow-auto px-4 md:px-6">
        {showManager ? (
          /* 카드 관리 모드: CRUD 기능이 포함된 CardManager 컴포넌트 */
          <CardManager cards={initialCards} />
        ) : (
          /* 목록 보기 모드: 페이지네이션이 적용된 카드 그리드 */
          <CardGrid cards={currentCards} />
        )}
      </div>

      {/* 페이지네이션 영역 (목록 보기 모드에서만 표시) */}
      {!showManager && (
        <div className="p-4 md:p-6 border-t">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </>
  );
}
