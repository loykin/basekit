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

## UI Adapter

By default `DatetimeRange` renders with its own built-in `@base-ui/react`-backed
Button/Popover/Select/Tabs/Input/Switch/ScrollArea. If your app already has real
shadcn/ui components, pass `uiAdapter` to render with those instead — same
behavior, native look:

```tsx
import { DatetimeRange } from '@loykin/datetime-range'
import { createShadcnAdapter } from '@loykin/datetime-range/adapters/shadcn'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

// Build once at module scope — uiAdapter must be referentially stable, or the
// adapted subtree remounts on every render.
const shadcnAdapter = createShadcnAdapter({
  Button, Popover, PopoverTrigger, PopoverContent,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Input, Switch,
  // ScrollArea is optional — omit it to keep the built-in one (TimePicker relies
  // on a `viewportRef` contract a generic shadcn ScrollArea may not expose).
})

<DatetimeRange startTime={start} endTime={end} onChange={onChange} uiAdapter={shadcnAdapter} />
```

`SidePanel` takes the same `uiAdapter` prop independently. Only
`createShadcnAdapter` ships today. For anything else, build a
`DatetimeRangeUIAdapter` by hand — every field is optional, and unset ones fall
back to the built-in implementation. Wrap a subtree in `DatetimeRangeProvider`
to apply one adapter to every `DatetimeRange`/`SidePanel` inside it without
passing `uiAdapter` on each.

Pair it with `calendarMode="inline"` to render the Absolute-mode calendar
always-expanded (shadcn-style) instead of behind a popover-in-popover — useful
for dashboard filter bars where a wide layout is already available.

React 18 and React 19 are supported. See the
[BaseKit repository](https://github.com/loykin/basekit) for the complete API,
theming tokens, and playground.
