import React from 'react';
import { CalendarDays } from 'lucide-react';
import { cn } from './lib/utils';
import { Button, Popover, PopoverContent, PopoverTrigger } from './core/UIComponents';
import { DatetimeRangeProvider } from './core/UIAdapterContext';
import type { DatetimeRangeUIAdapter } from './core/UIAdapterContext';
import { SidePanel } from './DatetimeRangeSidePanel';
import { useDatetimeRange } from './useDatetimeRange';
import {
  DateTimeRangeValue,
  DateTimeRelativeFormat,
  QuickPreset,
  DatetimePrecision,
  DatetimeRangeLabels,
  DEFAULT_LABELS,
} from './types';
import {
  toDisplayString,
  RELATIVE_FORMATS,
  QUICK_PRESETS,
} from './datetime-utils';

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
  /**
   * How the calendar is presented in Absolute mode: `'popover'` opens it from a button
   * (current default behavior); `'inline'` renders it always visible below the date input,
   * like an embedded shadcn-style calendar. Pick whichever suits the surrounding layout.
   * @default 'popover'
   */
  calendarMode?: 'popover' | 'inline';
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
  /** DOM element the popover portal renders into. Use a scoped container to inherit CSS custom properties. */
  portalContainer?: React.RefObject<HTMLElement | null> | HTMLElement | null;
  className?: string;
  /**
   * Replace the underlying Button/Popover/Select/Tabs/Input/Switch implementations —
   * e.g. `createShadcnAdapter(...)` from `@loykin/datetime-range/adapters/shadcn` to render
   * with your app's own shadcn/ui components instead of the built-in ones.
   * Must be referentially stable (module-scope constant or memoized) — a new object every
   * render remounts the affected subtree.
   */
  uiAdapter?: DatetimeRangeUIAdapter;
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
  calendarMode = 'popover',
  disabled = false,
  labels: labelsProp,
  popoverAlign = 'start',
  popoverSide = 'bottom',
  renderTrigger,
  portalContainer,
  className,
  uiAdapter,
}: DatetimeRangeProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };

  const {
    isOpen, setIsOpen,
    draftStart, setDraftStart,
    draftEnd, setDraftEnd,
    error,
    clearError,
    onApply: handleApply,
    onCancel: handleCancel,
    onPreset: handlePreset,
  } = useDatetimeRange({ startTime, endTime, onChange });

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
    calendarMode,
  };

  const content = (
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
              className={cn('datetime-range-range-trigger', isOpen && 'datetime-range-range-trigger--open', className)}
            >
              <CalendarDays size={14} className="datetime-range-range-trigger-icon" />
              <span>{toDisplayString(startTime, { precision })}</span>
              <span className="datetime-range-range-trigger-arrow">→</span>
              <span>{toDisplayString(endTime, { precision })}</span>
            </Button>
          )
        }
      />

      <PopoverContent
        className="datetime-range-range-popup-content"
        align={popoverAlign}
        side={popoverSide}
        sideOffset={4}
        container={portalContainer}
      >
        <div className="datetime-range-range-popup">
          {showQuickRanges && quickPresets.length > 0 && (
            <div className="datetime-range-range-quick">
              <div className="datetime-range-range-quick-inner">
                <div className="datetime-range-range-quick-label">{labels.quickRanges}</div>
                <div className="datetime-range-range-quick-list">
                  {quickPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className="datetime-range-range-quick-item"
                      onClick={() => handlePreset(preset)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="datetime-range-range-pickers">
            <div className="datetime-range-range-divider" />
            <div className="datetime-range-range-panels">
              <div className="datetime-range-range-panel-slot">
                <SidePanel
                  title={labels.start}
                  value={draftStart}
                  compareValue={draftEnd}
                  onChange={(v) => { setDraftStart(v); clearError(); }}
                  {...sidePanelProps}
                />
              </div>
              <div className="datetime-range-range-panel-slot">
                <SidePanel
                  title={labels.end}
                  value={draftEnd}
                  compareValue={draftStart}
                  onChange={(v) => { setDraftEnd(v); clearError(); }}
                  {...sidePanelProps}
                />
              </div>
            </div>

            <div className="datetime-range-range-footer">
              {error === 'validation' ? (
                <span className="datetime-range-range-error-text">Start must be earlier than end.</span>
              ) : (
                <span />
              )}
              <div className="datetime-range-range-actions">
                <Button variant="outline" size="sm" onClick={handleCancel}>{labels.cancel}</Button>
                <Button size="sm" onClick={handleApply}>{labels.apply}</Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  return uiAdapter ? <DatetimeRangeProvider adapter={uiAdapter}>{content}</DatetimeRangeProvider> : content;
}
