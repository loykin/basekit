import { describe, expect, it } from 'vitest'
import { createFormatter, formatUnit } from '../index'

describe('formatUnit', () => {
  it('auto-scales bytes', () => {
    expect(formatUnit(1536, { unit: 'bytes', decimals: 1 })).toBe('1.5 KB')
  })

  it('formats percentages expressed as fractions', () => {
    expect(formatUnit(0.9234, { unit: 'percentunit', decimals: 2 })).toBe('92.34%')
  })

  it('creates reusable formatters', () => {
    const formatter = createFormatter({ unit: 'mbytes', decimals: 2 })
    expect(formatter(1_024_000_000)).toBe('1024.00 MB')
  })
})
