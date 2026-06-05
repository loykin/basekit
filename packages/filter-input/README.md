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

React 18 and React 19 are supported. See the
[BaseKit repository](https://github.com/loykin/basekit) for remote data source,
display mode, and theming documentation.
