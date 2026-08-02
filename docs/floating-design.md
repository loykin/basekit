# @loykin/floating + @loykin/layer Design Manual

## Background and Goals

### Why build these packages?

Dropdown and Popover components from existing headless libraries such as Radix UI and Base UI support portals, but their **open state is tied to an internal component `useState`.** When the trigger component unmounts, the state resets and the floating content closes.

This becomes a problem in dashboard and monitoring-tool scenarios such as:

- Virtualized tables (for example, react-virtual), where a row unmounts when it scrolls out of view
- Data refreshes that change a row key and remount the row
- Parent state changes that unmount and remount the trigger component

### Design principle

Follow the same pattern as `@loykin/side-panel`:

```
External Zustand Store  ←  Imperative API (open/close)
          ↓
    Portal rendering    ←  DOM location independent of the component tree
```

The store remains alive after the trigger component unmounts, so the floating content stays open.

---

## Package Structure

### Why two packages?

`@loykin/floating` works on its own. `@loykin/layer` is a thin shared layer that resolves Escape-key and z-index conflicts when `@loykin/floating` and `@loykin/side-panel` are **used together**. It is unnecessary if the packages are not used together.

```
packages/
├── layer/      ←  @loykin/layer   (thin shared layer, optional)
└── floating/   ←  @loykin/floating
```

---

## @loykin/layer

### Responsibilities

- Define z-index token constants
- Manage Escape-key handlers as a **stack**, so only the most recently opened layer responds to Escape
- Allow both `@loykin/side-panel` and `@loykin/floating` to participate optionally

### Dependencies

```json
{
  "dependencies": { "zustand": "^5" },
  "peerDependencies": { "react": "^18 || ^19", "react-dom": "^18 || ^19" }
}
```

### Public API

```ts
// Provider — add once at the application root
export { LayerProvider }

// z-index tokens — available for direct consumer use
export const LAYER_Z = {
  panel:    50,  // side-panel
  floating: 60,  // dropdown, tooltip, popover
  modal:    70,  // future modal
} as const

// Types
export type { LayerZ }
```

The internal hook (`useLayerStack`) is not exported. Other packages access it through context.

### Internal Implementation

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
// — expose push/pop through context
// — register the window keydown 'Escape' listener only once
// — use capture:true to run before other handlers
// — call stack[-1].onEscape(), then e.stopPropagation()
```

Without `LayerProvider`, `push/pop` are no-ops, allowing both packages to work independently without `@loykin/layer`.

---

## @loykin/floating

### Dependencies

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

### Key Design Decision

**ID-based, one-at-a-time opening**

Typically, only one dropdown is open at a time. The store holds `openId: string | null`; opening a new ID automatically closes the previous one.

```ts
// Benefits of this design:
// - independent of row unmounts/remounts because IDs are managed externally
// - the store alone shows which row's dropdown is open
// - opening a new dropdown automatically closes the previous one
```

Supporting multiple open elements at once, such as tooltips, is outside the scope of this package and requires a separate design.

### Public API

```ts
// Components
export { FloatingProvider }   // Store + Portal renderer. Add at the layout root.

// Hooks
export { useFloating }        // Imperative API

// Types
export type {
  FloatingOptions,
  FloatingPlacement,
  UseFloatingReturn,
}
```

### FloatingProvider

```tsx
// Add once at the layout or page root
<FloatingProvider>
  <DataTable />
</FloatingProvider>
```

Internally, it:

1. Creates a `FloatingStoreContext`, allowing isolated instances and multiple providers.
2. Renders `FloatingPortal`, which subscribes to the store and calls `createPortal(content, document.body)` when content exists.
3. Participates in the Escape stack when `@loykin/layer` is available.

### useFloating

```ts
const { open, close, isOpen } = useFloating(id: string)
```

| | Type | Description |
|---|---|---|
| `id` | `string` | A unique identifier such as a row ID or panel ID |
| `open` | `(content: ReactNode, options: FloatingOptions) => void` | |
| `close` | `() => void` | |
| `isOpen` | `boolean` | Reactive state |

### FloatingOptions

```ts
interface FloatingOptions {
  // @floating-ui positioning
  placement?:  Placement   // 'bottom-start' | 'top-end' | ... (default: 'bottom-start')
  strategy?:   Strategy    // 'absolute' | 'fixed' (default: 'absolute')
  offset?:     number      // px (default: 4)
  flip?:       boolean     // flip when content overflows the viewport (default: true)
  shift?:      boolean     // shift content inside the viewport (default: true)

