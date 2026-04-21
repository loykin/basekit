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
        description="Override all UI text — Korean example."
        code={`<DatetimeRange
  labels={{
    start: '시작', end: '종료',
    quickRanges: '빠른 선택',
    apply: '적용', cancel: '취소',
    absolute: '절대', relative: '상대',
    now: '현재', nowDescription: '현재 시간으로 설정',
    amount: '값',
  }}
/>`}
      >
        <DatetimeRange
          startTime={i18n.start} endTime={i18n.end} onChange={i18n.onChange}
          labels={{
            start: '시작', end: '종료',
            quickRanges: '빠른 선택',
            apply: '적용', cancel: '취소',
            absolute: '절대', relative: '상대',
            now: '현재', nowDescription: '현재 시간으로 설정',
            amount: '값',
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

    </div>
  )
}
