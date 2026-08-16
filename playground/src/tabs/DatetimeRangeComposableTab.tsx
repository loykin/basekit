import { useState, useRef } from 'react'
import {
  DatetimeRange,
  SidePanel,
  useDatetimeRange,
  DateTimeRangeValue,
  relativeAgo,
  relativeNow,
  toDisplayString,
  absoluteDate,
  QUICK_PRESETS,
} from '@loykin/datetime-range'
import '@loykin/datetime-range/styles'
import { createShadcnAdapter } from '@loykin/datetime-range/adapters/shadcn'
import { Button as ShadcnButton } from '../components/ui/button'
import { Input as ShadcnInput } from '../components/ui/input'
import { Popover as ShadcnPopover, PopoverTrigger as ShadcnPopoverTrigger, PopoverContent as ShadcnPopoverContent } from '../components/ui/popover'
import { Select as ShadcnSelect, SelectTrigger as ShadcnSelectTrigger, SelectValue as ShadcnSelectValue, SelectContent as ShadcnSelectContent, SelectItem as ShadcnSelectItem } from '../components/ui/select'
import { Tabs as ShadcnTabs, TabsList as ShadcnTabsList, TabsTrigger as ShadcnTabsTrigger, TabsContent as ShadcnTabsContent } from '../components/ui/tabs'
import { Switch as ShadcnSwitch } from '../components/ui/switch'
import { ScrollArea as ShadcnScrollArea } from '../components/ui/scroll-area'

const initStart = (): DateTimeRangeValue => relativeAgo(1, 'Hours ago')
const initEnd   = (): DateTimeRangeValue => relativeNow()

function RangeDisplay({ start, end }: { start: DateTimeRangeValue; end: DateTimeRangeValue }) {
  return (
    <p style={{ fontSize: 11, color: 'var(--basekit-muted-foreground)', marginTop: 8 }}>
      {toDisplayString(start, { precision: 'second' })} → {toDisplayString(end, { precision: 'second' })}
    </p>
  )
}

// ── Default ───────────────────────────────────────────────────────────────────

function DefaultExample() {
  const [start, setStart] = useState(initStart())
  const [end,   setEnd]   = useState(initEnd())
  return (
    <div>
      <DatetimeRange
        startTime={start}
        endTime={end}
        onChange={(s, e) => { setStart(s); setEnd(e) }}
      />
      <RangeDisplay start={start} end={end} />
    </div>
  )
}

// ── Custom theme ──────────────────────────────────────────────────────────────
// portalContainer renders the popup inside the wrapper div,
// so --basekit-* tokens on the wrapper apply to the popup too.

const FOREST_THEME: Record<string, string> = {
  '--basekit-background':           'oklch(0.99 0.005 140)',
  '--basekit-foreground':           'oklch(0.2 0.04 140)',
  '--basekit-popover':              'oklch(0.99 0.005 140)',
  '--basekit-popover-foreground':   'oklch(0.2 0.04 140)',
  '--basekit-primary':              'oklch(0.5 0.15 145)',
  '--basekit-primary-foreground':   'oklch(0.98 0.01 145)',
  '--basekit-muted':                'oklch(0.95 0.015 140)',
  '--basekit-muted-foreground':     'oklch(0.48 0.04 140)',
  '--basekit-border':               'oklch(0.86 0.025 140)',
  '--basekit-input':                'oklch(0.86 0.025 140)',
  '--basekit-ring':                 'oklch(0.5 0.15 145)',
  '--basekit-accent':               'oklch(0.93 0.025 140)',
  '--basekit-accent-foreground':    'oklch(0.2 0.04 140)',
  '--basekit-secondary':            'oklch(0.94 0.02 145)',
  '--basekit-secondary-foreground': 'oklch(0.25 0.05 145)',
  '--basekit-radius':               '0.375rem',
}

function CustomThemeExample() {
  const [start, setStart] = useState(initStart())
  const [end,   setEnd]   = useState(initEnd())
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} style={FOREST_THEME as React.CSSProperties}>
      <DatetimeRange
        startTime={start}
        endTime={end}
        onChange={(s, e) => { setStart(s); setEnd(e) }}
        portalContainer={containerRef}
      />
      <RangeDisplay start={start} end={end} />
    </div>
  )
}

// ── shadcn adapter ─────────────────────────────────────────────────────────────
// createShadcnAdapter bridges DatetimeRange's internal Button/Popover/Select/Tabs/Switch/Input
// to your app's OWN real shadcn/ui components — the actual DOM comes from your design system,
// not a re-themed copy of basekit's own. Built once at module scope: uiAdapter must be
// referentially stable, or the affected subtree remounts on every render.
const shadcnAdapter = createShadcnAdapter({
  Button: ShadcnButton,
  Input: ShadcnInput,
  Popover: ShadcnPopover,
  PopoverTrigger: ShadcnPopoverTrigger,
  PopoverContent: ShadcnPopoverContent,
  Select: ShadcnSelect,
  SelectTrigger: ShadcnSelectTrigger,
  SelectValue: ShadcnSelectValue,
  SelectContent: ShadcnSelectContent,
  SelectItem: ShadcnSelectItem,
  Tabs: ShadcnTabs,
  TabsList: ShadcnTabsList,
  TabsTrigger: ShadcnTabsTrigger,
  TabsContent: ShadcnTabsContent,
  Switch: ShadcnSwitch,
  ScrollArea: ShadcnScrollArea,
})

