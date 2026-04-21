import React, { useState, useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import { cn } from './lib/utils';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { DateTimePanel } from './DatetimePanel';
import { DatetimeSegmentInput } from './DatetimeSegmentInput';
import {
  DateTimeRangeValue,
  DateTimeRelativeFormat,
  ValidationErrorType,
  QuickPreset,
  DatetimePrecision,
  DatetimeRangeLabels,
  DEFAULT_LABELS,
} from './types';
import {
  toDate,
  toDisplayString,
  validateRange,
  absoluteDate,
  RELATIVE_FORMATS,
  QUICK_PRESETS,
} from './datetime-utils';

// ─── RelativeSidePanel ────────────────────────────────────────────────────────

interface RelativeSidePanelProps {
  value: DateTimeRangeValue;
  onChange: (value: DateTimeRangeValue) => void;
  relativeFormats: DateTimeRelativeFormat[];
  showNow: boolean;
  labels: Required<DatetimeRangeLabels>;
}

function RelativeSidePanel({ value, onChange, relativeFormats, showNow, labels }: RelativeSidePanelProps) {
  const [numValue, setNumValue] = useState<string>(
    value.relativeValue !== undefined ? String(value.relativeValue) : '5',
  );
  const [format, setFormat] = useState<DateTimeRelativeFormat>(
    value.relativeFormat ?? relativeFormats[0] ?? 'Minutes ago',
  );
  const [isNow, setIsNow] = useState<boolean>(value.relativeNow ?? false);

  useEffect(() => {
    if (value.relativeNow) {
      setIsNow(true);
    } else {
      setIsNow(false);
      if (value.relativeValue !== undefined) setNumValue(String(value.relativeValue));
      if (value.relativeFormat) setFormat(value.relativeFormat);
    }
  }, [value]);

  const emit = (next: { numValue: string; format: DateTimeRelativeFormat; isNow: boolean }) => {
    if (next.isNow) {
      onChange({ type: 'relative', relativeNow: true });
    } else {
      onChange({
        type: 'relative',
        relativeValue: next.numValue,
        relativeFormat: next.format,
        relativeNow: false,
      });
    }
  };

  return (
    <div className="flex flex-col gap-3 mt-3">
      <div>
        <p className="text-[11px] text-muted-foreground mb-1.5">{labels.amount}</p>
        <div className="flex flex-row gap-1.5">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="h-8 w-20 text-xs"
            disabled={isNow}
            value={numValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const val = e.target.value;
              if (/^\d*$/.test(val)) {
                setNumValue(val);
                emit({ numValue: val, format, isNow });
              }
            }}
            onWheel={(e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur()}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
            }}
          />
          <Select
            disabled={isNow}
            value={format}
            onValueChange={(v) => {
              const f = v as DateTimeRelativeFormat;
              setFormat(f);
              emit({ numValue, format: f, isNow });
            }}
          >
            <SelectTrigger className="h-8 text-xs text-left leading-tight">
              <SelectValue>{format}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {relativeFormats.map((f) => (
                <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {showNow && (
        <div className="flex flex-row gap-2 items-center pt-0.5">
          <Switch
            checked={isNow}
            onCheckedChange={(checked: boolean) => {
              setIsNow(checked);
              emit({ numValue, format, isNow: checked });
            }}
          />
          <div className="flex flex-col">
            <label className="text-xs font-medium">{labels.now}</label>
            <span className="text-[11px] text-muted-foreground">{labels.nowDescription}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SidePanel ────────────────────────────────────────────────────────────────

interface SidePanelProps {
  title: string;
  value: DateTimeRangeValue;
  compareValue?: DateTimeRangeValue;
  onChange: (value: DateTimeRangeValue) => void;
  showAbsolute: boolean;
  showRelative: boolean;
  precision: DatetimePrecision;
  relativeFormats: DateTimeRelativeFormat[];
  showNow: boolean;
  min?: Date;
  max?: Date;
  timezone?: string;
  use12HourFormat?: boolean;
  labels: Required<DatetimeRangeLabels>;
}

// ─── AbsoluteContent ──────────────────────────────────────────────────────────

function AbsoluteContent({
  value,
  compareValue,
  title,
  onChange,
  precision,
  min,
  max,
  timezone,
  use12HourFormat,
}: Pick<SidePanelProps, 'value' | 'compareValue' | 'title' | 'onChange' | 'precision' | 'min' | 'max' | 'timezone' | 'use12HourFormat'>) {
  const compareDate = compareValue ? toDate(compareValue) : undefined;
  const [calendarVisible, setCalendarVisible] = useState(false);
  const absoluteDate_ = value.type === 'absolute' ? toDate(value) : new Date();

  useEffect(() => {
    if (value.type !== 'absolute') setCalendarVisible(false);
  }, [value.type]);

  return (
    <div className="flex flex-col gap-1.5 mt-3">
      <div className="flex items-center gap-1.5">
        <DatetimeSegmentInput
          value={absoluteDate_}
          onChange={(d) => onChange(absoluteDate(d))}
          className="flex-1"
          precision={precision}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn('h-8 w-8 shrink-0', calendarVisible && 'bg-accent border-foreground')}
          onClick={() => setCalendarVisible(v => !v)}
          title="Pick from calendar"
        >
          <CalendarDays size={14} />
        </Button>
      </div>
      {calendarVisible && (
        <div className="border-t pt-2 mt-1">
          <DateTimePanel
            value={value.type === 'absolute' ? toDate(value) : undefined}
            compareValue={compareDate}
            title={title}
            immediate
            precision={precision}
            min={min}
            max={max}
            timezone={timezone}
            use12HourFormat={use12HourFormat}
            onChangeAction={(d) => {
              if (!d) return;
              onChange(absoluteDate(d));
            }}
          />
        </div>
      )}
    </div>
  );
}

function SidePanel({
  title,
  value,
  compareValue,
  onChange,
  showAbsolute,
  showRelative,
  precision,
  relativeFormats,
  showNow,
  min,
  max,
  timezone,
  use12HourFormat,
  labels,
}: SidePanelProps) {
  useEffect(() => {
    if (!showRelative && value.type === 'relative') {
      onChange(absoluteDate(new Date()));
    } else if (!showAbsolute && value.type === 'absolute') {
      onChange({ type: 'relative', relativeValue: '5', relativeFormat: relativeFormats[0] ?? 'Minutes ago' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRelative, showAbsolute]);

  const hasBothModes = showAbsolute && showRelative;

  const absoluteContent = (
    <AbsoluteContent
      value={value}
      compareValue={compareValue}
      title={title}
      onChange={onChange}
      precision={precision}
      min={min}
      max={max}
      timezone={timezone}
      use12HourFormat={use12HourFormat}
    />
  );

  const relativeContent = (
    <RelativeSidePanel
      value={value}
      onChange={onChange}
      relativeFormats={relativeFormats}
      showNow={showNow}
      labels={labels}
    />
  );

  return (
    <div className="flex flex-col w-[268px]">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest pb-2">
        {title}
      </p>

      {hasBothModes ? (
        <Tabs
          value={value.type}
          className="flex-col"
          onValueChange={(t: string) => {
            if (t === 'absolute') {
              onChange(absoluteDate(value.type === 'absolute' ? toDate(value) : new Date()));
            } else if (value.type !== 'relative') {
              onChange({ type: 'relative', relativeValue: '5', relativeFormat: relativeFormats[0] ?? 'Minutes ago' });
            }
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="absolute">{labels.absolute}</TabsTrigger>
            <TabsTrigger value="relative">{labels.relative}</TabsTrigger>
          </TabsList>
          <TabsContent value="absolute">{absoluteContent}</TabsContent>
          <TabsContent value="relative">{relativeContent}</TabsContent>
        </Tabs>
      ) : showAbsolute ? absoluteContent : relativeContent}
    </div>
  );
}

// ─── DatetimeRange ────────────────────────────────────────────────────────────

export interface DatetimeRangeProps {
  startTime: DateTimeRangeValue;
  endTime: DateTimeRangeValue;
  onChange: (startTime: DateTimeRangeValue, endTime: DateTimeRangeValue) => void;
  /** Quick presets shown in the left panel. @default QUICK_PRESETS */
  quickPresets?: QuickPreset[];
  /** Show the quick ranges left panel. @default true */
  showQuickRanges?: boolean;
  /** Show the Absolute tab. @default true */
  showAbsolute?: boolean;
  /** Show the Relative tab. @default true */
  showRelative?: boolean;
  /** Controls time field granularity in absolute mode. @default 'second' */
  precision?: DatetimePrecision;
  /** Available units in the relative picker. @default RELATIVE_FORMATS */
  relativeFormats?: DateTimeRelativeFormat[];
  /** Minimum selectable date. */
  min?: Date;
  /** Maximum selectable date. */
  max?: Date;
  /** IANA timezone string (e.g. "Asia/Seoul"). */
  timezone?: string;
  /** Use 12-hour clock format. @default false */
  use12HourFormat?: boolean;
  /** Show the "Now" toggle in relative mode. @default true */
  showNow?: boolean;
  /** Disable the entire component. @default false */
  disabled?: boolean;
  /** Override UI labels for i18n. */
  labels?: DatetimeRangeLabels;
  /** Popover alignment relative to trigger. @default "start" */
  popoverAlign?: 'start' | 'center' | 'end';
  /** Popover side relative to trigger. @default "bottom" */
  popoverSide?: 'top' | 'bottom' | 'left' | 'right';
  /**
   * Render a custom trigger element.
   * `triggerProps` must be spread onto the interactive element so the popover works correctly.
   */
  renderTrigger?: (
    triggerProps: React.ComponentPropsWithRef<'button'>,
    state: { open: boolean; startTime: DateTimeRangeValue; endTime: DateTimeRangeValue },
  ) => React.ReactElement;
  className?: string;
}

export function DatetimeRange({
  startTime,
  endTime,
  onChange,
  quickPresets = QUICK_PRESETS,
  showQuickRanges = true,
  showAbsolute = true,
  showRelative = true,
  precision = 'second' as DatetimePrecision,
  relativeFormats = RELATIVE_FORMATS,
  min,
  max,
  timezone,
  use12HourFormat = false,
  showNow = true,
  disabled = false,
  labels: labelsProp,
  popoverAlign = 'start',
  popoverSide = 'bottom',
  renderTrigger,
  className,
}: DatetimeRangeProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };

  const [isOpen, setIsOpen] = useState(false);
  const [draftStart, setDraftStart] = useState<DateTimeRangeValue>(startTime);
  const [draftEnd, setDraftEnd] = useState<DateTimeRangeValue>(endTime);
  const [error, setError] = useState<ValidationErrorType>(null);

  useEffect(() => {
    if (isOpen) {
      setDraftStart(startTime);
      setDraftEnd(endTime);
      setError(null);
    }
  }, [isOpen, startTime, endTime]);

  const handleApply = () => {
    const err = validateRange(draftStart, draftEnd);
    if (err) { setError(err); return; }
    onChange(draftStart, draftEnd);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setDraftStart(startTime);
    setDraftEnd(endTime);
    setError(null);
    setIsOpen(false);
  };

  const handlePreset = (preset: QuickPreset) => {
    onChange(preset.start, preset.end);
    setIsOpen(false);
  };

  const sidePanelProps = {
    showAbsolute,
    showRelative,
    precision,
    relativeFormats,
    showNow,
    min,
    max,
    timezone,
    use12HourFormat,
    labels,
  };

  return (
    <Popover open={isOpen} onOpenChange={disabled ? undefined : setIsOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={(triggerProps) =>
          renderTrigger ? (
            renderTrigger(triggerProps, { open: isOpen, startTime, endTime })
          ) : (
            <Button
              {...triggerProps}
              variant="outline"
              disabled={disabled}
              className={cn(
                'h-8 px-3 gap-2 text-xs font-normal justify-start',
                isOpen && 'border-foreground',
                className,
              )}
            >
              <CalendarDays size={14} className="text-muted-foreground shrink-0" />
              <span>{toDisplayString(startTime, { precision })}</span>
              <span className="text-muted-foreground">→</span>
              <span>{toDisplayString(endTime, { precision })}</span>
            </Button>
          )
        }
      />

      <PopoverContent
        className="p-0 w-auto"
        align={popoverAlign}
        side={popoverSide}
        sideOffset={4}
      >
        <div className="flex">
          {showQuickRanges && quickPresets.length > 0 && (
            <div className="shrink-0 border-r w-40 relative">
              <div className="absolute inset-0 flex flex-col overflow-hidden">
                <div className="px-3 pt-2.5 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest shrink-0">
                  {labels.quickRanges}
                </div>
                <div className="flex-1 overflow-y-auto">
                  {quickPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className="block w-full text-left text-xs px-3 py-1.5 hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => handlePreset(preset)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col justify-between relative">
            <div className="pointer-events-none absolute top-0 bottom-0 left-1/2 w-px bg-border" />

            <div className="flex">
              <div className="px-4 pb-4 pt-3">
                <SidePanel
                  title={labels.start}
                  value={draftStart}
                  compareValue={draftEnd}
                  onChange={(v) => { setDraftStart(v); setError(null); }}
                  {...sidePanelProps}
                />
              </div>
              <div className="px-4 pb-4 pt-3">
                <SidePanel
                  title={labels.end}
                  value={draftEnd}
                  compareValue={draftStart}
                  onChange={(v) => { setDraftEnd(v); setError(null); }}
                  {...sidePanelProps}
                />
              </div>
            </div>

            <Separator />
            <div className="flex items-center justify-between px-4 py-2 gap-4">
              {error === 'validation' ? (
                <span className="text-xs text-destructive">Start must be earlier than end.</span>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>{labels.cancel}</Button>
                <Button size="sm" onClick={handleApply}>{labels.apply}</Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
