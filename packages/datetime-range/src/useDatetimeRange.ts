import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DateTimeRangeValue,
  ValidationErrorType,
  QuickPreset,
} from './types';
import { validateRange } from './datetime-utils';

export interface UseDatetimeRangeOptions {
  startTime: DateTimeRangeValue;
  endTime: DateTimeRangeValue;
  onChange: (startTime: DateTimeRangeValue, endTime: DateTimeRangeValue) => void;
}

export interface UseDatetimeRangeReturn {
  /** Popover open state. */
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  /** Draft values — edited inside the picker, committed on apply. */
  draftStart: DateTimeRangeValue;
  setDraftStart: (value: DateTimeRangeValue) => void;
  draftEnd: DateTimeRangeValue;
  setDraftEnd: (value: DateTimeRangeValue) => void;
  /** Validation error — 'validation' if start >= end, null otherwise. */
  error: ValidationErrorType;
  clearError: () => void;
  /** Validate and commit draft values. Calls onChange on success. */
  onApply: () => void;
  /** Discard draft values and close. */
  onCancel: () => void;
  /** Commit a preset directly (skips draft). */
  onPreset: (preset: QuickPreset) => void;
}

export function useDatetimeRange({
  startTime,
  endTime,
  onChange,
}: UseDatetimeRangeOptions): UseDatetimeRangeReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [draftStart, setDraftStart] = useState<DateTimeRangeValue>(startTime);
  const [draftEnd,   setDraftEnd]   = useState<DateTimeRangeValue>(endTime);
  const [error, setError] = useState<ValidationErrorType>(null);

  // Sync draft to committed values only when the popover transitions to open,
  // not on every startTime/endTime reference change while already open.
  const wasOpen = useRef(false);
  useEffect(() => {
    const justOpened = isOpen && !wasOpen.current;
    wasOpen.current = isOpen;
    if (justOpened) {
      setDraftStart(startTime);
      setDraftEnd(endTime);
      setError(null);
    }
  }, [isOpen, startTime, endTime]);

  const clearError = useCallback(() => setError(null), []);

  const onApply = useCallback(() => {
    const err = validateRange(draftStart, draftEnd);
    if (err) { setError(err); return; }
    onChange(draftStart, draftEnd);
    setIsOpen(false);
  }, [draftStart, draftEnd, onChange]);

  const onCancel = useCallback(() => {
    setDraftStart(startTime);
    setDraftEnd(endTime);
    setError(null);
    setIsOpen(false);
  }, [startTime, endTime]);

  const onPreset = useCallback((preset: QuickPreset) => {
    onChange(preset.start, preset.end);
    setIsOpen(false);
  }, [onChange]);

  return {
    isOpen, setIsOpen,
    draftStart, setDraftStart,
    draftEnd, setDraftEnd,
    error,
    clearError,
    onApply,
    onCancel,
    onPreset,
  };
}