function ShadcnAdapterExample() {
  // Deliberately not relativeNow() here: that sets the End panel's "Now" toggle on,
  // which disables Amount/Format — a bad first look for a demo meant to show off styling.
  const [start, setStart] = useState(initStart())
  const [end,   setEnd]   = useState(relativeAgo(5, 'Minutes ago'))
  const containerRef = useRef<HTMLDivElement>(null)
  return (
    <div ref={containerRef} className="shadcn-theme-scope">
      <DatetimeRange
        startTime={start}
        endTime={end}
        onChange={(s, e) => { setStart(s); setEnd(e) }}
        uiAdapter={shadcnAdapter}
        portalContainer={containerRef}
      />
      <RangeDisplay start={start} end={end} />
    </div>
  )
}

// calendarMode="inline" composes with uiAdapter — the Absolute-mode calendar renders
// always-expanded, and the trigger/tabs/select/switch it sits inside are still your
// app's own shadcn/ui components. portalContainer + .shadcn-theme-scope (see
// playground-entry.css) keep the date/time segment input's --basekit-radius matching the
// real shadcn Button/Popover next to it, instead of following the sidebar's Radius picker.
function ShadcnAdapterInlineExample() {
  const [start, setStart] = useState(absoluteDate(new Date()))
  const [end,   setEnd]   = useState(absoluteDate(new Date()))
  const containerRef = useRef<HTMLDivElement>(null)
  return (
    <div ref={containerRef} className="shadcn-theme-scope">
      <DatetimeRange
        startTime={start}
        endTime={end}
        onChange={(s, e) => { setStart(s); setEnd(e) }}
        uiAdapter={shadcnAdapter}
        calendarMode="inline"
        showRelative={false}
        showQuickRanges={false}
        portalContainer={containerRef}
      />
      <RangeDisplay start={start} end={end} />
    </div>
  )
}

// ── Custom layout ─────────────────────────────────────────────────────────────
// useDatetimeRange manages draft/commit/validation.
// SidePanel provides the picker UI. Everything else is custom.

const QUICK_CHIPS = [
  { label: 'Last 15m', fn: () => [relativeAgo(15, 'Minutes ago'), relativeNow()] as const },
  { label: 'Last 1h',  fn: () => [relativeAgo(1,  'Hours ago'),   relativeNow()] as const },
  { label: 'Last 24h', fn: () => [relativeAgo(24, 'Hours ago'),   relativeNow()] as const },
  { label: 'Today',    fn: () => {
    const d = new Date(); d.setHours(0, 0, 0, 0)
    return [absoluteDate(d), absoluteDate(new Date())] as const
  }},
]

