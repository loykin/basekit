# @loykin/side-panel

Non-blocking, resizable React side panels with per-provider Zustand state,
close guards, snap points, and support for all four screen edges.

```bash
pnpm add @loykin/side-panel
```

```tsx
import { SidePanelProvider, useSidePanel } from '@loykin/side-panel'
import '@loykin/side-panel/styles'

function OpenDetails() {
  const { open } = useSidePanel()
  return <button onClick={() => open(<Details />, { side: 'right' })}>Open</button>
}

<SidePanelProvider>
  <OpenDetails />
</SidePanelProvider>
```

React 18 and React 19 are supported. See the
[BaseKit repository](https://github.com/loykin/basekit) for all panel options.
