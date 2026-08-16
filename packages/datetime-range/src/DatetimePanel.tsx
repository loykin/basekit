// Based on https://github.com/huybuidac/shadcn-datetime-picker — popover removed, panel only.
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { format, getYear, setYear, addMonths, subMonths } from 'date-fns';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from 'lucide-react';
import { DayPicker, Matcher, TZDate } from 'react-day-picker';
import { cn } from './lib/utils';
import { Button } from './core/UIComponents';
import { MonthYearPicker, TimePicker } from './DatetimeUtil';
import type { DatetimePrecision } from './types';

export type CalendarProps = Omit<React.ComponentProps<typeof DayPicker>, 'mode'>;

export interface DateTimePanelProps {
  value: Date | undefined;
  /** Called immediately on every change when `immediate` is true. Called on Done otherwise. */
  onChangeAction: (date: Date | undefined, isSuccess?: boolean) => void;
  min?: Date;
  max?: Date;
  timezone?: string;
  disabled?: boolean;
  /** Controls which time fields are shown. 'date' hides time entirely. @default 'second' */
  precision?: DatetimePrecision;
  use12HourFormat?: boolean;
  clearable?: boolean;
  /** When true, hides Cancel/Done buttons and propagates changes immediately. */
  immediate?: boolean;
  isError?: boolean;
  compareValue?: Date;
  title?: string;
  validateDateRange?: (currentValue: Date, compareValue?: Date) => { isValid: boolean; errorType: 'validation' | 'range' | 'empty' | null };
  getRangeErrorMessage?: (errorType: 'validation' | 'range' | 'empty' | null, title?: string) => string;
}

function precisionToTimePicker(precision: DatetimePrecision) {
  if (precision === 'date') return undefined;
  return {
    hour: true,
    minute: precision === 'minute' || precision === 'second',
    second: precision === 'second',
  };
}

