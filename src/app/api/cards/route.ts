import { NextRequest, NextResponse } from "next/server";
import { CardData } from "@/types/card";

// 카드 데이터를 저장할 메모리 저장소 (실제 프로젝트에서는 데이터베이스 사용)
let cards: CardData[] = [];

// 초기 데이터 로드 함수
async function loadInitialCards(): Promise<CardData[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/mock.json`
    );
    if (!response.ok) {
      throw new Error("Failed to load initial cards");
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading initial cards:", error);
    return [];
  }
}

// 카드 생성 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, iconUrl, color } = body;

    // 유효성 검사
    if (!title || !description) {
      return NextResponse.json(
        { error: "제목과 설명은 필수입니다." },
        { status: 400 }
      );
    }

    // 새 카드 생성
    const newCard: CardData = {
      id: Date.now().toString(), // 간단한 ID 생성
      title: title.trim(),
      description: description.trim(),
      iconUrl: iconUrl || undefined,
      color: color || "#000000",
    };

    // 카드 추가
    cards.push(newCard);

    return NextResponse.json({ success: true, card: newCard }, { status: 201 });
  } catch (error) {
    console.error("Error creating card:", error);
    return NextResponse.json(
      { error: "카드 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 카드 삭제 API
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "카드 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 카드 찾기
    const cardIndex = cards.findIndex((card) => card.id === id);
    if (cardIndex === -1) {
      return NextResponse.json(
        { error: "카드를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 카드 삭제
    const deletedCard = cards.splice(cardIndex, 1)[0];

    return NextResponse.json(
      { success: true, card: deletedCard },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting card:", error);
    return NextResponse.json(
      { error: "카드 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 카드 목록 조회 API
export async function GET() {
  try {
    // 초기 데이터가 없으면 로드
    if (cards.length === 0) {
      cards = await loadInitialCards();
    }

    return NextResponse.json({ success: true, cards }, { status: 200 });
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: "카드 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
