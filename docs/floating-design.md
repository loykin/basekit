# @loykin/floating + @loykin/layer 설계 매뉴얼

## 배경 및 목표

### 왜 만드는가

기존 headless 라이브러리(Radix UI, Base UI 등)의 Dropdown/Popover는 Portal을 지원하지만, **open 상태가 컴포넌트 내부 `useState`에 묶여 있다.** 트리거 컴포넌트가 unmount되면 상태가 리셋되어 닫힌다.

대시보드/모니터링 툴 맥락에서 이게 문제가 되는 경우:

- 가상화 테이블 (react-virtual 등) — row가 스크롤 off되면 unmount
- 데이터 refresh로 row key가 바뀌면 re-mount
- 부모 상태 변경으로 트리거 컴포넌트가 unmount/remount

### 해결 원칙

`@loykin/side-panel`과 동일한 패턴:

```
외부 Zustand Store  ←  명령형 API (open/close)
        ↓
   Portal 렌더링   ←  컴포넌트 트리와 무관한 DOM 위치
```

트리거 컴포넌트가 unmount돼도 Store는 살아있음 → floating 콘텐츠 유지.

---

## 패키지 구성

### 왜 두 개인가

`@loykin/floating`만 있어도 동작한다. `@loykin/layer`는 `@loykin/side-panel`과 **동시에 사용할 때** Escape 키 충돌, z-index 충돌을 해결하기 위한 얇은 공유 레이어다. 두 패키지 모두 쓰지 않는다면 필요 없다.

```
packages/
├── layer/      ←  @loykin/layer   (얇은 공유 레이어, optional)
└── floating/   ←  @loykin/floating
```

---

## @loykin/layer

### 역할

- z-index 토큰 상수 정의
- Escape 키 핸들러를 **스택 방식**으로 관리 (가장 나중에 열린 레이어만 Escape에 반응)
- `@loykin/side-panel`, `@loykin/floating` 둘 다 옵션으로 참여 가능

### 의존성

```json
{
  "dependencies": { "zustand": "^5" },
  "peerDependencies": { "react": "^18 || ^19", "react-dom": "^18 || ^19" }
}
```

### Public API

```ts
// Provider — 앱 루트에 한 번
export { LayerProvider }

// z-index 토큰 — 소비자가 직접 사용 가능
export const LAYER_Z = {
  panel:    50,  // side-panel
  floating: 60,  // dropdown, tooltip, popover
  modal:    70,  // 향후 modal
} as const

// 타입
export type { LayerZ }
```

내부 훅(`useLayerStack`)은 export하지 않는다. 다른 패키지에서 쓸 때는 context를 통해 접근.

### 내부 구현

```ts
// layerStack.ts — Zustand vanilla store
interface LayerEntry {
  id: string
  onEscape: () => void
}

interface LayerStackState {
  stack: LayerEntry[]
  push: (id: string, onEscape: () => void) => void
  pop:  (id: string) => void
}

// LayerProvider.tsx
// — context로 push/pop 제공
// — window keydown 'Escape' 한 번만 등록
// — capture:true 로 다른 핸들러보다 먼저 실행
// — stack[-1].onEscape() 호출 후 e.stopPropagation()
```

`LayerProvider`가 없으면 `push/pop`은 no-op으로 처리 → 두 패키지 모두 `@loykin/layer` 없이도 독립적으로 동작.

---

## @loykin/floating

### 의존성

```json
{
  "dependencies": {
    "@floating-ui/react": "^0.27",
    "zustand": "^5"
  },
  "peerDependencies": {
    "react": "^18 || ^19",
    "react-dom": "^18 || ^19",
    "@loykin/layer": "^0.0.1"  ← optional peer
  }
}
```

### 핵심 설계 결정

**ID 기반 단일 열림(one-at-a-time)**

드롭다운은 일반적으로 하나만 열린다. Store가 `openId: string | null`을 들고 있고, 새 ID로 open하면 이전 것이 자동으로 닫힌다.

```ts
// 이 설계의 장점:
// - row unmount/remount와 무관 (ID는 외부에서 관리)
// - "어떤 row의 dropdown이 열려있나"를 Store만 보면 알 수 있음
// - 새 dropdown 열면 이전 것 자동 닫힘
```

여러 개 동시에 필요한 경우(tooltip 등)는 이 패키지 스코프 밖 — 별도 고려.

### Public API

