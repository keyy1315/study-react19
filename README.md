# React 19 학습 프로젝트 - 카드 관리 시스템

이 프로젝트는 **React 19의 새로운 기능들**을 학습하고 실습하기 위한 카드 관리 시스템입니다. React 19의 혁신적인 훅들과 Server Actions를 활용하여 현대적인 웹 애플리케이션을 구현했습니다.

## 🚀 주요 기능

- **카드 CRUD 기능**: 생성, 조회, 수정, 삭제
- **실시간 검색**: 클라이언트 사이드 필터링
- **페이지네이션**: 대용량 데이터 효율적 표시
- **낙관적 업데이트**: 즉시 UI 반영으로 사용자 경험 향상
- **에러 처리**: ErrorBoundary를 통한 안정적인 에러 관리
- **로딩 상태**: Suspense를 활용한 자동 로딩 처리

## 🛠️ 사용된 기술 스택

### 핵심 프레임워크

- **Next.js 15.5.6** - React 풀스택 프레임워크
- **React 19.1.0** - 최신 React 버전
- **TypeScript 5** - 타입 안전성 보장

### 스타일링

- **TailwindCSS 4** - 유틸리티 퍼스트 CSS 프레임워크
- **Shadcn/ui** - 재사용 가능한 UI 컴포넌트
- **Lucide React** - 아이콘 라이브러리

### React 19 새로운 훅들

- **`useActionState`** - 서버 액션 상태 관리
- **`useTransition`** - 비동기 작업 로딩 상태 관리
- **`useOptimistic`** - 낙관적 업데이트 구현
- **`use()`** - Promise 기반 데이터 페칭

## 📚 React 19 핵심 개념 학습

### 1. Server Actions (`"use server"`)

```typescript
// src/lib/actions.ts
"use server";

export async function createCardAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // 서버에서 실행되는 액션
  // 클라이언트에서 호출되더라도 서버에서 실행됨
}

// src/types/action.ts
export interface ActionState {
  success: boolean;
  message: string;
  error?: string;
  card?: CardData;
}

export const initialActionState: ActionState = {
  success: false,
  message: "",
};
```

**장점:**

- API 라우트 없이도 서버 로직 실행
- 자동 타입 안전성
- 보안성 향상 (서버에서만 실행)

**중요한 규칙:**

- `"use server"` 파일에서는 **async 함수만** export 가능
- 타입과 상수는 별도 파일(`types/action.ts`)로 분리 필요
- 모든 export는 서버에서 실행되는 함수여야 함

### 2. useActionState 훅

```typescript
const [createState, createAction] = useActionState(
  createCardAction, // 서버 액션 함수
  initialActionState // 초기 상태
);
```

**특징:**

- 서버 액션의 결과를 자동으로 상태로 관리
- 성공/실패 메시지 자동 처리
- 컴포넌트 리렌더링 자동 트리거
- **권장**: 폼 기반 액션에 적합 (생성, 수정)

**prevState 활용법:**

```typescript
// 서버 액션 함수 정의
export async function createCardAction(
  prevState: ActionState, // 이전 액션 상태
  formData: FormData
): Promise<ActionState> {
  // 1. 이전 에러 메시지 확인
  if (prevState.message) {
    console.log("이전 상태:", prevState.message);
  }

  // 2. 연속 액션 방지
  if (prevState.success === false && prevState.error === "server_error") {
    return {
      success: false,
      message: "이전 작업이 실패했습니다. 잠시 후 다시 시도해주세요.",
      error: "rate_limit",
    };
  }

  // 3. 액션 실행...
}

// 클라이언트에서 호출
const [createState, createAction] = useActionState(
  createCardAction,
  initialActionState
);

// 호출 시 useActionState가 자동으로 prevState를 전달
createAction(formData); // 실제로는 createAction(prevState, formData)로 호출됨
```

### 3. 혼합 방식 (권장)

**생성**: `useActionState` + `useOptimistic`

```typescript
// 폼 기반 액션에 적합
const [createState, createAction] = useActionState(
  createCardAction,
  initialActionState
);

const handleCreateCard = (formData: FormData) => {
  startTransition(() => {
    optimisticUpdate({ type: "create", data: optimisticCard });
    createAction(formData); // FormData 전달
  });
};
```

**삭제**: 일반 async 함수 + `useOptimistic`

