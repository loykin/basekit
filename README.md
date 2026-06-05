# basekit

Personal React component and utility library monorepo, built with pnpm workspaces.

## Packages

### [`@loykin/datetime-range`](./packages/datetime-range)

Datetime range picker that supports both absolute dates and relative time expressions.

- **Absolute mode** — calendar + segment input (`date`, `hour`, `minute`, `second` precision)
- **Relative mode** — "15 minutes ago", "3 days ago", or "Now"
- Quick presets — pre-built ranges like "Last 1h", "Last 7d", "Last 30d"
- Fully labeled — all UI strings overridable via `labels` prop (i18n-ready)
- Utility functions — `toDate`, `toTimestamp`, `toUrlString`, `fromUrlString`, `validateRange`, and more
- Headless-friendly — `DatetimeRange`, `DateTimePanel`, `DatetimeSegmentInput` exported separately

```tsx
<DatetimeRange
  startTime={start}
  endTime={end}
  onChange={onChange}
  precision="minute"
  labels={{ apply: 'Apply', cancel: 'Cancel' }}
/>
```

**CSS import:**
```ts
import '@loykin/datetime-range/styles'
```

---

### [`@loykin/filter-input`](./packages/filter-input)

Composable filter control for building search / filter UIs. Each field is a typed input that renders differently based on `config.type`.

- `text` — plain text input with optional clear button
- `tag` — multi-value tag input (type and press Enter)
- `select` — single-select dropdown (base-ui powered, fully styled)
- `multi-select` — multi-select with search, tag display, overflow count
- `number` / `textarea` / `boolean` / `date` / `range` — additional field types
- `FilterVariable` — label + input combined in one bordered control
- `FilterInput` — standalone input without label wrapper
- Data sources — static options or async remote fetch
- Display modes — `tags`, `count`, `summary`, `text`

```tsx
<FilterVariable
  config={{
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [{ label: 'Open', value: 'open' }, { label: 'Closed', value: 'closed' }],
  }}
  value={values.status}
  onChange={(value, ctx) => setValues(prev => ({ ...prev, [ctx.key]: value }))}
/>
```

**CSS import:**
```ts
import '@loykin/filter-input/styles'
```

---

### [`@loykin/side-panel`](./packages/side-panel)

Non-blocking resizable side panel for React. The main content stays fully interactive while the panel is open.

- Open from any direction — `left`, `right`, `top`, `bottom`
- Drag the inner edge to resize; `minSize` / `maxSize` auto-clamped to the container
- Outside click and Escape close by default; both can be disabled per `open()` call
- `onBeforeClose` hook — return `false` (sync or async) to cancel close
- `usePanelGuard` / `PanelGuard` — exclude specific elements from the outside-click detector
- Per-call overrides — every `open(content, options)` can override side, size, and behavior
- Zustand-backed per-Provider store — multiple independent panels on the same page

```tsx
const { open, isOpen } = useSidePanel()

open(<UserDetail user={user} />, { side: 'right', size: 420 })
```

**CSS import:**
```ts
import '@loykin/side-panel/styles'
```

---

### [`@loykin/unit`](./packages/unit)

Unit formatter covering every common metric category. Designed for dashboards and monitoring UIs.

- **Bytes** — SI (`KB`, `MB`, `GB` …) and IEC (`KiB`, `MiB`, `GiB` …)
- **Bits / bit rates** — `bps`, `Kbps`, `Mbps`, `Gbps`, `Tbps`
- **Byte rates** — `Bps`, `KBps`, `MBps`, `GBps`
- **Time** — `ns`, `µs`, `ms`, `s`, `min`, `h`, `d`, human duration
- **Percent** — `percent` (0–100) and `percentunit` (0–1)
- **Currency** — USD, EUR, KRW, JPY, GBP, CNY, and more with locale formatting
- **Numbers** — plain, short (`1.2K`, `3.4M`), scientific, locale
- **Throughput** — `req/s`, `rps`, `wps`, `iops`, `rpm`
- **Physical units** — temperature, length, weight, angle, velocity

```ts
formatUnit(1536, { unit: 'bytes', decimals: 1 })  // "1.5 KB"
formatUnit(3600, { unit: 's' })                    // "1h"
formatUnit(0.9234, { unit: 'percentunit' })        // "92.34%"

const fmt = createFormatter({ unit: 'mbytes', decimals: 2 })
fmt(1_024_000_000)  // "1024.00 MB"
```

---

## Theming

All visual packages (`datetime-range`, `filter-input`, `side-panel`) share a unified `--bk-*` CSS custom property namespace. Override them in your app's CSS to apply a custom theme:

```css
:root {
  --bk-background:           oklch(1 0 0);
  --bk-foreground:           oklch(0.145 0 0);
  --bk-primary:              oklch(0.488 0.243 264.376);
  --bk-primary-foreground:   oklch(0.97 0.014 254.604);
  --bk-muted:                oklch(0.97 0 0);
  --bk-muted-foreground:     oklch(0.556 0 0);
  --bk-border:               oklch(0.922 0 0);
  --bk-input:                oklch(0.922 0 0);
  --bk-ring:                 oklch(0.708 0 0);
  --bk-popover:              oklch(1 0 0);
  --bk-popover-foreground:   oklch(0.145 0 0);
  --bk-radius:               6px;
}
```

`filter-input` also exposes control-specific overrides that fall back to the base tokens:

| Token | Default |
|---|---|
| `--bk-fi-control-background` | `--bk-background` |
| `--bk-fi-control-foreground` | `--bk-foreground` |
| `--bk-fi-control-border` | `--bk-input` |
| `--bk-fi-control-placeholder` | `--bk-muted-foreground` |
| `--bk-fi-separator` | `--bk-border` |

The **playground** includes a live Theme Tokens editor for each package where you can pick colors, adjust radius, and copy the generated CSS.

---

## Structure

```
basekit/
├── packages/
│   ├── datetime-range/   # @loykin/datetime-range
│   ├── filter-input/     # @loykin/filter-input
│   ├── side-panel/       # @loykin/side-panel
│   └── unit/             # @loykin/unit
├── playground/           # Vite + React + shadcn dev app
└── docs/                 # Design notes
```

## Setup

```bash
pnpm install
```

## Development

Start all packages in watch mode alongside the playground:

```bash
pnpm dev
```

Or run a specific package:

```bash
pnpm --filter @loykin/datetime-range dev
pnpm --filter @loykin/filter-input dev
pnpm --filter @loykin/side-panel dev
pnpm --filter basekit-playground dev
```

## Build

```bash
pnpm build
```

## Type check

```bash
pnpm type-check
```

## Quality checks

```bash
pnpm lint
pnpm test
pnpm test:consumer
```

`test:consumer` packs all four publishable packages, installs the tarballs in
a temporary Vite application, then runs TypeScript and production builds.

## Releases

This repository uses Changesets with independent package versions.

```bash
pnpm changeset
```

Commit the generated changeset with the package change. Merges to `master`
update the release pull request. Merging that pull request publishes the
changed npm packages, updates package-specific changelogs, and creates tags.

## License

[MIT](./LICENSE)
