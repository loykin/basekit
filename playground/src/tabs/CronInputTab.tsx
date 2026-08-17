import { useRef, useState } from 'react'
import {
  CronInput,
  toCronExpression,
  toDisplayString,
  type CronValue,
} from '@loykin/cron-input'
import '@loykin/cron-input/styles'
import { createShadcnAdapter } from '@loykin/cron-input/adapters/shadcn'
import { Button as ShadcnButton } from '../components/ui/button'
import { Popover as ShadcnPopover, PopoverTrigger as ShadcnPopoverTrigger, PopoverContent as ShadcnPopoverContent } from '../components/ui/popover'
import { Tabs as ShadcnTabs, TabsList as ShadcnTabsList, TabsTrigger as ShadcnTabsTrigger, TabsContent as ShadcnTabsContent } from '../components/ui/tabs'

// createShadcnAdapter bridges CronInput's internal Button/Popover/Tabs to your app's OWN
// real shadcn/ui components. Built once at module scope: uiAdapter must be referentially
// stable, or the affected subtree remounts on every render.
const shadcnAdapter = createShadcnAdapter({
  Button: ShadcnButton,
  Popover: ShadcnPopover,
  PopoverTrigger: ShadcnPopoverTrigger,
  PopoverContent: ShadcnPopoverContent,
  Tabs: ShadcnTabs,
  TabsList: ShadcnTabsList,
  TabsTrigger: ShadcnTabsTrigger,
  TabsContent: ShadcnTabsContent,
})

function Code({ children }: { children: string }) {
  return (
    <pre className="text-[11px] font-mono bg-muted text-muted-foreground px-3 py-2 overflow-x-auto whitespace-pre">
      {children.trim()}
    </pre>
  )
}

