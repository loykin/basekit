# basekit

Personal React component and utility library monorepo, built with pnpm workspaces.

## Packages

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

---

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
  value={range}
  onChange={setRange}
  precision="minute"
  labels={{ apply: 'Apply', cancel: 'Cancel' }}
/>
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
fmt(1024)  // "1024.00 MB"
```

---

## Structure

```
basekit/
├── packages/
│   ├── side-panel/       # @loykin/side-panel
│   ├── datetime-range/   # @loykin/datetime-range
│   └── unit/             # @loykin/unit
└── playground/           # Vite + React dev app for live demos
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
pnpm --filter @loykin/side-panel dev
pnpm --filter playground dev
```

## Build

```bash
pnpm build
```

## Type check

```bash
pnpm type-check
```