export function DateTimePanel({
  value,
  onChangeAction,
  min,
  max,
  timezone,
  precision = 'second',
  use12HourFormat,
  immediate = false,
  isError,
  compareValue,
  title,
  validateDateRange,
  getRangeErrorMessage,
  ...props
}: DateTimePanelProps & CalendarProps) {
  const [monthYearPicker, setMonthYearPicker] = useState<'month' | 'year' | false>(false);
  const initDate = useMemo(() => new TZDate(value || new Date(), timezone), [value, timezone]);

  const [month, setMonth] = useState<Date>(initDate);
  const [date, setDate] = useState<Date>(initDate);
  const [errorType, setErrorType] = useState<'validation' | 'range' | 'empty' | null>(null);
  const [previousDate, setPreviousDate] = useState<Date>(initDate);

  const endMonth = useMemo(() => setYear(month, getYear(month) + 1), [month]);
  const minDate = useMemo(() => (min ? new TZDate(min, timezone) : undefined), [min, timezone]);
  const maxDate = useMemo(() => (max ? new TZDate(max, timezone) : undefined), [max, timezone]);

  const validate = useCallback(
    (cur: Date, cmp?: Date): { isValid: boolean; errorType: 'validation' | 'range' | 'empty' | null } => {
      if (validateDateRange) return validateDateRange(cur, cmp);
      if (!cmp) return { isValid: true, errorType: null };
      if (title === 'Start Date' && cur >= cmp) return { isValid: false, errorType: 'validation' };
      if (title === 'End Date' && cur <= cmp) return { isValid: false, errorType: 'validation' };
      return { isValid: true, errorType: null };
    },
    [validateDateRange, title],
  );

  const onDayChanged = useCallback(
    (d: Date) => {
      d.setHours(date.getHours(), date.getMinutes(), date.getSeconds());
      if (min && d < min) d.setHours(min.getHours(), min.getMinutes(), min.getSeconds());
      if (max && d > max) d.setHours(max.getHours(), max.getMinutes(), max.getSeconds());
      setDate(d);
      if (immediate) onChangeAction(new Date(d), true);
    },
    [date, immediate, onChangeAction, min, max],
  );

  const onTimeChanged = useCallback(
    (d: Date) => {
      setDate(d);
      if (immediate) onChangeAction(new Date(d), true);
    },
    [immediate, onChangeAction],
  );

  const onSubmit = useCallback(() => {
    const result = validate(date, compareValue);
    setErrorType(result.isValid ? null : result.errorType);
    if (result.isValid) {
      onChangeAction(new Date(date), true);
      setPreviousDate(new Date(date));
    }
  }, [date, onChangeAction, compareValue, validate]);

  const onCancel = useCallback(() => {
    setDate(previousDate);
    setMonth(previousDate);
    setErrorType(null);
    onChangeAction(undefined, false);
  }, [previousDate, onChangeAction]);

  const onMonthYearChanged = useCallback((d: Date, mode: 'month' | 'year') => {
    setMonth(d);
    setMonthYearPicker(mode === 'year' ? 'month' : false);
  }, []);

  const onNextMonth = useCallback(() => setMonth(addMonths(month, 1)), [month]);
  const onPrevMonth = useCallback(() => setMonth(subMonths(month, 1)), [month]);

  useEffect(() => {
    setDate(initDate);
    setMonth(initDate);
    setMonthYearPicker(false);
    setPreviousDate(initDate);
  }, [initDate]);

  return (
    <div>
      <div className="datetime-range-panel-header">
        <div className="datetime-range-panel-nav-label">
          <div>
            <span onClick={() => setMonthYearPicker(monthYearPicker === 'month' ? false : 'month')}>
              {format(month, 'MMMM')}
            </span>
            <span onClick={() => setMonthYearPicker(monthYearPicker === 'year' ? false : 'year')}>
              {format(month, 'yyyy')}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMonthYearPicker(monthYearPicker ? false : 'year')}>
            {monthYearPicker
              ? <ChevronUpIcon style={{ width: 16, height: 16 }} />
              : <ChevronDownIcon style={{ width: 16, height: 16 }} />}
          </Button>
        </div>
        {!monthYearPicker && (
          <div className="datetime-range-panel-nav-btn">
            <Button variant="ghost" size="icon" aria-label="Previous month" onClick={onPrevMonth}>
              <ChevronLeftIcon style={{ width: 16, height: 16 }} />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Next month" onClick={onNextMonth}>
              <ChevronRightIcon style={{ width: 16, height: 16 }} />
            </Button>
          </div>
        )}
      </div>

      <div className="datetime-range-panel-calendar">
        <DayPicker
          timeZone={timezone}
          mode="single"
          selected={date}
          modifiers={{
            selected: (sel: Date) => {
              const a = new Date(sel); const b = new Date(date);
              return a.setHours(0, 0, 0, 0) === b.setHours(0, 0, 0, 0);
            },
            range_middle: (cur: Date) => {
              const d = new Date(date); const c = new Date(cur);
              return (!!max && cur < max && c > d) || (!!min && cur > min && c < d);
            },
          }}
          onSelect={(d) => d && onDayChanged(d)}
          month={month}
          endMonth={endMonth}
          disabled={[max ? { after: max } : null, min ? { before: min } : null].filter(Boolean) as Matcher[]}
          onMonthChange={setMonth}
          classNames={{
            dropdowns: 'datetime-range-cal-dropdowns',
            months: 'datetime-range-cal-months',
            month: 'datetime-range-cal-month',
            month_caption: 'hidden',
            button_previous: 'hidden',
            button_next: 'hidden',
            month_grid: 'datetime-range-cal-month-grid',
            weekdays: 'datetime-range-cal-weekdays',
            weekday: 'datetime-range-cal-weekday',
            week: 'datetime-range-cal-week',
            day: 'datetime-range-cal-day',
            day_button: 'datetime-range-cal-day-btn',
            range_end: 'datetime-range-cal-day-range-end',
            selected: 'datetime-range-cal-day-selected',
            today: 'datetime-range-cal-day-today',
            outside: 'datetime-range-cal-day-outside',
            disabled: 'datetime-range-cal-day-disabled',
            range_middle: 'datetime-range-cal-day-range-middle',
            hidden: 'datetime-range-cal-day-hidden',
          }}
          showOutsideDays={true}
          {...props}
        />
        <div className={cn('datetime-range-panel-overlay', !monthYearPicker && 'datetime-range-panel-overlay--hidden')} />
        <MonthYearPicker
          value={month}
          mode={monthYearPicker as 'month' | 'year'}
          onChange={onMonthYearChanged}
          minDate={minDate}
          maxDate={maxDate}
          className={cn('datetime-range-panel-monthyear', !monthYearPicker && 'datetime-range-panel-monthyear--hidden')}
        />
      </div>

      <div className="datetime-range-panel-footer">
        {precision !== 'date' && (
          <div className="datetime-range-panel-time">
            <TimePicker
              timePicker={precisionToTimePicker(precision)}
              value={date}
              onChange={onTimeChanged}
              use12HourFormat={use12HourFormat}
              min={minDate}
              max={maxDate}
            />
          </div>
        )}
        {(isError || errorType !== null) && (
          <div className="datetime-range-panel-error">
            <span className="datetime-range-panel-error-msg">
              {getRangeErrorMessage?.(errorType, title) ?? 'Invalid date range.'}
            </span>
          </div>
        )}
        {!immediate && (
          <div className="datetime-range-panel-buttons">
            <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
            <Button size="sm" onClick={onSubmit}>Done</Button>
          </div>
        )}
      </div>
    </div>
  );
}
