import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SidePanel } from '../DatetimeRangeSidePanel'
import { absoluteDate } from '../datetime-utils'

describe('SidePanel calendarMode', () => {
  const value = absoluteDate(new Date('2026-01-15T00:00:00.000Z'))

  it('renders the calendar inside a popover by default (collapsed until opened)', () => {
    render(
      <SidePanel title="Start" value={value} onChange={vi.fn()} showRelative={false} />,
    )

    expect(screen.getByTitle('Pick from calendar')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next month' })).not.toBeInTheDocument()
  })

  it('renders the calendar inline and always visible when calendarMode is "inline"', async () => {
    render(
      <SidePanel
        title="Start"
        value={value}
        onChange={vi.fn()}
        showRelative={false}
        calendarMode="inline"
      />,
    )

    expect(screen.queryByTitle('Pick from calendar')).not.toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Next month' })).toBeInTheDocument()
  })
})