```ts
// Components
export { FloatingProvider }   // Store + Portal 렌더러. 레이아웃 루트에.

// Hooks
export { useFloating }        // 명령형 API

// Types
export type {
  FloatingOptions,
  FloatingPlacement,
  UseFloatingReturn,
}
```

### FloatingProvider

```tsx
// 레이아웃 혹은 페이지 루트에 한 번
<FloatingProvider>
  <DataTable />
</FloatingProvider>
```

내부적으로:
1. `FloatingStoreContext` 생성 (인스턴스 분리, 여러 Provider 가능)
2. `FloatingPortal` 렌더 — Store 구독하여 content가 있으면 `createPortal(content, document.body)`
3. `@loykin/layer`가 있으면 Escape 스택에 참여

### useFloating

```ts
const { open, close, isOpen } = useFloating(id: string)
```

| | 타입 | 설명 |
|---|---|---|
| `id` | `string` | row ID, 패널 ID 등 고유 식별자 |
| `open` | `(content: ReactNode, options: FloatingOptions) => void` | |
| `close` | `() => void` | |
| `isOpen` | `boolean` | reactive |

### FloatingOptions

```ts
interface FloatingOptions {
  // @floating-ui 포지셔닝
  placement?:  Placement   // 'bottom-start' | 'top-end' | ... (기본: 'bottom-start')
  strategy?:   Strategy    // 'absolute' | 'fixed' (기본: 'absolute')
  offset?:     number      // px (기본: 4)
  flip?:       boolean     // 뷰포트 넘칠 때 반대 방향 (기본: true)
  shift?:      boolean     // 뷰포트 안으로 밀어넣기 (기본: true)

  // 트리거 앵커
  reference?:  Element | VirtualElement  // 없으면 open() 호출 시점의 마우스 위치

  // 동작
  closeOnOutsideClick?: boolean  // 기본: true
  closeOnEsc?:          boolean  // 기본: true (@loykin/layer 없을 때 자체 핸들러)

  // 콜백
  onClose?: () => void
}
```

`VirtualElement`는 `@floating-ui`의 타입 — `getBoundingClientRect()`만 있으면 됨. 컨텍스트 메뉴(마우스 위치 기준)에 사용.

---

## 사용 예시 (소비자 프로젝트)

### 1. 가상화 테이블 row action

```tsx
import { FloatingProvider, useFloating } from '@loykin/floating'

// 레이아웃
function DashboardLayout({ children }) {
  return (
    <FloatingProvider>
      {children}
    </FloatingProvider>
  )
}

// 테이블 row — re-render/unmount 무관
function ActionCell({ rowId, row }) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { open, close, isOpen } = useFloating(rowId)

  return (
    <button
      ref={triggerRef}
      aria-expanded={isOpen}
      onClick={() =>
        open(
          <ActionMenu row={row} onClose={close} />,
          { placement: 'bottom-end', reference: triggerRef.current }
        )
      }
    >
      ⋮
    </button>
    // ActionMenu는 createPortal → document.body 에 렌더됨
    // row가 가상화로 unmount/remount돼도 isOpen 상태 유지
  )
}
```

### 2. 컨텍스트 메뉴 (마우스 위치 기준)

```tsx
function ChartPanel({ panelId }) {
  const { open, close } = useFloating(`ctx-${panelId}`)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    open(
      <ChartContextMenu onClose={close} />,
      {
        placement: 'right-start',
        reference: {
          getBoundingClientRect: () =>
            DOMRect.fromRect({ x: e.clientX, y: e.clientY, width: 0, height: 0 }),
        },
        closeOnOutsideClick: true,
      }
    )
  }

  return <div onContextMenu={handleContextMenu}>...</div>
}
```

### 3. side-panel + floating 동시 사용 (with @loykin/layer)

```tsx
import { LayerProvider } from '@loykin/layer'
import { SidePanelProvider } from '@loykin/side-panel'
import { FloatingProvider } from '@loykin/floating'

function App() {
  return (
    <LayerProvider>               {/* Escape 스택 관리 */}
      <SidePanelProvider>         {/* Escape 스택에 참여 */}
        <FloatingProvider>        {/* Escape 스택에 참여 */}
          <Dashboard />
        </FloatingProvider>
      </SidePanelProvider>
    </LayerProvider>
  )
}

// Panel과 Dropdown이 동시에 열려 있을 때:
// Esc → Floating만 닫힘 (나중에 열렸으니까)
// Esc 한 번 더 → Panel 닫힘
// z-index: Panel(50) < Floating(60) → Floating이 Panel 위에 뜸
```