function Value({ value }: { value: CronValue }) {
  return (
    <table className="text-[11px] font-mono w-full border-collapse">
      <tbody>
        {[
          ['expression', toCronExpression(value)],
          ['display',    toDisplayString(value)],
          ['type',       value.type],
        ].map(([label, val]) => (
          <tr key={label} className="border-t border-border">
            <td className="py-1 pr-4 text-muted-foreground w-24 shrink-0">{label}</td>
            <td className="py-1 text-foreground">{val}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Demo({
  title,
  description,
  code,
  children,
}: {
  title: string
  description?: string
  code: string
  children: React.ReactNode
}) {
  return (
    <section className="border border-border">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-xs font-semibold">{title}</h2>
        {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="p-4 flex flex-col gap-3">
        <Code>{code}</Code>
        {children}
      </div>
    </section>
  )
}

function useCron(init: CronValue) {
  const [value, setValue] = useState<CronValue>(init)
  return { value, onChange: setValue }
}

function ShadcnAdapterExample() {
  const { value, onChange } = useCron({ type: 'daily', hour: 9, minute: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  return (
    <div ref={containerRef} className="shadcn-theme-scope">
      <CronInput value={value} onChange={onChange} uiAdapter={shadcnAdapter} portalContainer={containerRef} />
      <Value value={value} />
    </div>
  )
}

function AdversarialFormTriggerExample() {
  const { value, onChange } = useCron({ type: 'daily', hour: 9, minute: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [submitCount, setSubmitCount] = useState(0)
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setSubmitCount((n) => n + 1)
      }}
    >
      <div ref={containerRef} className="shadcn-theme-scope">
        <CronInput
          value={value}
          onChange={onChange}
          uiAdapter={shadcnAdapter}
          portalContainer={containerRef}
          renderTrigger={(triggerProps, { value: v }) => (
            <button {...triggerProps} className="cron-input-trigger">
              {toCronExpression(v)}
            </button>
          )}
        />
        <Value value={value} />
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground" data-testid="submit-count">
        Form onSubmit fired: {submitCount} {submitCount === 0 ? '(clicking the trigger above should never move this off 0)' : '⚠️ unexpected'}
      </p>
    </form>
  )
}

export function CronInputTab() {
  const daily   = useCron({ type: 'daily',    hour: 9, minute: 0 })
  const weekly  = useCron({ type: 'weekly',   days: [1, 3, 5], hour: 9, minute: 30 })
  const monthly = useCron({ type: 'monthly',  day: 1, hour: 0, minute: 0 })
  const interval = useCron({ type: 'interval', every: 5, unit: 'minute' })
  const custom  = useCron({ type: 'custom',   expression: '0 9 * * 1-5' })
  const i18n    = useCron({ type: 'daily',    hour: 8, minute: 0 })
  const uncontrolled = { defaultValue: { type: 'weekly' as const, days: [1], hour: 10, minute: 0 } }
  const disabled = useCron({ type: 'daily', hour: 9, minute: 0 })

  return (
    <div className="flex flex-col gap-4 max-w-3xl">

      <Demo
        title="Default (Daily)"
        description="Starts on Daily tab. Tabs: Interval, Daily, Weekly, Monthly, Custom."
        code={`<CronInput value={value} onChange={onChange} />`}
      >
        <CronInput value={daily.value} onChange={daily.onChange} />
        <Value value={daily.value} />
      </Demo>

      <Demo
        title="Weekly"
        description="Initial value with specific days pre-selected."
        code={`<CronInput
  value={{ type: 'weekly', days: [1, 3, 5], hour: 9, minute: 30 }}
  onChange={onChange}
/>`}
      >
        <CronInput value={weekly.value} onChange={weekly.onChange} />
        <Value value={weekly.value} />
      </Demo>

      <Demo
        title="Monthly"
        description="Run on a specific day of the month."
        code={`<CronInput
  value={{ type: 'monthly', day: 1, hour: 0, minute: 0 }}
  onChange={onChange}
/>`}
      >
        <CronInput value={monthly.value} onChange={monthly.onChange} />
        <Value value={monthly.value} />
      </Demo>

      <Demo
        title="Interval"
        description="Run every N minutes, hours, or days."
        code={`<CronInput
  value={{ type: 'interval', every: 5, unit: 'minute' }}
  onChange={onChange}
/>`}
      >
        <CronInput value={interval.value} onChange={interval.onChange} />
        <Value value={interval.value} />
      </Demo>

      <Demo
        title="Custom Expression"
        description="Start on the Custom tab with a raw expression. Unknown patterns fall back here automatically."
        code={`<CronInput
  value={{ type: 'custom', expression: '0 9 * * 1-5' }}
  onChange={onChange}
/>`}
      >
        <CronInput value={custom.value} onChange={custom.onChange} />
        <Value value={custom.value} />
      </Demo>

      <Demo
        title="Uncontrolled"
        description="Uses defaultValue internally — no external state needed."
        code={`<CronInput
  defaultValue={{ type: 'weekly', days: [1], hour: 10, minute: 0 }}
  onChange={onChange}
/>`}
      >
        <CronInput {...uncontrolled} />
      </Demo>

      <Demo
        title="Custom Labels (i18n)"
        description="Override all UI text."
        code={`<CronInput
  labels={{
    interval: 'Interval', daily: 'Daily',
    weekly: 'Weekly', monthly: 'Monthly', custom: 'Custom',
    apply: 'Apply', cancel: 'Cancel',
  }}
/>`}
      >
        <CronInput
          value={i18n.value}
          onChange={i18n.onChange}
          labels={{
            interval: 'Interval', daily: 'Daily',
            weekly: 'Weekly', monthly: 'Monthly', custom: 'Raw',
            apply: 'Save', cancel: 'Discard',
          }}
        />
        <Value value={i18n.value} />
      </Demo>

      <Demo
        title="Custom Trigger"
        description="renderTrigger for a fully custom trigger element."
        code={`<CronInput
  renderTrigger={(triggerProps, { value }) => (
    <button {...triggerProps} className="...">
      {toCronExpression(value)}
    </button>
  )}
/>`}
      >
        <CronInput
          value={weekly.value}
          onChange={weekly.onChange}
          renderTrigger={(triggerProps, { value }) => (
            <button
              {...triggerProps}
              className="text-xs font-mono border-b border-dashed border-foreground/40 hover:border-foreground/80 pb-0.5 transition-colors"
            >
              {toCronExpression(value)}
            </button>
          )}
        />
      </Demo>

      <Demo
        title="Disabled"
        description="Entire component non-interactive."
        code={`<CronInput disabled />`}
      >
        <CronInput value={disabled.value} onChange={disabled.onChange} disabled />
      </Demo>

      <Demo
        title="shadcn adapter"
        description="uiAdapter swaps Button/Popover/Tabs for your app's own real shadcn/ui components."
        code={`const shadcnAdapter = createShadcnAdapter({
  Button, Popover, PopoverTrigger, PopoverContent,
  Tabs, TabsList, TabsTrigger, TabsContent,
})

<CronInput value={value} onChange={onChange} uiAdapter={shadcnAdapter} />`}
      >
        <ShadcnAdapterExample />
      </Demo>

      <Demo
        title="shadcn adapter + custom trigger (no manual type=&quot;button&quot; needed)"
        description="renderTrigger combined with uiAdapter — the spread {...triggerProps} carries a safe type=&quot;button&quot; on its own, even though this trigger doesn't set one itself. Wrapped in a real <form> below to prove clicking it doesn't submit."
        code={`<form onSubmit={...}>
  <CronInput
    value={value}
    onChange={onChange}
    uiAdapter={shadcnAdapter}
    renderTrigger={(triggerProps, { value }) => (
      <button {...triggerProps}>{toCronExpression(value)}</button>
    )}
  />
</form>`}
      >
        <AdversarialFormTriggerExample />
      </Demo>

    </div>
  )
}