  // Trigger anchor
  reference?:  Element | VirtualElement  // mouse position at open() time when omitted

  // Behavior
  closeOnOutsideClick?: boolean  // default: true
  closeOnEsc?:          boolean  // default: true (own handler without @loykin/layer)

  // Callbacks
  onClose?: () => void
}
```

`VirtualElement` is a type from `@floating-ui`; it only needs to implement `getBoundingClientRect()`. Use it for context menus positioned at the pointer.

---

## Usage Examples (Consumer Project)

### 1. Virtualized table row action

```tsx
import { FloatingProvider, useFloating } from '@loykin/floating'

// Layout
function DashboardLayout({ children }) {
  return (
    <FloatingProvider>
      {children}
    </FloatingProvider>
  )
}

// Table row — independent of re-renders and unmounts
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
    // ActionMenu renders into document.body through createPortal
    // isOpen stays active even when virtualization unmounts or remounts the row
  )
}
```

### 2. Context menu positioned at the pointer

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

### 3. Using side-panel and floating together (with @loykin/layer)

```tsx
import { LayerProvider } from '@loykin/layer'
import { SidePanelProvider } from '@loykin/side-panel'
import { FloatingProvider } from '@loykin/floating'

function App() {
  return (
    <LayerProvider>               {/* Manage the Escape stack */}
      <SidePanelProvider>         {/* Participate in the Escape stack */}
        <FloatingProvider>        {/* Participate in the Escape stack */}
          <Dashboard />
        </FloatingProvider>
      </SidePanelProvider>
    </LayerProvider>
  )
}

// When a panel and dropdown are both open:
// Esc → close only Floating because it opened most recently
// Esc again → close Panel
// z-index: Panel(50) < Floating(60), so Floating appears above Panel
```

---

## @loykin/side-panel Integration (Existing Package Changes)

Add `@loykin/layer` as an optional peer dependency. Without `LayerProvider`, behavior remains unchanged.

```ts
// Inside SidePanelProvider.tsx
const layerCtx = useLayerContext() // null without LayerProvider

useEffect(() => {
  if (!isOpen || !layerCtx) return
  layerCtx.push('side-panel', () => close())
  return () => layerCtx.pop('side-panel')
}, [isOpen])
```

There are no breaking changes.

---

## Internal Implementation Structure

### floatingStore.ts

```ts
interface FloatingState {
  openId:      string | null
  content:     ReactNode
  options:     FloatingOptions
  referenceEl: Element | VirtualElement | null

  // Actions
  _open:  (id: string, content: ReactNode, options: FloatingOptions) => void
  _close: () => void
}

// Use a createStore factory, as in SidePanelStore
// → each FloatingProvider gets an independent instance
export const createFloatingStore = () => createStore<FloatingState>(...)
```

### FloatingPortal.tsx

```tsx
// Always mounted inside FloatingProvider; returns null without content
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

  // Close when a click occurs outside floatingEl
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

## Build Configuration

Use the same tsup configuration as the existing packages.

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

## Implementation Order

### Step 1: `@loykin/layer`

1. Create the `packages/layer/` directory.
2. Set up `package.json`, `tsconfig.json`, and `tsup.config.ts` by copying an existing package.
3. Add `layerStack.ts` with the Zustand store.
4. Add `LayerProvider.tsx` with the context and Escape handler.
5. Export `LayerProvider` and `LAYER_Z` from `src/index.ts`.
6. Add a simple playground demo.

### Step 2: Integrate `@loykin/side-panel` with the layer

1. Add `@loykin/layer` as an optional peer dependency.
2. Connect `useLayerContext()` in `SidePanelProvider.tsx`.
3. Run regression tests for existing behavior.

### Step 3: `@loykin/floating`

1. Create and configure the `packages/floating/` directory.
2. Add `floatingStore.ts` with a Zustand store created by a `createStore` factory.
3. Add `FloatingContext.tsx` with the store context.
4. Add `FloatingPortal.tsx` using `@floating-ui/react` and `createPortal`.
5. Add `FloatingProvider.tsx` with store creation, Portal rendering, and layer integration.
6. Add `useFloating.ts` as the public hook.
7. Add exports to `src/index.ts`.
8. Add a table demo to the playground.

---

## Out of Scope

This package does not cover:

- **Toast notifications** — use Sonner
- **Drag and drop** — use dnd-kit
- **Modals** — use a future separate package (`@loykin/modal`) or Radix
- **Multiple tooltips open at once** — requires a different design
