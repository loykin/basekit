# @loykin/control-bar

Persistent resizable bottom bar for React. Renders tab-based panels at the bottom of the viewport — like a VS Code terminal or browser DevTools.

```bash
npm install @loykin/control-bar
```

```tsx
import {
  ControlBarProvider,
  ControlBar,
  ControlBarBody,
  registerTabType,
  useControlBar,
} from '@loykin/control-bar'
import '@loykin/control-bar/styles'

// 1. Register tab types once (e.g. in your app entry)
registerTabType('log', { label: 'Logs', render: (data) => <LogViewer {...data} /> })

// 2. Wrap your app
<ControlBarProvider>
  <ControlBarBody>{/* page content */}</ControlBarBody>
  <ControlBar />
</ControlBarProvider>

// 3. Open tabs from anywhere
const { open } = useControlBar()
open({ type: 'log', data: { level: 'error' } })
```

Or build a fully custom UI using just the hook — the default `ControlBar` component and CSS are optional:

```tsx
function MyTabBar() {
  const { tabs, activeTabId, activate, close } = useControlBar()
  return (
    <div className="my-tab-bar">
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => activate(tab.id)}
          className={tab.id === activeTabId ? 'active' : ''}>
          {tab.label}
        </button>
      ))}
    </div>
  )
}
```

React 18 and React 19 are supported. See the
[BaseKit repository](https://github.com/loykin/basekit) for all options, theming tokens,
and headless usage.
