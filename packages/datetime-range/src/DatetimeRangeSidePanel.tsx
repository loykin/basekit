import React, { useState, useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { DateTimePanel } from './DatetimePanel';
import { DatetimeSegmentInput } from './DatetimeSegmentInput';
import {
  DateTimeRangeValue,
  DateTimeRelativeFormat,
  DatetimePrecision,
  DatetimeRangeLabels,
  DEFAULT_LABELS,
} from './types';
import { toDate, absoluteDate, RELATIVE_FORMATS } from './datetime-utils';

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
    <div className="dr-relative">
      <div>
        <p className="dr-relative-label">{labels.amount}</p>
        <div className="dr-relative-row">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="dr-relative-input"
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
            <SelectTrigger>
              <SelectValue>{format}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {relativeFormats.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {showNow && (
        <div className="dr-relative-now-row">
          <Switch
            checked={isNow}
            onCheckedChange={(checked: boolean) => {
              setIsNow(checked);
              emit({ numValue, format, isNow: checked });
            }}
          />
          <div className="dr-relative-now-labels">
            <label className="dr-relative-now-label">{labels.now}</label>
            <span className="dr-relative-now-desc">{labels.nowDescription}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AbsoluteContent ──────────────────────────────────────────────────────────

interface AbsoluteContentProps {
  value: DateTimeRangeValue;
  compareValue?: DateTimeRangeValue;
  title: string;
  onChange: (value: DateTimeRangeValue) => void;
  precision: DatetimePrecision;
  min?: Date;
  max?: Date;
  timezone?: string;
  use12HourFormat?: boolean;
}

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
}: AbsoluteContentProps) {
  const compareDate = compareValue ? toDate(compareValue) : undefined;
  const currentDate = value.type === 'absolute' ? toDate(value) : new Date();

  return (
    <div className="dr-absolute-row">
      <DatetimeSegmentInput
        value={currentDate}
        onChange={(d) => onChange(absoluteDate(d))}
        className="dr-absolute-input"
        precision={precision}
      />
      <Popover>
        <PopoverTrigger
          render={(triggerProps) => (
            <Button
              {...triggerProps}
              type="button"
              variant="outline"
              size="icon"
              className="dr-absolute-btn"
              title="Pick from calendar"
            >
              <CalendarDays size={14} />
            </Button>
          )}
        />
        <PopoverContent
          className="p-0 w-auto"
          side="bottom"
          align="start"
          sideOffset={6}
          disableAnchorTracking={true}
        >
          <DateTimePanel
            value={value.type === 'absolute' ? currentDate : undefined}
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
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ─── SidePanel ────────────────────────────────────────────────────────────────

export interface SidePanelProps {
  title: string;
  value: DateTimeRangeValue;
  compareValue?: DateTimeRangeValue;
  onChange: (value: DateTimeRangeValue) => void;
  /** Show absolute date/time tab. @default true */
  showAbsolute?: boolean;
  /** Show relative time tab. @default true */
  showRelative?: boolean;
  precision?: DatetimePrecision;
  relativeFormats?: DateTimeRelativeFormat[];
  showNow?: boolean;
  min?: Date;
  max?: Date;
  timezone?: string;
  use12HourFormat?: boolean;
  labels?: DatetimeRangeLabels;
}

export function SidePanel({
  title,
  value,
  compareValue,
  onChange,
  showAbsolute = true,
  showRelative = true,
  precision = 'second',
  relativeFormats = RELATIVE_FORMATS,
  showNow = true,
  min,
  max,
  timezone,
  use12HourFormat,
  labels: labelsProp,
}: SidePanelProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };

  useEffect(() => {
    if (!showRelative && value.type === 'relative') {
      onChange(absoluteDate(new Date()));
    } else if (!showAbsolute && value.type === 'absolute') {
      onChange({ type: 'relative', relativeValue: '5', relativeFormat: relativeFormats[0] ?? RELATIVE_FORMATS[0] });
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
    <div className="dr-side-panel">
      <p className="dr-side-panel-title">{title}</p>

      {hasBothModes ? (
        <Tabs
          value={value.type}
          className="dr-side-panel-tabs"
          onValueChange={(t: string) => {
            if (t === 'absolute') {
              onChange(absoluteDate(value.type === 'absolute' ? toDate(value) : new Date()));
            } else if (value.type !== 'relative') {
              onChange({ type: 'relative', relativeValue: '5', relativeFormat: relativeFormats[0] ?? RELATIVE_FORMATS[0] });
            }
          }}
        >
          <TabsList className="dr-tabs-list--grid dr-tabs-list--grid-2">
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
