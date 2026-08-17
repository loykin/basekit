# @loykin/filter-input

Config-driven React filter controls for text, numeric, boolean, select,
multi-select, ranges, tags, and remote option sources.

```bash
pnpm add @loykin/filter-input
```

```tsx
import { FilterVariable } from '@loykin/filter-input'
import '@loykin/filter-input/styles'

<FilterVariable
  config={{
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Open', value: 'open' },
      { label: 'Closed', value: 'closed' },
    ],
  }}
  value={status}
  onChange={setStatus}
/>
```

## Sizing and icons

`config.display` controls a control's size and icon slots:

```tsx
<FilterVariable
  config={{
    key: 'search',
    type: 'text',
    display: {
      size: 'lg',                          // 'sm' | 'md' (default) | 'lg'
      leadingIcon: <SearchIcon />,
      trailingIcon: <span>⌘K</span>,        // any ReactNode — set either, both, or neither
    },
  }}
  value={query}
  onChange={setQuery}
/>
```

## Theming

`FilterInput` renders as one opaque field rather than being composed from
swappable Button/Popover/Select primitives, so there's no `uiAdapter` here (unlike
`@loykin/datetime-range` and `@loykin/cron-input`). Instead it leans entirely on the
`--basekit-*` → `var(--background|border|ring|...)` fallback chain — drop it into an
app that already defines shadcn/ui's CSS variables and its border, radius, and focus
ring pick those up automatically with zero extra config.

React 18 and React 19 are supported. See the
[BaseKit repository](https://github.com/loykin/basekit) for remote data source and
full theming token documentation.
