export type DateTimeRangeType = 'absolute' | 'relative';

/** Controls which time fields are shown in absolute mode. */
export type DatetimePrecision = 'date' | 'hour' | 'minute' | 'second';

export type ValidationErrorType = 'validation' | 'range' | 'empty' | null;

export type DateTimeRelativeFormat =
  | 'Seconds ago'
  | 'Minutes ago'
  | 'Hours ago'
  | 'Days ago'
  | 'Weeks ago'
  | 'Months ago'
  | 'Years ago';

export interface DateTimeRangeValue {
  type: DateTimeRangeType;
  absoluteValue?: Date;
  relativeValue?: number | string;
  relativeFormat?: DateTimeRelativeFormat;
  relativeNow?: boolean;
}

export interface QuickPreset {
  label: string;
  start: DateTimeRangeValue;
  end: DateTimeRangeValue;
}

export interface DatetimeRangeLabels {
  start?: string;
  end?: string;
  quickRanges?: string;
  apply?: string;
  cancel?: string;
  absolute?: string;
  relative?: string;
  amount?: string;
  now?: string;
  nowDescription?: string;
}

export const DEFAULT_LABELS: Required<DatetimeRangeLabels> = {
  start: 'Start',
  end: 'End',
  quickRanges: 'Quick ranges',
  apply: 'Apply',
  cancel: 'Cancel',
  absolute: 'Absolute',
  relative: 'Relative',
  amount: 'Amount',
  now: 'Now',
  nowDescription: 'Set to current time',
};
