### useActionState - 폼 액션의 결과를 기반으로 State를 업데이트 할 수 있도록 제공

const [state, formAction, isPending] = useActionState(fn, initialState, permalink?);
- fn: 폼이 제출되거나 버튼을 눌렀을 때 호출되는 함수, 함수 호출 시 첫 번째 인수로 폼의 이전 State 전달
- initialState: State가 처음에 가지기를 원하는 값
- optional permalink: 이 폼이 수정하는 고유한 페이지 URL을 포함하는 문자열
    - 만약 fn이 서버 함수고 폼이 js 번들이 로드되기 전에 제출되면 브라우저는 현재 페이지의 URL 대신 지정된 영구 링크 URL로 이동함


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
- CardManager.tsx - 73 ~ 143

컴포넌트의 최상위 레벨에서 useActionState를 호출하면 폼이 마지막으로 제출되었을 때 액션이 반환한 값에 접근할 수 있음
서버 함수에서 반환된 오류 메세지를 해당 액션으로 감싸서 표시할 수 있음 CardCreateForm.tsx - 111

### useTransition - UI의 일부를 백그라운드에서 렌더링 할 수 있도록 해주는 hook

const [isPending, startTransition] = useTransition()

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

### useOptimistic - UI를 낙관적으로 업데이트할 수 있게 해주는 hook

  const [optimisticState, addOptimistic] = useOptimistic(state, updateFn);

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
