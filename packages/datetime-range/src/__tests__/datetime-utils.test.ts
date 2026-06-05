import { describe, expect, it } from 'vitest'
import {
  absoluteDate,
  fromUrlString,
  relativeAgo,
  relativeNow,
  toUrlString,
  validateRange,
} from '@/datetime-utils'

describe('datetime URL serialization', () => {
  it('round-trips relative ranges', () => {
    const value = relativeAgo(5, 'Minutes ago')
    expect(toUrlString(value)).toBe('now-5m')
    expect(fromUrlString('now-5m')).toEqual({
      type: 'relative',
      relativeValue: '5',
      relativeFormat: 'Minutes ago',
      relativeNow: false,
    })
  })

  it('serializes now and absolute dates', () => {
    expect(toUrlString(relativeNow())).toBe('now')
    expect(toUrlString(absoluteDate(new Date('2026-01-02T03:04:05.000Z')))).toBe('1767323045000')
  })
})

describe('validateRange', () => {
  it('accepts ascending absolute ranges', () => {
    expect(validateRange(
      absoluteDate(new Date('2026-01-01T00:00:00.000Z')),
      absoluteDate(new Date('2026-01-02T00:00:00.000Z')),
    )).toBeNull()
  })

  it('rejects descending absolute ranges', () => {
    expect(validateRange(
      absoluteDate(new Date('2026-01-02T00:00:00.000Z')),
      absoluteDate(new Date('2026-01-01T00:00:00.000Z')),
    )).toBe('validation')
  })
})