function CustomLayoutExample() {
  const [start, setStart] = useState(initStart())
  const [end,   setEnd]   = useState(initEnd())

  const {
    draftStart, setDraftStart,
    draftEnd,   setDraftEnd,
    error, clearError,
    onApply, onCancel, onPreset,
  } = useDatetimeRange({ startTime: start, endTime: end, onChange: (s, e) => { setStart(s); setEnd(e) } })

  return (
    <div>
      <div style={{
        display: 'inline-flex',
        flexDirection: 'column',
        border: '1px solid var(--basekit-border)',
        borderRadius: 'var(--basekit-radius)',
        overflow: 'hidden',
        minWidth: 560,
      }}>
        <div style={{ display: 'flex', gap: 6, padding: '8px 16px', borderBottom: '1px solid var(--basekit-border)', background: 'var(--basekit-muted)' }}>
          {QUICK_CHIPS.map(chip => (
            <button key={chip.label} className="datetime-range-btn" data-variant="ghost" data-size="xs"
              onClick={() => { const [s, e] = chip.fn(); onPreset({ label: chip.label, start: s, end: e }) }}>
              {chip.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex' }}>
          <div style={{ padding: '12px 16px' }}>
            <SidePanel title="Start" value={draftStart} onChange={v => { setDraftStart(v); clearError() }} showNow={false} />
          </div>
          <div style={{ width: 1, background: 'var(--basekit-border)' }} />
          <div style={{ padding: '12px 16px' }}>
            <SidePanel title="End" value={draftEnd} onChange={v => { setDraftEnd(v); clearError() }} showNow={false} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderTop: '1px solid var(--basekit-border)' }}>
          {error
            ? <span style={{ fontSize: 11, color: 'var(--basekit-destructive)' }}>Start must be before end.</span>
            : <span />
          }
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="datetime-range-btn" data-variant="ghost" data-size="sm" onClick={onCancel}>Cancel</button>
            <button className="datetime-range-btn" data-variant="outline" data-size="sm"
              onClick={() => alert(`Saved: ${toDisplayString(draftStart, { precision: 'second' })} → ${toDisplayString(draftEnd, { precision: 'second' })}`)}>
              Save as preset
            </button>
            <button className="datetime-range-btn" data-variant="default" data-size="sm" onClick={onApply}>Apply</button>
          </div>
        </div>
      </div>

      <RangeDisplay start={start} end={end} />
    </div>
  )
}

// ── useDatetimeRange hook ─────────────────────────────────────────────────────
// Hook only — no DOM from the library. Custom trigger, custom layout.

function HookExample() {
  const [start, setStart] = useState(initStart())
  const [end,   setEnd]   = useState(initEnd())

  const {
    isOpen, setIsOpen,
    draftStart, setDraftStart,
    draftEnd,   setDraftEnd,
    error, clearError,
    onApply, onCancel, onPreset,
  } = useDatetimeRange({ startTime: start, endTime: end, onChange: (s, e) => { setStart(s); setEnd(e) } })

  return (
    <div>
      <button className="datetime-range-btn" data-variant="outline" onClick={() => setIsOpen(!isOpen)}>
        {toDisplayString(start, { precision: 'second' })} → {toDisplayString(end, { precision: 'second' })}
      </button>

      {isOpen && (
        <div style={{
          marginTop: 8,
          display: 'inline-flex',
          flexDirection: 'column',
          border: '1px solid var(--basekit-border)',
          borderRadius: 'var(--basekit-radius)',
          overflow: 'hidden',
          background: 'var(--basekit-popover)',
        }}>
          <div style={{ display: 'flex', gap: 4, padding: '8px 12px', borderBottom: '1px solid var(--basekit-border)', background: 'var(--basekit-muted)' }}>
            {QUICK_PRESETS.slice(0, 4).map(p => (
              <button key={p.label} className="datetime-range-btn" data-variant="ghost" data-size="xs"
                onClick={() => onPreset(p)}>
                {p.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex' }}>
            <div style={{ padding: '12px 16px' }}>
              <SidePanel title="Start" value={draftStart} onChange={v => { setDraftStart(v); clearError() }} showNow={false} />
            </div>
            <div style={{ width: 1, background: 'var(--basekit-border)' }} />
            <div style={{ padding: '12px 16px' }}>
              <SidePanel title="End" value={draftEnd} onChange={v => { setDraftEnd(v); clearError() }} showNow={false} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderTop: '1px solid var(--basekit-border)' }}>
            {error
              ? <span style={{ fontSize: 11, color: 'var(--basekit-destructive)' }}>Start must be before end.</span>
              : <span />
            }
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="datetime-range-btn" data-variant="ghost" data-size="sm" onClick={onCancel}>Cancel</button>
              <button className="datetime-range-btn" data-variant="default" data-size="sm" onClick={onApply}>Apply</button>
            </div>
          </div>
        </div>
      )}

      <RangeDisplay start={start} end={end} />
    </div>
  )
}

// ── Tab ───────────────────────────────────────────────────────────────────────

function Block({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{title}</h2>
      <p style={{ fontSize: 11, color: 'var(--basekit-muted-foreground)', marginBottom: 14 }}>{description}</p>
      {children}
    </section>
  )
}

export function DatetimeRangeComposableTab() {
  return (
    <div style={{ maxWidth: 860, paddingBottom: 64, display: 'flex', flexDirection: 'column', gap: 48 }}>

      <Block title="Default" description="<DatetimeRange /> out of the box.">
        <DefaultExample />
      </Block>

      <Block
        title="Custom theme"
        description="Same component — different visual via --basekit-* token overrides. portalContainer scopes the popup inside the wrapper."
      >
        <CustomThemeExample />
      </Block>

      <Block
        title="shadcn adapter"
        description="uiAdapter swaps the component implementation itself — Button/Popover/Select/Tabs/Switch/Input all render as your app's own shadcn/ui components (see playground/src/components/ui/*.tsx), not just a re-themed basekit control."
      >
        <ShadcnAdapterExample />
      </Block>

      <Block
        title="shadcn adapter + inline calendar"
        description="calendarMode='inline' and uiAdapter combine freely — the Absolute-mode calendar is always expanded (no popover-in-popover), rendered with your app's own shadcn/ui components."
      >
        <ShadcnAdapterInlineExample />
      </Block>

      <Block
        title="Custom layout"
        description="useDatetimeRange handles draft/commit/validation. SidePanel renders the picker. Everything else — layout, chips, footer — is yours."
      >
        <CustomLayoutExample />
      </Block>

      <Block
        title="useDatetimeRange hook"
        description="Hook only, no DOM from the library. Custom trigger, custom panel, close behavior all wired manually."
      >
        <HookExample />
      </Block>

    </div>
  )
}
