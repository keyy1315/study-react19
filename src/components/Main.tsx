"use client";

import { useState } from "react";
import SearchBar from "./common/SearchBar";
import Pagination from "./common/Pagination";
import CardGrid from "./cards/CardGrid";

export default function Main() {
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const onSearch = (query: string) => {
    setSearch(query);
    setCurrentPage(1);
  };

  // 페이지당 아이템 수
  const itemsPerPage = 12;

  // 더 많은 카드 데이터 생성
  const allCards = Array.from({ length: 50 }, (_, index) => ({
    id: `${index + 1}`,
    title: `Integration ${index + 1}`,
    description: `Description for integration ${index + 1}`,
    iconUrl:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWFjY2Vzc2liaWxpdHktaWNvbiBsdWNpZGUtYWNjZXNzaWJpbGl0eSI+PGNpcmNsZSBjeD0iMTYiIGN5PSI0IiByPSIxIi8+PHBhdGggZD0ibTE4IDE5IDEtNy02IDEiLz48cGF0aCBkPSJtNSA4IDMtMyA1LjUgMy0yLjM2IDMuNSIvPjxwYXRoIGQ9Ik00LjI0IDE0LjVhNSA1IDAgMCAwIDYuODggNiIvPjxwYXRoIGQ9Ik0xMy43NiAxNy41YTUgNSAwIDAgMC02Ljg4LTYiLz48L3N2Zz4=",
    color: "#000000",
  }));

  // 검색 필터링
  const filteredCards = allCards.filter(
    (card) =>
      card.title.toLowerCase().includes(search.toLowerCase()) ||
      card.description.toLowerCase().includes(search.toLowerCase())
  );

  // 총 페이지 수 계산
  const totalPages = Math.ceil(filteredCards.length / itemsPerPage);

  // 현재 페이지의 카드들
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCards = filteredCards.slice(startIndex, endIndex);

  return (
    <>
      <div className="p-4 md:p-6 space-y-4">
        <h1 className="text-2xl font-bold">Integrations</h1>
        <SearchBar onSearch={onSearch} />
      </div>
      <div className="flex-1 overflow-auto px-4 md:px-6">
        <CardGrid cards={currentCards} />
      </div>
      <div className="p-4 md:p-6 border-t">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}
