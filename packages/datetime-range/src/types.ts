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
