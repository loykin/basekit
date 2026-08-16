import { useState } from 'react'
import {
  DatetimeRange,
  DateTimeRangeValue,
  relativeAgo,
  relativeNow,
  absoluteDate,
  toTimestamp,
  toTimestampMs,
  toUrlString,
  toDisplayString,
} from '@loykin/datetime-range'
import '@loykin/datetime-range/styles'
import type { TokenGroupDef } from '../components/TokensPanel'

export const TOKEN_GROUPS: TokenGroupDef[] = [
  {
    title: 'Surfaces',
    tokens: [
      { key: '--basekit-background', type: 'color' },
      { key: '--basekit-foreground', type: 'color' },
      { key: '--basekit-popover', type: 'color', description: 'Popup panel background' },
      { key: '--basekit-popover-foreground', type: 'color' },
      { key: '--basekit-muted', type: 'color', description: 'Hover / subtle backgrounds' },
      { key: '--basekit-muted-foreground', type: 'color', description: 'Placeholder / de-emphasized text' },
    ],
  },
  {
    title: 'Accents',
    tokens: [
      { key: '--basekit-primary', type: 'color', description: 'Apply button, selected date highlight' },
      { key: '--basekit-primary-foreground', type: 'color' },
      { key: '--basekit-secondary', type: 'color', description: 'Secondary button background' },
      { key: '--basekit-secondary-foreground', type: 'color' },
      { key: '--basekit-accent', type: 'color', description: 'Active / hovered item background' },
      { key: '--basekit-accent-foreground', type: 'color' },
      { key: '--basekit-destructive', type: 'color', description: 'Out-of-range / error indication' },
    ],
  },
  {
    title: 'Borders & Shape',
    tokens: [
      { key: '--basekit-border', type: 'color', description: 'Dividers, panel border' },
      { key: '--basekit-input', type: 'color', description: 'Input field border' },
      { key: '--basekit-ring', type: 'color', description: 'Focus ring' },
      { key: '--basekit-radius', type: 'dimension', description: 'Border radius', rangeMin: 0, rangeMax: 16 },
    ],
  },
]

function useRange(
  initStart: DateTimeRangeValue = relativeAgo(1, 'Hours ago'),
  initEnd: DateTimeRangeValue = relativeNow(),
) {
  const [start, setStart] = useState(initStart)
  const [end, setEnd] = useState(initEnd)
  return {
    start, end,
    onChange: (s: DateTimeRangeValue, e: DateTimeRangeValue) => { setStart(s); setEnd(e) },
  }
}

function Code({ children }: { children: string }) {
  return (
    <pre className="text-[11px] font-mono bg-muted text-muted-foreground px-3 py-2 overflow-x-auto whitespace-pre">
      {children.trim()}
    </pre>
  )
}

