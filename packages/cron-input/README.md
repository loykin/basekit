# @loykin/cron-input

[![npm](https://img.shields.io/npm/v/@loykin/cron-input)](https://www.npmjs.com/package/@loykin/cron-input)

Cron expression builder with a visual schedule editor and raw expression fallback.

## Install

```bash
npm install @loykin/cron-input
```

## Usage

```tsx
import { CronInput } from '@loykin/cron-input'
import '@loykin/cron-input/styles'

function App() {
  const [value, setValue] = useState({ type: 'daily', hour: 9, minute: 0 })

  return <CronInput value={value} onChange={setValue} />
}
```

## Modes

| Tab | Example expression |
|---|---|
| Interval | `*/5 * * * *` |
| Daily | `0 9 * * *` |
| Weekly | `30 9 * * 1,3,5` |
| Monthly | `0 9 1 * *` |
| Custom | supported 5-field cron subset (numbers, `*`, `*/n`, `a-b`, comma lists) |

## Utilities

```ts
import { toCronExpression, fromCronExpression, toDisplayString, validateCronExpression } from '@loykin/cron-input'

toCronExpression({ type: 'weekly', days: [1, 3, 5], hour: 9, minute: 0 })
// → "0 9 * * 1,3,5"

toDisplayString({ type: 'weekly', days: [1, 3, 5], hour: 9, minute: 0 })
// → "Mon, Wed, Fri at 09:00"

fromCronExpression('0 9 * * *')
// → { type: 'daily', hour: 9, minute: 0 }

validateCronExpression('99 99 * * *')
// → false
```

## UI Adapter

By default `CronInput` renders with its own built-in `@base-ui/react`-backed
Button/Popover/Tabs. If your app already has real shadcn/ui components, pass
`uiAdapter` to render with those instead — same behavior, native look:

```tsx
import { CronInput } from '@loykin/cron-input'
import { createShadcnAdapter } from '@loykin/cron-input/adapters/shadcn'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// Build once at module scope — uiAdapter must be referentially stable, or the
// adapted subtree remounts on every render.
const shadcnAdapter = createShadcnAdapter({
  Button, Popover, PopoverTrigger, PopoverContent,
  Tabs, TabsList, TabsTrigger, TabsContent,
})

<CronInput value={value} onChange={onChange} uiAdapter={shadcnAdapter} />
```

Only `createShadcnAdapter` ships today. For anything else, build a
`CronInputUIAdapter` by hand — `Button`, `Popover`, `PopoverTrigger`,
`PopoverContent`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` are all
optional; unset fields fall back to the built-in ones. Wrap a subtree in
`CronInputProvider` to apply one adapter to every `CronInput` inside it
without passing `uiAdapter` on each.

NumberStepper/DayChips/TimePicker and the Custom-tab expression input stay
built-in either way — they're cron-input's own domain widgets, not generic UI
primitives, so there's nothing to swap them for.

## Headless

Use `useCronInput` if you want full control over the UI:

```tsx
import { useCronInput } from '@loykin/cron-input'

const { isOpen, setIsOpen, draft, setDraft, onApply, onCancel } = useCronInput({ value, onChange })
```

## Theming

Uses the shared `--basekit-*` CSS custom properties. See the [root README](../../README.md#theming) for the full token list.

---

[GitHub](https://github.com/loykin/basekit) · [npm](https://www.npmjs.com/package/@loykin/cron-input)
