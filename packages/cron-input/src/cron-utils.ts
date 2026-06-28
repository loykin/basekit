import type { CronValue, CronTab } from './types'

const DAY_LABELS: Record<number, string> = {
  0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat',
}

const pad = (n: number) => String(n).padStart(2, '0')

export function toCronExpression(value: CronValue): string {
  switch (value.type) {
    case 'interval': {
      const { every, unit } = value
      if (unit === 'minute') return `*/${every} * * * *`
      if (unit === 'hour')   return `0 */${every} * * *`
      return `0 0 */${every} * *`
    }
    case 'daily':
      return `${value.minute} ${value.hour} * * *`
    case 'weekly': {
      const days = value.days.length === 0 ? '*' : [...value.days].sort((a, b) => a - b).join(',')
      return `${value.minute} ${value.hour} * * ${days}`
    }
    case 'monthly':
      return `${value.minute} ${value.hour} ${value.day} * *`
    case 'custom':
      return value.expression
  }
}

export function toDisplayString(value: CronValue): string {
  switch (value.type) {
    case 'interval': {
      const { every, unit } = value
      const label = unit === 'minute' ? (every === 1 ? 'minute' : 'minutes')
                  : unit === 'hour'   ? (every === 1 ? 'hour'   : 'hours')
                  :                    (every === 1 ? 'day'    : 'days')
      return every === 1 ? `Every ${label}` : `Every ${every} ${label}`
    }
    case 'daily':
      return `Daily at ${pad(value.hour)}:${pad(value.minute)}`
    case 'weekly': {
      if (value.days.length === 0) return `Weekly at ${pad(value.hour)}:${pad(value.minute)}`
      const dayStr = [...value.days].sort((a, b) => a - b).map(d => DAY_LABELS[d]).join(', ')
      return `${dayStr} at ${pad(value.hour)}:${pad(value.minute)}`
    }
    case 'monthly':
      return `Monthly, day ${value.day} at ${pad(value.hour)}:${pad(value.minute)}`
    case 'custom':
      return value.expression || 'Custom schedule'
  }
}

export function fromCronExpression(expr: string): CronValue {
  if (!validateCronExpression(expr)) return { type: 'custom', expression: expr }

  const parts = expr.trim().split(/\s+/)
  const [min, hour, dom, month, dow] = parts as [string, string, string, string, string]

  const m  = parseInt(min,  10)
  const h  = parseInt(hour, 10)

  if (/^\*\/\d+$/.test(min) && hour === '*' && dom === '*' && month === '*' && dow === '*')
    return { type: 'interval', every: parseInt(min.slice(2), 10), unit: 'minute' }

  if (min === '0' && /^\*\/\d+$/.test(hour) && dom === '*' && month === '*' && dow === '*')
    return { type: 'interval', every: parseInt(hour.slice(2), 10), unit: 'hour' }

  if (min === '0' && hour === '0' && /^\*\/\d+$/.test(dom) && month === '*' && dow === '*')
    return { type: 'interval', every: parseInt(dom.slice(2), 10), unit: 'day' }

  if (/^\d+$/.test(min) && /^\d+$/.test(hour) && dom === '*' && month === '*' && dow === '*')
    return { type: 'daily', hour: h, minute: m }

  if (/^\d+$/.test(min) && /^\d+$/.test(hour) && dom === '*' && month === '*' && /^[\d,]+$/.test(dow)) {
    const normalized = [...new Set(dow.split(',').map(Number).map(d => d === 7 ? 0 : d))].filter(d => d >= 0 && d <= 6).sort((a, b) => a - b)
    return { type: 'weekly', days: normalized, hour: h, minute: m }
  }

  if (/^\d+$/.test(min) && /^\d+$/.test(hour) && /^\d+$/.test(dom) && month === '*' && dow === '*') {
    const day = parseInt(dom, 10)
    return { type: 'monthly', day, hour: h, minute: m }
  }

  return { type: 'custom', expression: expr }
}

function isValidNumber(s: string, min: number, max: number): boolean {
  if (!/^\d+$/.test(s)) return false
  const n = parseInt(s, 10)
  return n >= min && n <= max
}

function isValidField(field: string, min: number, max: number): boolean {
  if (field === '*') return true

  if (field.startsWith('*/')) {
    const step = parseInt(field.slice(2), 10)
    return !isNaN(step) && step >= 1 && step <= max
  }

  if (field.includes(',')) {
    return field.split(',').every(part => isValidField(part, min, max))
  }

  if (field.includes('-')) {
    const parts = field.split('-')
    if (parts.length !== 2) return false
    const [a, b] = parts.map(Number)
    return !isNaN(a) && !isNaN(b) && a >= min && a <= max && b >= min && b <= max && a <= b
  }

  return isValidNumber(field, min, max)
}

export function validateCronExpression(expr: string): boolean {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return false
  const [min, hour, dom, month, dow] = parts as [string, string, string, string, string]
  return (
    isValidField(min,   0, 59) &&
    isValidField(hour,  0, 23) &&
    isValidField(dom,   1, 31) &&
    isValidField(month, 1, 12) &&
    isValidField(dow,   0, 7)
  )
}

export function switchTab(current: CronValue, next: CronTab): CronValue {
  const hour   = 'hour'   in current ? current.hour   : 9
  const minute = 'minute' in current ? current.minute : 0

  switch (next) {
    case 'interval': return { type: 'interval', every: 5, unit: 'minute' }
    case 'daily':    return { type: 'daily', hour, minute }
    case 'weekly':   return {
      type: 'weekly',
      days: current.type === 'weekly' ? current.days : [1, 3, 5],
      hour, minute,
    }
    case 'monthly':  return {
      type: 'monthly',
      day: current.type === 'monthly' ? current.day : 1,
      hour, minute,
    }
    case 'custom':   return { type: 'custom', expression: toCronExpression(current) }
  }
}
