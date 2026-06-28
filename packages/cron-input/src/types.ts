export type CronIntervalUnit = 'minute' | 'hour' | 'day'

export type CronValue =
  | { type: 'interval'; every: number; unit: CronIntervalUnit }
  | { type: 'daily';   hour: number; minute: number }
  | { type: 'weekly';  days: number[]; hour: number; minute: number }
  | { type: 'monthly'; day: number; hour: number; minute: number }
  | { type: 'custom';  expression: string }

export type CronTab = CronValue['type']

export interface CronInputLabels {
  interval?: string
  daily?: string
  weekly?: string
  monthly?: string
  custom?: string
  apply?: string
  cancel?: string
}

export const DEFAULT_LABELS: Required<CronInputLabels> = {
  interval: 'Interval',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  custom: 'Custom',
  apply: 'Apply',
  cancel: 'Cancel',
}

export const DEFAULT_VALUE: CronValue = { type: 'daily', hour: 9, minute: 0 }
