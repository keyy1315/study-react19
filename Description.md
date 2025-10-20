## useActionState - 폼 액션의 결과를 기반으로 State를 업데이트 할 수 있도록 제공

**const [state, formAction, isPending] = useActionState(fn, initialState, permalink?);**

- fn: 폼이 제출되거나 버튼을 눌렀을 때 호출되는 함수, 함수 호출 시 첫 번째 인수로 폼의 이전 State 전달
- initialState: State가 처음에 가지기를 원하는 값
- optional permalink: 이 폼이 수정하는 고유한 페이지 URL을 포함하는 문자열
  - 만약 fn이 서버 함수고 폼이 js 번들이 로드되기 전에 제출되면 브라우저는 현재 페이지의 URL 대신 지정된 영구 링크 URL로 이동함

---

- 폼 액션이 실행될 때 업데이트되는 컴포넌트 State
- 기존의 폼 액션 함수와 초기 State를 전달받고, 폼에서 사용할 새로운 액션을 반환함
- 최신 form State와 액션이 대기 중인지 여부도 반환환

```typescript
async function increment(previousState, formData) {
  return previousState + 1;
}

function StatefulForm({}) {
  const [state, formAction] = useActionState(increment, 0);
  return (
    <form>
      {state}
      <button formAction={formAction}>Increment</button>
    </form>
  );
}
```
- useActionState는 서버 액션의 결과를 기다리고 저장하는 역할
- Server Action의 실행 결과를 상태로 관리 - 폼 뿐만 아니라 모든 액션에 사용 가능
- CardManager.tsx - 73 ~ 143

컴포넌트의 최상위 레벨에서 useActionState를 호출하면 폼이 마지막으로 제출되었을 때 액션이 반환한 값에 접근할 수 있음
서버 함수에서 반환된 오류 메세지를 해당 액션으로 감싸서 표시할 수 있음 CardCreateForm.tsx - 111

## useTransition - UI의 일부를 백그라운드에서 렌더링 할 수 있도록 해주는 hook

**const [isPending, startTransition] = useTransition()**

- useTransition을 호출하여 일부 state 업데이트를 Transition으로 표시      

```typescript
function TabContainer() {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState("about");

  function selectTab(nextTab) {
    startTransition(() => {
      setTab(nextTab);
    });
  }
  // ...
}
```

- isPending : 대기 중인 Transition이 있는지 알려줌
- startTransition 함수 : 상태 업데이트를 Transition으로 표시할 수 있게 해줌

### useActionState의 isPending, useTransition의 isPending
- useActionState
    - 특정 액션에 대한 상태 : createCardAction 같은 특정 서버 액션의 실행 상태만 추적
    - 서버 액션 실행 중 자동으로 true, 완료되면 false
- useTransition
    - 전체 컴포넌트의 상태 : 해당 컴포넌트에서 실행되는 모든 startTransition 내의 작업 상태를 추적함
    - startTransition으로 감싼 작업들의 상태를 추적적

## useOptimistic - UI를 낙관적으로 업데이트할 수 있게 해주는 hook

**const [optimisticState, addOptimistic] = useOptimistic(state, updateFn);**

```typescript
function AppContainer() {
  const [optimisticState, addOptimistic] = useOptimistic(
    state,
    // updateFn
    (currentState, optimisticValue) => {
      // merge and return new state
      // with optimistic value
    }
  );
}
```

- state : 작업이 대기 중이지 않을 때 초기에 반환될 값
- udpateFn(currentState, optimisticValue) : 현재 상태와 addOptimistic에 전달된 낙관적인 앖을 취하는 함수, 낙관적인 상태를 반환함
- optimisticState : 결과적인 낙관적인 상태, 작업이 대기 중이지 않을 때는 state와 동일하고 그렇지 않을 경우는 updateFn에서 반환된 값과 동일

---

- 비동기 작업이 진행 중일 때 다른 상태를 보여줄 수 있게 해줌
- 인자로 주어진 일부 상태를 받고 네트워크 요청과 같은 비동기 작업 기간 동안 달라질 수 있는 그 상태의 복사본을 반환

## use - Promise나 Context와 같은 데이터 참조 API

- if와 같은 조건문/반복문 내부에서 호출 가능
- Promise와 같이 호출될 때 use는 _Suspense_ 및 *Error Boundary*와 통합됨
- use에 전달 된 Promise가 pending 중일 때 use를 호출하는 컴포넌트는 _Suspend_ 된다 => Suspense 로 감싸져 있으면 Fallback이 표시됨 / reject 될 경우 Error Boundary의 Fallback이 표시됨

**context 전달**

```typescript
const ThemeContext = createContext(null);

export default function MyApp() {
  return (
    <ThemeContext value="dark">
      <Form />
    </ThemeContext>
  );
}

function Form() {
  return (
    <Panel title="Welcome">
      <Button show={true}>Sign up</Button>
      <Button show={false}>Log in</Button>
    </Panel>
  );
}

function Panel({ title, children }) {
  const theme = use(ThemeContext);
  const className = "panel-" + theme;
  return (
    <section className={className}>
      <h1>{title}</h1>
      {children}
    </section>
  );
}

function Button({ show, children }) {
  if (show) {
    const theme = use(ThemeContext);
    const className = "button-" + theme;
    return <button className={className}>{children}</button>;
  }
  return false;
}
```

- provider와 button 사이의 컴포넌트는 상관하지 않음
- Form 내부의 어느 곳이든 Button이 use(ThemeContext) 를 호출하면 "dark" 값을 받음

**서버에서 클라이언트로 데이터 스트리밍**

```typescript
import { fetchMessage } from "./lib.js";
import { Message } from "./message.js";

export default function App() {
  const messagePromise = fetchMessage();
  return (
    <Suspense fallback={<p>waiting for message...</p>}>
      <Message messagePromise={messagePromise} />
    </Suspense>
  );
}
```

- _서버 컴포넌트_ 에서 _클라이언트 컴포넌트_ 로 Promise Props를 전달하여 데이터를 스트리밍 할 수 있음
- 클라이언트 컴포넌트는 props로 받은 promise를 use API에 전달
- Suspense로 감싸져 있을 경우 Promise가 resolve 될 때까지 Fallback이 표시된다