```typescript
// 단순한 액션에 적합
const handleDeleteCard = async (cardId: string) => {
  startTransition(async () => {
    optimisticUpdate({ type: "delete", data: cardId });

    const success = await deleteCard(cardId); // 직접 string 전달
    if (!success) {
      // useOptimistic이 자동으로 롤백
    }
  });
};
```

**장점:**

- 각 액션의 특성에 맞는 적절한 패턴 사용
- FormData를 억지로 만들 필요 없음
- 더 간단하고 자연스러운 코드

### 4. useTransition 훅

```typescript
const [isPending, startTransition] = useTransition();

const handleCreateCard = (formData: FormData) => {
  startTransition(() => {
    createAction(formData);
  });
};
```

**장점:**

- 비동기 작업의 로딩 상태 자동 관리
- 사용자 인터랙션 차단 없음
- 우선순위 기반 업데이트

### 4. useOptimistic 훅 (낙관적 업데이트)

```typescript
// 단일 useOptimistic으로 모든 CRUD 작업 처리
const [optimisticCards, optimisticUpdate] = useOptimistic(
  cards, // 기본 상태
  (
    state,
    action: { type: "create" | "update" | "delete"; data: CardData | string }
  ) => {
    switch (action.type) {
      case "create":
        return [...state, action.data as CardData];
      case "update":
        return state.map((card) =>
          card.id === (action.data as CardData).id
            ? (action.data as CardData)
            : card
        );
      case "delete":
        return state.filter((card) => card.id !== action.data);
      default:
        return state;
    }
  }
);

// 카드 생성 핸들러에서 사용
const handleCreateCard = (formData: FormData) => {
  // 1. 임시 카드 생성
  const optimisticCard: CardData = {
    id: `temp-${Date.now()}`,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    color: (formData.get("color") as string) || "#000000",
  };

  // 2. startTransition 내에서 낙관적 업데이트와 서버 액션 실행
  startTransition(() => {
    // 즉시 UI에 추가 (낙관적 업데이트)
    optimisticUpdate({ type: "create", data: optimisticCard });

    // 서버 액션 실행
    createAction(formData);
  });
};
```

**특징:**

- 서버 응답을 기다리지 않고 즉시 UI 업데이트
- 실패 시 자동으로 이전 상태로 롤백
- 사용자 경험 대폭 향상
- **중요**: 모든 CRUD 작업에서 낙관적 업데이트 적용 필요
- **개선**: 단일 `useOptimistic`으로 중첩 문제 해결

**롤백 작동 방식:**

```typescript
// 서버 액션 실패 시 자동 롤백
useEffect(() => {
  if (createState.success === false && createState.message) {
    // 실패 시 임시 카드만 제거 (useOptimistic이 자동으로 롤백)
    setCards((prev) => prev.filter((card) => !card.id.startsWith("temp-")));
  }
}, [createState]);
```

### 5. use() 훅 (Promise 처리)

```typescript
// ❌ 잘못된 사용법 - Client Component에서 Server Action 호출
"use client";
const allCards = use(fetchCardsAction()); // 에러 발생!

// ✅ 올바른 사용법 - Server Component에서 데이터 페칭
export default async function Main() {
  const allCards = await fetchCardsAction(); // 서버에서 실행
  return <MainClient initialCards={allCards} />;
}
```

**장점:**

- Promise를 직접 컴포넌트에서 처리
- Suspense와 자동 연동
- ErrorBoundary와 자동 연동

**중요한 규칙:**

- `use()` 훅은 **Server Component**에서만 사용 가능
- Client Component에서는 `useEffect`와 `useState` 사용
- Server Action은 서버에서만 실행되어야 함

## 🏗️ 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/cards/         # API 라우트 (CRUD 엔드포인트)
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 페이지
├── components/            # React 컴포넌트
│   ├── CardManager.tsx    # 카드 관리 메인 컴포넌트
│   ├── Main.tsx           # 메인 Server Component (데이터 페칭)
│   ├── MainClient.tsx     # 메인 Client Component (상태 관리)
│   ├── cards/             # 카드 관련 컴포넌트
│   ├── common/            # 공통 컴포넌트
│   └── ui/                # Shadcn/ui 컴포넌트
├── lib/                   # 유틸리티 및 액션
│   ├── actions.ts         # Server Actions
│   └── utils.ts          # 유틸리티 함수
└── types/                # TypeScript 타입 정의
    ├── card.ts           # 카드 데이터 타입
    └── action.ts         # 액션 상태 타입 및 상수
