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
