import { describe, expect, it } from 'vitest'
import {
  toCronExpression,
  fromCronExpression,
  toDisplayString,
  validateCronExpression,
  switchTab,
} from '../cron-utils'
import type { CronValue } from '../types'

// ─── validateCronExpression ───────────────────────────────────────────────────

describe('validateCronExpression', () => {
  it('accepts standard valid expressions', () => {
    expect(validateCronExpression('* * * * *')).toBe(true)
    expect(validateCronExpression('0 9 * * *')).toBe(true)
    expect(validateCronExpression('30 9 * * 1,3,5')).toBe(true)
    expect(validateCronExpression('0 0 1 * *')).toBe(true)
    expect(validateCronExpression('*/5 * * * *')).toBe(true)
    expect(validateCronExpression('0 */2 * * *')).toBe(true)
    expect(validateCronExpression('0 9 * * 1-5')).toBe(true)
  })

  it('rejects wrong field count', () => {
    expect(validateCronExpression('* * * *')).toBe(false)
    expect(validateCronExpression('* * * * * *')).toBe(false)
    expect(validateCronExpression('')).toBe(false)
  })

  it('rejects out-of-range values', () => {
    expect(validateCronExpression('60 * * * *')).toBe(false)   // minute > 59
    expect(validateCronExpression('* 24 * * *')).toBe(false)   // hour > 23
    expect(validateCronExpression('* * 0 * *')).toBe(false)    // dom < 1
    expect(validateCronExpression('* * 32 * *')).toBe(false)   // dom > 31
    expect(validateCronExpression('* * * 0 *')).toBe(false)    // month < 1
    expect(validateCronExpression('* * * 13 *')).toBe(false)   // month > 12
    expect(validateCronExpression('* * * * 8')).toBe(false)    // dow > 7
    expect(validateCronExpression('99 99 99 99 99')).toBe(false)
  })

  it('rejects step of 0', () => {
    expect(validateCronExpression('*/0 * * * *')).toBe(false)
    expect(validateCronExpression('* */0 * * *')).toBe(false)
  })

  it('rejects invalid range (start > end)', () => {
    expect(validateCronExpression('* * * * 5-1')).toBe(false)
    expect(validateCronExpression('30-10 * * * *')).toBe(false)
  })

  it('rejects non-numeric garbage', () => {
    expect(validateCronExpression('abc * * * *')).toBe(false)
    expect(validateCronExpression('@ * * * *')).toBe(false)
  })

  it('accepts boundary values', () => {
    expect(validateCronExpression('0 0 1 1 0')).toBe(true)
    expect(validateCronExpression('59 23 31 12 7')).toBe(true)
  })
})

// ─── toCronExpression ─────────────────────────────────────────────────────────

describe('toCronExpression', () => {
  it('interval: minutes', () => {
    const v: CronValue = { type: 'interval', every: 5, unit: 'minute' }
    expect(toCronExpression(v)).toBe('*/5 * * * *')
  })

  it('interval: hours', () => {
    const v: CronValue = { type: 'interval', every: 2, unit: 'hour' }
    expect(toCronExpression(v)).toBe('0 */2 * * *')
  })

  it('interval: days', () => {
    const v: CronValue = { type: 'interval', every: 3, unit: 'day' }
    expect(toCronExpression(v)).toBe('0 0 */3 * *')
  })

  it('daily', () => {
    const v: CronValue = { type: 'daily', hour: 9, minute: 0 }
    expect(toCronExpression(v)).toBe('0 9 * * *')
  })

  it('weekly: sorted days', () => {
    const v: CronValue = { type: 'weekly', days: [5, 1, 3], hour: 9, minute: 30 }
    expect(toCronExpression(v)).toBe('30 9 * * 1,3,5')
  })

  it('weekly: no days falls back to wildcard', () => {
    const v: CronValue = { type: 'weekly', days: [], hour: 9, minute: 0 }
    expect(toCronExpression(v)).toBe('0 9 * * *')
  })

  it('monthly', () => {
    const v: CronValue = { type: 'monthly', day: 1, hour: 0, minute: 0 }
    expect(toCronExpression(v)).toBe('0 0 1 * *')
  })

  it('custom: returns expression as-is', () => {
    const v: CronValue = { type: 'custom', expression: '0 9 * * 1-5' }
    expect(toCronExpression(v)).toBe('0 9 * * 1-5')
  })
})

// ─── fromCronExpression ───────────────────────────────────────────────────────