```

## 🚀 시작하기

### 1. 의존성 설치

```bash
pnpm install
# 또는
npm install
# 또는
yarn install
```

### 2. 개발 서버 실행

```bash
pnpm dev
# 또는
npm run dev
# 또는
yarn dev
```

## 🎯 학습 포인트

### 주니어 개발자를 위한 핵심 개념

1. **Server Actions 이해**

   - `"use server"` 지시어의 역할
   - 클라이언트-서버 간 데이터 흐름
   - FormData를 통한 데이터 전송
   - **중요**: `"use server"` 파일에서는 async 함수만 export 가능

2. **React 19 훅들의 활용**

   - 각 훅의 목적과 사용법
   - 훅들 간의 조합과 시너지
   - 상태 관리 패턴

3. **낙관적 업데이트 패턴**

   - 사용자 경험 향상 방법
   - 에러 처리와 롤백 전략
   - 네트워크 지연 해결

4. **현대적인 React 패턴**

   - Suspense와 ErrorBoundary 활용
   - 컴포넌트 분리와 재사용성
   - 타입 안전성 확보

5. **Server/Client Component 분리**
   - Server Component: 데이터 페칭과 초기 렌더링
   - Client Component: 상태 관리와 사용자 인터랙션
   - **중요**: `use()` 훅은 Server Component에서만 사용 가능

## 🔧 주요 컴포넌트 설명

### CardManager.tsx

- React 19의 모든 새로운 훅들을 활용한 메인 컴포넌트
- CRUD 기능과 낙관적 업데이트 구현
- 폼 기반 데이터 제출 처리

### Main.tsx (Server Component)

- 서버에서 데이터 페칭 (`await fetchCardsAction()`)
- 초기 데이터를 클라이언트 컴포넌트에 전달
- Suspense와 ErrorBoundary로 감싸서 안전한 데이터 로딩

### MainClient.tsx (Client Component)

- 클라이언트 사이드 상태 관리 (검색, 페이지네이션, 모드 전환)
- 서버에서 받은 초기 데이터를 기반으로 UI 렌더링
- 사용자 인터랙션 처리

### actions.ts

- Server Actions 구현 (async 함수만 export)
- 각 액션별 상태 관리
- 에러 처리 및 유효성 검사

### types/action.ts

- ActionState 인터페이스 정의
- initialActionState 상수 정의
- Server Actions와 분리된 타입 관리

## 📖 추가 학습 자료

- [React 19 공식 문서](https://react.dev/blog/2024/04/25/react-19)
- [Next.js Server Actions 가이드](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [TailwindCSS 문서](https://tailwindcss.com/docs)
- [Shadcn/ui 컴포넌트](https://ui.shadcn.com/)

## ⚠️ 주의사항 및 문제 해결

### 자주 발생하는 문제들

1. **Server Actions 무한 호출 에러**

   ```
   Error: Server Functions cannot be called during initial render
   ```

   **해결법**: `use()` 훅을 Server Component에서만 사용하고, Client Component에서는 props로 데이터를 받아 사용

2. **"use server" 파일에서 객체 export 에러**

   ```
   Error: A "use server" file can only export async functions
   ```

   **해결법**: 타입과 상수를 별도 파일(`types/action.ts`)로 분리

3. **낙관적 업데이트가 작동하지 않는 경우**
   **해결법**:

   - `useOptimistic`의 첫 번째 인자가 올바른 상태인지 확인
   - 핸들러 함수에서 낙관적 업데이트 함수를 호출하는지 확인
   - 임시 데이터를 올바르게 생성하는지 확인

4. **낙관적 업데이트 transition 에러**

   ```
   Error: An optimistic state update occurred outside a transition or action
   ```

   **해결법**: 모든 낙관적 업데이트를 `startTransition` 내에서 실행

   ```typescript
   // ❌ 잘못된 방법
   addOptimisticCard(card);
   startTransition(() => createAction(formData));

   // ✅ 올바른 방법
   startTransition(() => {
     addOptimisticCard(card);
     createAction(formData);
   });
   ```

## 🔧 React Compiler 최적화 분석

이 프로젝트는 **React Compiler**를 활용하여 `useMemo`나 `useCallback` 없이도 자동으로 최적화되는 부분들을 보여줍니다.

### 📍 자동 최적화 대상들

#### 1. **MainClient.tsx - 검색 필터링 (37-40라인)**

```typescript
// 🚀 React Compiler가 자동으로 메모이제이션할 부분
const filteredCards = initialCards.filter(
  (card) =>
    card.title.toLowerCase().includes(search.toLowerCase()) ||
    card.description.toLowerCase().includes(search.toLowerCase())
);
```

**최적화 효과**: `initialCards`와 `search`가 변경될 때만 재계산

#### 2. **MainClient.tsx - 페이지네이션 계산 (61-64라인)**

```typescript
// 🚀 React Compiler가 자동으로 메모이제이션할 부분
const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const currentCards = filteredCards.slice(startIndex, endIndex);
```

**최적화 효과**: `filteredCards`, `currentPage`, `itemsPerPage`가 변경될 때만 재계산

#### 3. **CardManager.tsx - displayCards 생성 (131-134라인)**

```typescript
// 🚀 React Compiler가 자동으로 메모이제이션할 부분
const displayCards = optimisticCards.map((card) => ({
  ...card,
  isPending: pendingOperations.has(card.id) || card.id.startsWith("temp-"),
}));
```

**최적화 효과**: `optimisticCards`와 `pendingOperations`가 변경될 때만 재계산

#### 4. **CardManager.tsx - 임시 카드 생성 (160-165라인)**

```typescript
// 🚀 React Compiler가 자동으로 메모이제이션할 부분
const optimisticCard: CardData = {
  id: `temp-${Date.now()}`,
  title: title || "",
  description: description || "",
  color: color || "#000000",
};
```

**최적화 효과**: `title`, `description`, `color`가 변경될 때만 재생성

#### 5. **CardManager.tsx - 핸들러 함수들**

```typescript
// 🚀 React Compiler가 자동으로 메모이제이션할 부분
const handleCreateCard = (formData: FormData) => { ... };
const handleDeleteCard = async (cardId: string) => { ... };
```

**최적화 효과**: 의존성이 변경되지 않으면 함수 재생성 방지

### 🎯 React Compiler의 장점

#### ✅ **자동 최적화**

- 개발자가 `useMemo`/`useCallback`을 수동으로 추가할 필요 없음
- 컴파일 타임에 자동으로 최적화 코드 생성
- 코드 가독성 향상

#### ✅ **성능 향상**

- 불필요한 재계산 방지
- 불필요한 함수 재생성 방지
- 메모리 사용량 최적화

#### ✅ **개발 경험**

- 최적화에 대한 고민 없이 자연스러운 코드 작성
- 버그 가능성 감소 (의존성 배열 실수 등)

## 📊 Mock 데이터 활용

프로젝트는 `public/mock.json` 파일에서 50개의 카드 데이터를 제공합니다.

### Mock 데이터 특징

- **CardData 타입 완벽 매칭**: 모든 필드가 타입 인터페이스와 일치
- **다양한 주제**: React 19, TypeScript, Next.js 15 등 최신 기술 스택
- **시각적 요소**: 각 카드마다 고유한 색상과 아이콘 URL
- **실제 기술 스택**: 브랜드 색상을 반영한 현실적인 데이터

### Mock 데이터 사용 방식

```typescript
// src/lib/actions.ts
export async function fetchCards(): Promise<CardData[]> {
  try {
    // mock.json 파일에서 데이터 로드
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/mock.json`,
      {
        method: "GET",
        cache: "no-store", // 항상 최신 데이터 가져오기
      }
    );

    if (!response.ok) {
      throw new Error("카드 목록 조회에 실패했습니다.");
    }

    const cards = await response.json();
    return cards;
  } catch (error) {
    console.error("Fetch cards action error:", error);
    throw error;
  }
}
```

## 🔧 환경 설정

### .env.local 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하여 환경 변수를 설정하세요:

```bash
# .env.local
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

이 설정으로 API 호출 시 올바른 기본 URL이 사용됩니다.

## 🤝 기여하기

이 프로젝트는 React 19 학습을 위한 예제 프로젝트입니다. 개선 사항이나 버그 리포트는 언제든 환영합니다!

---

**Happy Coding! 🎉**
