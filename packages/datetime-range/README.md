# @loykin/datetime-range

React datetime range picker with absolute dates, relative expressions, quick
presets, validation, and Grafana-compatible URL serialization.

```bash
pnpm add @loykin/datetime-range
```

```tsx
import { DatetimeRange } from '@loykin/datetime-range'
import '@loykin/datetime-range/styles'

<DatetimeRange
  startTime={start}
  endTime={end}
  onChange={(startTime, endTime) => {
    setStart(startTime)
    setEnd(endTime)
  }}
/>
```

React 18 and React 19 are supported. See the
[BaseKit repository](https://github.com/loykin/basekit) for the complete API,
theming tokens, and playground.