describe('fromCronExpression', () => {
  it('parses interval: minutes', () => {
    expect(fromCronExpression('*/5 * * * *')).toEqual({ type: 'interval', every: 5, unit: 'minute' })
  })

  it('parses interval: hours', () => {
    expect(fromCronExpression('0 */2 * * *')).toEqual({ type: 'interval', every: 2, unit: 'hour' })
  })

  it('parses interval: days', () => {
    expect(fromCronExpression('0 0 */3 * *')).toEqual({ type: 'interval', every: 3, unit: 'day' })
  })

  it('parses daily', () => {
    expect(fromCronExpression('0 9 * * *')).toEqual({ type: 'daily', hour: 9, minute: 0 })
  })

  it('parses weekly', () => {
    expect(fromCronExpression('30 9 * * 1,3,5')).toEqual({
      type: 'weekly', days: [1, 3, 5], hour: 9, minute: 30,
    })
  })

  it('normalizes DOW 7 → 0 (Sunday)', () => {
    expect(fromCronExpression('0 9 * * 7')).toEqual({
      type: 'weekly', days: [0], hour: 9, minute: 0,
    })
  })

  it('deduplicates when both 0 and 7 appear', () => {
    const result = fromCronExpression('0 9 * * 0,7')
    expect(result.type).toBe('weekly')
    if (result.type === 'weekly') {
      expect(result.days).toEqual([0])
    }
  })

  it('parses monthly', () => {
    expect(fromCronExpression('0 0 1 * *')).toEqual({ type: 'monthly', day: 1, hour: 0, minute: 0 })
  })

  it('falls back to custom for complex expressions', () => {
    const result = fromCronExpression('0 9 * * 1-5')
    expect(result.type).toBe('custom')
  })

  it('falls back to custom for out-of-range values', () => {
    expect(fromCronExpression('99 99 * * *').type).toBe('custom')
    expect(fromCronExpression('0 24 * * *').type).toBe('custom')
    expect(fromCronExpression('60 0 * * *').type).toBe('custom')
  })

  it('falls back to custom for invalid expressions', () => {
    expect(fromCronExpression('abc * * * *').type).toBe('custom')
    expect(fromCronExpression('* * * *').type).toBe('custom')
  })

  it('round-trips through toCronExpression', () => {
    const values: CronValue[] = [
      { type: 'interval', every: 5, unit: 'minute' },
      { type: 'daily', hour: 9, minute: 0 },
      { type: 'weekly', days: [1, 3, 5], hour: 9, minute: 30 },
      { type: 'monthly', day: 1, hour: 0, minute: 0 },
    ]
    for (const v of values) {
      expect(fromCronExpression(toCronExpression(v))).toEqual(v)
    }
  })
})

// ─── toDisplayString ──────────────────────────────────────────────────────────

describe('toDisplayString', () => {
  it('interval every 1 minute', () => {
    expect(toDisplayString({ type: 'interval', every: 1, unit: 'minute' })).toBe('Every minute')
  })

  it('interval every N minutes', () => {
    expect(toDisplayString({ type: 'interval', every: 5, unit: 'minute' })).toBe('Every 5 minutes')
  })

  it('interval every 1 hour', () => {
    expect(toDisplayString({ type: 'interval', every: 1, unit: 'hour' })).toBe('Every hour')
  })

  it('daily', () => {
    expect(toDisplayString({ type: 'daily', hour: 9, minute: 0 })).toBe('Daily at 09:00')
  })

  it('daily pads single-digit values', () => {
    expect(toDisplayString({ type: 'daily', hour: 3, minute: 5 })).toBe('Daily at 03:05')
  })

  it('weekly with days', () => {
    const result = toDisplayString({ type: 'weekly', days: [1, 3, 5], hour: 9, minute: 0 })
    expect(result).toBe('Mon, Wed, Fri at 09:00')
  })

  it('weekly with no days', () => {
    const result = toDisplayString({ type: 'weekly', days: [], hour: 9, minute: 0 })
    expect(result).toContain('09:00')
  })

  it('monthly', () => {
    expect(toDisplayString({ type: 'monthly', day: 1, hour: 0, minute: 0 })).toBe('Monthly, day 1 at 00:00')
  })

  it('custom: returns expression', () => {
    expect(toDisplayString({ type: 'custom', expression: '0 9 * * 1-5' })).toBe('0 9 * * 1-5')
  })

  it('custom: empty expression fallback', () => {
    expect(toDisplayString({ type: 'custom', expression: '' })).toBe('Custom schedule')
  })
})

// ─── switchTab ────────────────────────────────────────────────────────────────

describe('switchTab', () => {
  it('preserves time when switching daily → weekly', () => {
    const from: CronValue = { type: 'daily', hour: 14, minute: 30 }
    const result = switchTab(from, 'weekly')
    expect(result.type).toBe('weekly')
    if (result.type === 'weekly') {
      expect(result.hour).toBe(14)
      expect(result.minute).toBe(30)
    }
  })

  it('preserves time when switching weekly → monthly', () => {
    const from: CronValue = { type: 'weekly', days: [1], hour: 8, minute: 15 }
    const result = switchTab(from, 'monthly')
    expect(result.type).toBe('monthly')
    if (result.type === 'monthly') {
      expect(result.hour).toBe(8)
      expect(result.minute).toBe(15)
    }
  })

  it('serializes to expression when switching to custom', () => {
    const from: CronValue = { type: 'daily', hour: 9, minute: 0 }
    const result = switchTab(from, 'custom')
    expect(result.type).toBe('custom')
    if (result.type === 'custom') {
      expect(result.expression).toBe('0 9 * * *')
    }
  })

  it('uses default time when switching from interval', () => {
    const from: CronValue = { type: 'interval', every: 5, unit: 'minute' }
    const result = switchTab(from, 'daily')
    expect(result.type).toBe('daily')
    if (result.type === 'daily') {
      expect(result.hour).toBe(9)
      expect(result.minute).toBe(0)
    }
  })
})
