import React, { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { cn } from './lib/utils'
import { Button } from './ui/button'
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { useCronInput } from './useCronInput'
import {
  toDisplayString,
  fromCronExpression,
  validateCronExpression,
  switchTab,
} from './cron-utils'
import type { CronValue, CronTab, CronInputLabels } from './types'
import { DEFAULT_LABELS, DEFAULT_VALUE } from './types'

// ─── NumberStepper ────────────────────────────────────────────────────────────

interface NumberStepperProps {
  value: number
  min: number
  max: number
  padded?: boolean
  onChange: (n: number) => void
}

function NumberStepper({ value, min, max, padded = true, onChange }: NumberStepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  const display = padded ? String(value).padStart(2, '0') : String(value)

  return (
    <div className="ci-stepper">
      <button
        type="button"
        className="ci-stepper-btn"
        onClick={() => onChange(clamp(value - 1))}
        tabIndex={-1}
        aria-label="Decrease"
      >−</button>
      <input
        type="text"
        inputMode="numeric"
        className="ci-stepper-input"
        value={display}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, '')
          if (raw === '') return
          const n = parseInt(raw, 10)
          if (!isNaN(n)) onChange(clamp(n))
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp')   { e.preventDefault(); onChange(clamp(value + 1)) }
          if (e.key === 'ArrowDown') { e.preventDefault(); onChange(clamp(value - 1)) }
        }}
        onFocus={(e) => e.currentTarget.select()}
      />
      <button
        type="button"
        className="ci-stepper-btn"
        onClick={() => onChange(clamp(value + 1))}
        tabIndex={-1}
        aria-label="Increase"
      >+</button>
    </div>
  )
}

// ─── TimePicker ───────────────────────────────────────────────────────────────

interface TimePickerProps {
  hour: number
  minute: number
  onChange: (hour: number, minute: number) => void
}

function TimePicker({ hour, minute, onChange }: TimePickerProps) {
  return (
    <div className="ci-time">
      <NumberStepper value={hour}   min={0} max={23} onChange={h => onChange(h, minute)} />
      <span className="ci-time-sep">:</span>
      <NumberStepper value={minute} min={0} max={59} onChange={m => onChange(hour, m)} />
    </div>
  )
}

// ─── DayChips ─────────────────────────────────────────────────────────────────

const DAYS = [
  { index: 1, label: 'Mo' },
  { index: 2, label: 'Tu' },
  { index: 3, label: 'We' },
  { index: 4, label: 'Th' },
  { index: 5, label: 'Fr' },
  { index: 6, label: 'Sa' },
  { index: 0, label: 'Su' },
]

interface DayChipsProps {
  days: number[]
  onChange: (days: number[]) => void
}

function DayChips({ days, onChange }: DayChipsProps) {
  const toggle = (day: number) => {
    const next = days.includes(day)
      ? days.filter(d => d !== day)
      : [...days, day].sort((a, b) => a - b)
    onChange(next)
  }

  return (
    <div className="ci-day-chips">
      {DAYS.map(d => (
        <button
          key={d.index}
          type="button"
          className={cn('ci-day-chip', days.includes(d.index) && 'ci-day-chip--active')}
          onClick={() => toggle(d.index)}
        >
          {d.label}
        </button>
      ))}
    </div>
  )
}

// ─── IntervalTab ──────────────────────────────────────────────────────────────

interface IntervalTabProps {
  every: number
  unit: 'minute' | 'hour' | 'day'
  onChange: (every: number, unit: 'minute' | 'hour' | 'day') => void
}