---

## @loykin/side-panel 통합 (기존 패키지 수정)

`@loykin/layer`를 optional peer dep으로 추가. `LayerProvider`가 없으면 기존과 동일하게 동작.

```ts
// SidePanelProvider.tsx 내부
const layerCtx = useLayerContext() // LayerProvider 없으면 null

useEffect(() => {
  if (!isOpen || !layerCtx) return
  layerCtx.push('side-panel', () => close())
  return () => layerCtx.pop('side-panel')
}, [isOpen])
```

breaking change 없음.

---

## 내부 구현 구조

### floatingStore.ts

```ts
interface FloatingState {
  openId:      string | null
  content:     ReactNode
  options:     FloatingOptions
  referenceEl: Element | VirtualElement | null

  // actions
  _open:  (id: string, content: ReactNode, options: FloatingOptions) => void
  _close: () => void
}

// SidePanelStore와 동일하게 createStore factory 사용
// → FloatingProvider마다 독립 인스턴스
export const createFloatingStore = () => createStore<FloatingState>(...)
```

### FloatingPortal.tsx

```tsx
// FloatingProvider 내부에서 항상 마운트됨 (content 없으면 null 반환)
function FloatingPortal() {
  const { openId, content, options, referenceEl } = useFloatingStore()
  const [floatingEl, setFloatingEl] = useState<HTMLElement | null>(null)

  const { floatingStyles } = useFloatingUI({
    elements: { reference: referenceEl, floating: floatingEl },
    placement: options.placement ?? 'bottom-start',
    middleware: [
      offset(options.offset ?? 4),
      options.flip !== false && flip(),
      options.shift !== false && shift(),
    ].filter(Boolean),
    strategy: options.strategy ?? 'absolute',
  })

  // outside click 감지 — floatingEl 바깥 클릭 시 close
  useEffect(() => {
    if (!openId || !options.closeOnOutsideClick) return
    const handler = (e: MouseEvent) => {
      if (floatingEl && !floatingEl.contains(e.target as Node)) {
        store.getState()._close()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openId, floatingEl])

  if (!openId) return null

  return createPortal(
    <div ref={setFloatingEl} style={{ ...floatingStyles, zIndex: LAYER_Z.floating }}>
      {content}
    </div>,
    document.body
  )
}
```

---

## 빌드 설정

기존 패키지와 동일한 tsup 구성.

```ts
// packages/layer/tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  external: ['react', 'react-dom', 'zustand'],
})

// packages/floating/tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  external: ['react', 'react-dom', 'zustand', '@floating-ui/react', '@loykin/layer'],
})
```

---

## 구현 순서

### Step 1: `@loykin/layer`

1. `packages/layer/` 디렉토리 생성
2. `package.json`, `tsconfig.json`, `tsup.config.ts` 세팅 (기존 패키지 복사)
3. `layerStack.ts` — Zustand store
4. `LayerProvider.tsx` — context + Escape 핸들러
5. `src/index.ts` — `LayerProvider`, `LAYER_Z` export
6. playground에 간단한 데모

### Step 2: `@loykin/side-panel` layer 통합

1. `@loykin/layer` optional peer dep 추가
2. `SidePanelProvider.tsx`에 `useLayerContext()` 연결
3. 기존 동작 회귀 테스트

### Step 3: `@loykin/floating`

1. `packages/floating/` 디렉토리 생성 및 세팅
2. `floatingStore.ts` — Zustand store (createStore factory)
3. `FloatingContext.tsx` — store context
4. `FloatingPortal.tsx` — `@floating-ui/react` + `createPortal`
5. `FloatingProvider.tsx` — store 생성 + Portal 렌더 + layer 통합
6. `useFloating.ts` — public hook
7. `src/index.ts` — export
8. playground에 테이블 데모

---

## 스코프 외

다음은 이 패키지에서 다루지 않는다:

- **Toast / 알림** — Sonner 사용 권장
- **DnD** — dnd-kit 사용 권장
- **Modal** — 향후 별도 패키지 (`@loykin/modal`) 또는 Radix 사용
- **여러 개 동시에 열리는 Tooltip** — 다른 설계 필요, 별도 고려