function Value({ start, end }: { start: DateTimeRangeValue; end: DateTimeRangeValue }) {
  return (
    <table className="text-[11px] font-mono w-full border-collapse">
      <tbody>
        {[
          ['url',       `${toUrlString(start)}  ->  ${toUrlString(end)}`],
          ['unix (s)',  `${toTimestamp(start)}  ->  ${toTimestamp(end)}`],
          ['unix (ms)', `${toTimestampMs(start)}  ->  ${toTimestampMs(end)}`],
          ['display',   `${toDisplayString(start)}  ->  ${toDisplayString(end)}`],
        ].map(([label, val]) => (
          <tr key={label} className="border-t border-border">
            <td className="py-1 pr-4 text-muted-foreground w-20 shrink-0">{label}</td>
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

const weekAgo  = absoluteDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
const today    = absoluteDate(new Date())
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
yesterday.setHours(0, 0, 0, 0)
const tomorrow  = new Date(Date.now() + 24 * 60 * 60 * 1000)
tomorrow.setHours(23, 59, 59, 0)

export function DatetimeRangePreview() {
  const range = useRange()
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] text-muted-foreground mb-2">DatetimeRange</p>
        <DatetimeRange startTime={range.start} endTime={range.end} onChange={range.onChange} />
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground mb-2">Button variants</p>
        <div className="flex flex-wrap gap-2">
          <button className="dr-btn" data-variant="default" data-size="sm">Primary</button>
          <button className="dr-btn" data-variant="outline" data-size="sm">Outline</button>
          <button className="dr-btn" data-variant="secondary" data-size="sm">Secondary</button>
          <button className="dr-btn" data-variant="ghost" data-size="sm">Ghost</button>
          <button className="dr-btn" data-variant="destructive" data-size="sm">Destructive</button>
        </div>
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground mb-2">Input</p>
        <input className="dr-input" placeholder="Placeholder text..." style={{ maxWidth: 280 }} readOnly />
      </div>
    </div>
  )
}

export function DatetimeRangeTab() {
  const full          = useRange()
  const noQuick       = useRange()
  const absDatetime   = useRange()
  const absDateOnly   = useRange(weekAgo, today)
  const relOnly       = useRange()
  const relQuick      = useRange()
  const limitedFmt    = useRange()
  const noNow         = useRange()
  const minMax        = useRange(absoluteDate(yesterday), absoluteDate(tomorrow))
  const i18n          = useRange()
  const customTrigger = useRange()
  const disabledDemo  = useRange()
  const calendarInline = useRange()

  return (
    <div className="flex flex-col gap-4 max-w-3xl">

      <Demo
        title="Full (default)"
        description="Quick ranges panel + Absolute tab + Relative tab"
        code={`<DatetimeRange
  startTime={start}
  endTime={end}
  onChange={onChange}
/>`}
      >
        <DatetimeRange startTime={full.start} endTime={full.end} onChange={full.onChange} />
        <Value start={full.start} end={full.end} />
      </Demo>

      <Demo
        title="No Quick Ranges"
        description="Hide the quick presets left panel"
        code={`<DatetimeRange
  showQuickRanges={false}
/>`}
      >
        <DatetimeRange
          startTime={noQuick.start} endTime={noQuick.end} onChange={noQuick.onChange}
          showQuickRanges={false}
        />
        <Value start={noQuick.start} end={noQuick.end} />
      </Demo>

      <Demo
        title="Absolute Only — with time"
        description="No relative tab, no quick ranges. Full datetime input."
        code={`<DatetimeRange
  showRelative={false}
  showQuickRanges={false}
/>`}
      >
        <DatetimeRange
          startTime={absDatetime.start} endTime={absDatetime.end} onChange={absDatetime.onChange}
          showRelative={false}
          showQuickRanges={false}
        />
        <Value start={absDatetime.start} end={absDatetime.end} />
      </Demo>

      <Demo
        title="Absolute Only — date only"
        description="No time fields. Useful for date-range pickers."
        code={`<DatetimeRange
  showRelative={false}
  showQuickRanges={false}
  precision="date"
/>`}
      >
        <DatetimeRange
          startTime={absDateOnly.start} endTime={absDateOnly.end} onChange={absDateOnly.onChange}
          showRelative={false}
          showQuickRanges={false}
          precision="date"
        />
        <Value start={absDateOnly.start} end={absDateOnly.end} />
      </Demo>

      <Demo
        title="Relative Only — no quick ranges"
        description="Relative tab only. No absolute, no quick panel."
        code={`<DatetimeRange
  showAbsolute={false}
  showQuickRanges={false}
/>`}
      >
        <DatetimeRange
          startTime={relOnly.start} endTime={relOnly.end} onChange={relOnly.onChange}
          showAbsolute={false}
          showQuickRanges={false}
        />
        <Value start={relOnly.start} end={relOnly.end} />
      </Demo>

      <Demo
        title="Relative Only — with quick ranges"
        description="Quick presets + relative tab only. No absolute tab."
        code={`<DatetimeRange
  showAbsolute={false}
/>`}
      >
        <DatetimeRange
          startTime={relQuick.start} endTime={relQuick.end} onChange={relQuick.onChange}
          showAbsolute={false}
        />
        <Value start={relQuick.start} end={relQuick.end} />
      </Demo>

      <Demo
        title="Limited Relative Formats"
        description="Restrict available time units in the relative picker."
        code={`<DatetimeRange
  relativeFormats={['Minutes ago', 'Hours ago', 'Days ago']}
  showNow={false}
/>`}
      >
        <DatetimeRange
          startTime={limitedFmt.start} endTime={limitedFmt.end} onChange={limitedFmt.onChange}
          relativeFormats={['Minutes ago', 'Hours ago', 'Days ago']}
          showNow={false}
        />
        <Value start={limitedFmt.start} end={limitedFmt.end} />
      </Demo>

      <Demo
        title="No Now Toggle"
        description="Hide the Now switch in the relative panel."
        code={`<DatetimeRange
  showNow={false}
/>`}
      >
        <DatetimeRange
          startTime={noNow.start} endTime={noNow.end} onChange={noNow.onChange}
          showNow={false}
        />
        <Value start={noNow.start} end={noNow.end} />
      </Demo>

      <Demo
        title="Min / Max Constraint"
        description="Restrict selectable range to yesterday–tomorrow."
        code={`<DatetimeRange
  min={yesterday}
  max={tomorrow}
  showRelative={false}
  showQuickRanges={false}
/>`}
      >
        <DatetimeRange
          startTime={minMax.start} endTime={minMax.end} onChange={minMax.onChange}
          min={yesterday}
          max={tomorrow}
          showRelative={false}
          showQuickRanges={false}
        />
        <Value start={minMax.start} end={minMax.end} />
      </Demo>

      <Demo
        title="Custom Labels (i18n)"
        description="Override all UI text with custom English terminology."
        code={`<DatetimeRange
  labels={{
    start: 'From', end: 'To',
    quickRanges: 'Presets',
    apply: 'Confirm', cancel: 'Dismiss',
    absolute: 'Fixed', relative: 'Offset',
    now: 'Current time', nowDescription: 'Set to current time',
    amount: 'Quantity',
  }}
/>`}
      >
        <DatetimeRange
          startTime={i18n.start} endTime={i18n.end} onChange={i18n.onChange}
          labels={{
            start: 'From', end: 'To',
            quickRanges: 'Presets',
            apply: 'Confirm', cancel: 'Dismiss',
            absolute: 'Fixed', relative: 'Offset',
            now: 'Current time', nowDescription: 'Set to current time',
            amount: 'Quantity',
          }}
        />
        <Value start={i18n.start} end={i18n.end} />
      </Demo>

      <Demo
        title="Custom Trigger"
        description="renderTrigger for a fully custom trigger element."
        code={`<DatetimeRange
  renderTrigger={(triggerProps, { startTime, endTime }) => (
    <button {...triggerProps} className="...">
      {toDisplayString(startTime)} ~ {toDisplayString(endTime)}
    </button>
  )}
/>`}
      >
        <DatetimeRange
          startTime={customTrigger.start} endTime={customTrigger.end} onChange={customTrigger.onChange}
          renderTrigger={(triggerProps, { startTime, endTime }) => (
            <button
              {...triggerProps}
              className="text-xs border-b border-dashed border-foreground/40 hover:border-foreground/80 pb-0.5 transition-colors"
            >
              {toDisplayString(startTime)} ~ {toDisplayString(endTime)}
            </button>
          )}
        />
        <Value start={customTrigger.start} end={customTrigger.end} />
      </Demo>

      <Demo
        title="Disabled"
        description="Entire component non-interactive."
        code={`<DatetimeRange disabled />`}
      >
        <DatetimeRange
          startTime={disabledDemo.start} endTime={disabledDemo.end} onChange={disabledDemo.onChange}
          disabled
        />
      </Demo>

      <Demo
        title="Calendar Mode — inline"
        description="Show the Absolute-mode calendar always expanded, shadcn-style, instead of behind a popover button. Useful for dashboard filter bars where a wide layout is already available."
        code={`<DatetimeRange
  calendarMode="inline"
  showRelative={false}
  showQuickRanges={false}
/>`}
      >
        <DatetimeRange
          startTime={calendarInline.start} endTime={calendarInline.end} onChange={calendarInline.onChange}
          calendarMode="inline"
          showRelative={false}
          showQuickRanges={false}
        />
        <Value start={calendarInline.start} end={calendarInline.end} />
      </Demo>

    </div>
  )
}