function IntervalTab({ every, unit, onChange }: IntervalTabProps) {
  const maxMap = { minute: 59, hour: 23, day: 30 } as const

  return (
    <div className="ci-tab-body">
      <div className="ci-interval-row">
        <span className="ci-label">Every</span>
        <NumberStepper
          value={every}
          min={1}
          max={maxMap[unit]}
          padded={false}
          onChange={n => onChange(n, unit)}
        />
        <div className="ci-unit-seg">
          {(['minute', 'hour', 'day'] as const).map(u => (
            <button
              key={u}
              type="button"
              className={cn('ci-unit-btn', unit === u && 'ci-unit-btn--active')}
              onClick={() => onChange(Math.min(every, maxMap[u]), u)}
            >
              {u === 'minute' ? 'min' : u === 'hour' ? 'hr' : 'day'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── DailyTab ─────────────────────────────────────────────────────────────────

interface DailyTabProps {
  hour: number
  minute: number
  onChange: (hour: number, minute: number) => void
}

function DailyTab({ hour, minute, onChange }: DailyTabProps) {
  return (
    <div className="ci-tab-body">
      <div className="ci-field-row">
        <span className="ci-label">Every day at</span>
        <TimePicker hour={hour} minute={minute} onChange={onChange} />
      </div>
    </div>
  )
}

// ─── WeeklyTab ────────────────────────────────────────────────────────────────

interface WeeklyTabProps {
  days: number[]
  hour: number
  minute: number
  onChange: (days: number[], hour: number, minute: number) => void
}

function WeeklyTab({ days, hour, minute, onChange }: WeeklyTabProps) {
  return (
    <div className="ci-tab-body">
      <div className="ci-field-row ci-field-row--col">
        <span className="ci-label">Repeat on</span>
        <DayChips days={days} onChange={d => onChange(d, hour, minute)} />
      </div>
      <div className="ci-field-row ci-field-row--mt">
        <span className="ci-label">At</span>
        <TimePicker hour={hour} minute={minute} onChange={(h, m) => onChange(days, h, m)} />
      </div>
    </div>
  )
}

// ─── MonthlyTab ───────────────────────────────────────────────────────────────

interface MonthlyTabProps {
  day: number
  hour: number
  minute: number
  onChange: (day: number, hour: number, minute: number) => void
}

function MonthlyTab({ day, hour, minute, onChange }: MonthlyTabProps) {
  return (
    <div className="ci-tab-body">
      <div className="ci-field-row">
        <span className="ci-label">On day</span>
        <NumberStepper
          value={day}
          min={1}
          max={28}
          padded={false}
          onChange={d => onChange(d, hour, minute)}
        />
        <span className="ci-label">of every month</span>
      </div>
      <div className="ci-field-row ci-field-row--mt">
        <span className="ci-label">At</span>
        <TimePicker hour={hour} minute={minute} onChange={(h, m) => onChange(day, h, m)} />
      </div>
    </div>
  )
}

// ─── CustomTab ────────────────────────────────────────────────────────────────

interface CustomTabProps {
  expression: string
  onChange: (expression: string) => void
}

function CustomTab({ expression, onChange }: CustomTabProps) {
  const [input, setInput] = useState(expression)

  useEffect(() => { setInput(expression) }, [expression])

  const parts   = input.trim().split(/\s+/)
  const isValid = validateCronExpression(input)
  const parsed  = isValid && parts.length === 5 ? fromCronExpression(input) : null
  const FIELD_LABELS = ['min', 'hour', 'dom', 'mon', 'dow']

  return (
    <div className="ci-tab-body ci-custom">
      <div className={cn('ci-custom-wrap', input && !isValid && 'ci-custom-wrap--error')}>
        <input
          type="text"
          className="ci-custom-input"
          value={input}
          placeholder="* * * * *"
          spellCheck={false}
          onChange={(e) => {
            setInput(e.target.value)
            onChange(e.target.value)
          }}
        />
        {input && (
          <span className={cn('ci-custom-badge', isValid ? 'ci-custom-badge--ok' : 'ci-custom-badge--err')}>
            {isValid ? '✓' : '✗'}
          </span>
        )}
      </div>

      {isValid && parsed && parsed.type !== 'custom' && (
        <p className="ci-custom-desc">{toDisplayString(parsed)}</p>
      )}

      {parts.length === 5 && (
        <div className="ci-custom-fields">
          {FIELD_LABELS.map((label, i) => (
            <div key={label} className="ci-custom-field">
              <span className="ci-custom-field-val">{parts[i]}</span>
              <span className="ci-custom-field-lbl">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── CronInput ────────────────────────────────────────────────────────────────

export interface CronInputProps {
  value?: CronValue
  defaultValue?: CronValue
  onChange?: (value: CronValue) => void
  disabled?: boolean
  labels?: CronInputLabels
  popoverAlign?: 'start' | 'center' | 'end'
  popoverSide?: 'top' | 'bottom' | 'left' | 'right'
  renderTrigger?: (
    triggerProps: React.ComponentPropsWithRef<'button'>,
    state: { open: boolean; value: CronValue },
  ) => React.ReactElement
  portalContainer?: React.RefObject<HTMLElement | null> | HTMLElement | null
  className?: string
}

export function CronInput({
  value: valueProp,
  defaultValue = DEFAULT_VALUE,
  onChange,
  disabled = false,
  labels: labelsProp,
  popoverAlign = 'start',
  popoverSide = 'bottom',
  renderTrigger,
  portalContainer,
  className,
}: CronInputProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }

  const [uncontrolled, setUncontrolled] = useState<CronValue>(defaultValue)
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp! : uncontrolled

  const handleChange = (next: CronValue) => {
    if (!isControlled) setUncontrolled(next)
    onChange?.(next)
  }

  const { isOpen, setIsOpen, draft, setDraft, onApply, onCancel } = useCronInput({
    value,
    onChange: handleChange,
  })

  const handleTabChange = (tab: string) => {
    setDraft(switchTab(draft, tab as CronTab))
  }

  const handleDraft = (next: CronValue) => setDraft(next)

  return (
    <Popover open={isOpen} onOpenChange={disabled ? undefined : setIsOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={(triggerProps) =>
          renderTrigger ? (
            renderTrigger(triggerProps, { open: isOpen, value })
          ) : (
            <button
              {...triggerProps}
              disabled={disabled}
              className={cn('ci-trigger', isOpen && 'ci-trigger--open', className)}
            >
              <Clock size={13} className="ci-trigger-icon" />
              <span className="ci-trigger-label">{toDisplayString(value)}</span>
            </button>
          )
        }
      />

      <PopoverContent
        align={popoverAlign}
        side={popoverSide}
        sideOffset={4}
        container={portalContainer}
      >
        <Tabs value={draft.type} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="interval">{labels.interval}</TabsTrigger>
            <TabsTrigger value="daily">{labels.daily}</TabsTrigger>
            <TabsTrigger value="weekly">{labels.weekly}</TabsTrigger>
            <TabsTrigger value="monthly">{labels.monthly}</TabsTrigger>
            <TabsTrigger value="custom">{labels.custom}</TabsTrigger>
          </TabsList>

          <TabsContent value="interval">
            {draft.type === 'interval' && (
              <IntervalTab
                every={draft.every}
                unit={draft.unit}
                onChange={(every, unit) => handleDraft({ type: 'interval', every, unit })}
              />
            )}
          </TabsContent>

          <TabsContent value="daily">
            {draft.type === 'daily' && (
              <DailyTab
                hour={draft.hour}
                minute={draft.minute}
                onChange={(hour, minute) => handleDraft({ type: 'daily', hour, minute })}
              />
            )}
          </TabsContent>

          <TabsContent value="weekly">
            {draft.type === 'weekly' && (
              <WeeklyTab
                days={draft.days}
                hour={draft.hour}
                minute={draft.minute}
                onChange={(days, hour, minute) => handleDraft({ type: 'weekly', days, hour, minute })}
              />
            )}
          </TabsContent>

          <TabsContent value="monthly">
            {draft.type === 'monthly' && (
              <MonthlyTab
                day={draft.day}
                hour={draft.hour}
                minute={draft.minute}
                onChange={(day, hour, minute) => handleDraft({ type: 'monthly', day, hour, minute })}
              />
            )}
          </TabsContent>

          <TabsContent value="custom">
            {draft.type === 'custom' && (
              <CustomTab
                expression={draft.expression}
                onChange={(expression) => handleDraft({ type: 'custom', expression })}
              />
            )}
          </TabsContent>
        </Tabs>

        <div className="ci-footer">
          <span className="ci-preview">{toDisplayString(draft)}</span>
          <div className="ci-footer-actions">
            <Button variant="outline" size="sm" onClick={onCancel}>{labels.cancel}</Button>
            <Button
              size="sm"
              onClick={onApply}
              disabled={draft.type === 'custom' && !validateCronExpression(draft.expression)}
            >
              {labels.apply}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
