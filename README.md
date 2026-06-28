# basekit

Personal React component and utility library monorepo, built with pnpm workspaces.

## Packages

### [`@loykin/datetime-range`](./packages/datetime-range) [![npm](https://img.shields.io/npm/v/@loykin/datetime-range)](https://www.npmjs.com/package/@loykin/datetime-range)

```bash
npm install @loykin/datetime-range
```

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

### [`@loykin/cron-input`](./packages/cron-input) [![npm](https://img.shields.io/npm/v/@loykin/cron-input)](https://www.npmjs.com/package/@loykin/cron-input)

```bash
npm install @loykin/cron-input
```

Cron expression builder with a visual schedule editor and raw expression fallback.

- **Interval** — "Every N minutes / hours / days" with stepper control
- **Daily** — time picker for a fixed daily time
- **Weekly** — day-of-week chip selector + time picker
- **Monthly** — day-of-month stepper + time picker
- **Custom** — raw cron expression input with real-time validation, human-readable description, and 5-field breakdown
- Tab switching preserves time values across modes
- `fromCronExpression` / `toCronExpression` / `toDisplayString` utilities
- Headless-friendly — `useCronInput` hook exported separately

```tsx
<CronInput
  value={{ type: 'weekly', days: [1, 3, 5], hour: 9, minute: 0 }}
  onChange={onChange}
/>
```

**CSS import:**
```ts
import '@loykin/cron-input/styles'
```

---

### [`@loykin/filter-input`](./packages/filter-input) [![npm](https://img.shields.io/npm/v/@loykin/filter-input)](https://www.npmjs.com/package/@loykin/filter-input)

```bash
npm install @loykin/filter-input
```

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

### [`@loykin/side-panel`](./packages/side-panel) [![npm](https://img.shields.io/npm/v/@loykin/side-panel)](https://www.npmjs.com/package/@loykin/side-panel)

```bash
npm install @loykin/side-panel
```

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

### [`@loykin/control-bar`](./packages/control-bar) [![npm](https://img.shields.io/npm/v/@loykin/control-bar)](https://www.npmjs.com/package/@loykin/control-bar)

```bash
npm install @loykin/control-bar
```

Persistent resizable bottom bar for React. Renders tab-based panels at the bottom of the viewport — like a VS Code terminal or browser DevTools.

- Tab management — open, close, activate tabs programmatically via `useControlBar`
- Resizable — drag the top edge; configurable snap points and gap
- Collapse / fullscreen — built-in states, persisted via `localStorage` (fullscreen excluded)
- Scroll buttons — auto-shown when tabs overflow the header
- Tab type registry — `registerTabType(type, { label, render })` wires any React content to a tab type
- Customizable actions — `renderActions` prop replaces default collapse/fullscreen buttons with any UI
- `ControlBarBody` — wraps page content and auto-applies `padding-bottom: var(--cb-height)` so the bar never overlaps content
- **Headless** — use `useControlBar()` directly to build any custom UI (top tabs, sidebar list, VS Code-style, etc.) while the hook manages all tab/collapse/fullscreen state

```tsx
// 1. Register tab types once (e.g. in your app entry)
registerTabType('log', { label: 'Logs', render: (data) => <LogViewer {...data} /> })

// 2. Wrap your app
<ControlBarProvider>
  <ControlBarBody>{/* page content */}</ControlBarBody>
  <ControlBar onRequestOpen={() => {/* open dialog */}} />
</ControlBarProvider>

// 3. Open tabs from anywhere
const { open } = useControlBar()
open({ type: 'log', data: { level: 'error' } })
```

Or build a fully custom UI using just the hook:
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

**CSS import** (only needed when using the default `ControlBar` component):
```ts
import '@loykin/control-bar/styles'
```

---

### [`@loykin/unit`](./packages/unit) [![npm](https://img.shields.io/npm/v/@loykin/unit)](https://www.npmjs.com/package/@loykin/unit)

```bash
npm install @loykin/unit
```

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

All styled packages (`cron-input`, `datetime-range`, `filter-input`, `side-panel`, `control-bar`) share the same `--basekit-*` token namespace. Each token falls back to the shadcn/base-ui conventional name so existing themes are picked up automatically:

```css
:root {
  --basekit-background:           var(--background,        oklch(1 0 0));
  --basekit-foreground:           var(--foreground,        oklch(0.145 0 0));
  --basekit-primary:              var(--primary,           oklch(0.488 0.243 264.376));
  --basekit-primary-foreground:   var(--primary-foreground,oklch(0.97 0.014 254.604));
  --basekit-muted:                var(--muted,             oklch(0.97 0 0));
  --basekit-muted-foreground:     var(--muted-foreground,  oklch(0.556 0 0));
  --basekit-border:               var(--border,            oklch(0.922 0 0));
  --basekit-input:                var(--input,             oklch(0.922 0 0));
  --basekit-ring:                 var(--ring,              oklch(0.708 0 0));
  --basekit-popover:              var(--popover,           oklch(1 0 0));
  --basekit-popover-foreground:   var(--popover-foreground,oklch(0.145 0 0));
  --basekit-destructive:          var(--destructive,       oklch(0.577 0.245 27.325));
  --basekit-radius:               var(--radius,            0px);
}
```

### Package-specific overrides

`filter-input` exposes control-specific tokens that fall back to the base tokens:

| Token | Default |
|---|---|
| `--basekit-fi-control-background` | `--basekit-background` |
| `--basekit-fi-control-foreground` | `--basekit-foreground` |
| `--basekit-fi-control-border` | `--basekit-input` |
| `--basekit-fi-control-placeholder` | `--basekit-muted-foreground` |
| `--basekit-fi-separator` | `--basekit-border` |

`control-bar` exposes `--cb-*` tokens that fall back to `--basekit-*`, allowing independent override per component:

| Token | Default |
|---|---|
| `--cb-background` | `--basekit-background` |
| `--cb-foreground` | `--basekit-foreground` |
| `--cb-border` | `--basekit-border` |
| `--cb-muted` | `--basekit-muted` |
| `--cb-muted-foreground` | `--basekit-muted-foreground` |
| `--cb-primary` | `--basekit-primary` |
| `--cb-primary-foreground` | `--basekit-primary-foreground` |
| `--cb-radius` | `--basekit-radius` |
| `--cb-header-height` | `36px` |

The **playground** includes a live Theme Tokens editor for each package — pick colors, adjust radius, and copy the generated CSS.

---

## Structure

```
basekit/
├── packages/
│   ├── control-bar/      # @loykin/control-bar
│   ├── cron-input/       # @loykin/cron-input
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
pnpm --filter @loykin/control-bar dev
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

`test:consumer` packs all six publishable packages, installs the tarballs in
a temporary Vite application, then runs TypeScript and production builds.

## Releases

All packages share a single version and are released together with one tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

- Pre-release: `v1.0.0-dev.0`, `v1.0.0-alpha.1`, etc. → publishes to npm with that dist-tag
- GitHub Actions (`release.yml`) handles build → publish → GitHub Release automatically
- New packages are picked up automatically — no changes needed in the workflow

## License

[MIT](./LICENSE)
