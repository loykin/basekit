import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CronInput } from '../CronInput'

function openPopup(triggerName: string | RegExp) {
  fireEvent.click(screen.getByRole('button', { name: triggerName }))
}

describe('CronInput — Apply button disabled state', () => {
  it('Apply is enabled when custom expression is valid', () => {
    render(
      <CronInput
        value={{ type: 'custom', expression: '0 9 * * *' }}
        onChange={() => undefined}
      />,
    )
    openPopup('0 9 * * *')
    expect(screen.getByRole('button', { name: /apply/i })).not.toBeDisabled()
  })

  it('Apply is disabled when custom expression has invalid characters', () => {
    render(
      <CronInput
        value={{ type: 'custom', expression: 'abc * * * *' }}
        onChange={() => undefined}
      />,
    )
    openPopup('abc * * * *')
    expect(screen.getByRole('button', { name: /apply/i })).toBeDisabled()
  })

  it('Apply is disabled when custom expression has out-of-range values', () => {
    render(
      <CronInput
        value={{ type: 'custom', expression: '99 99 * * *' }}
        onChange={() => undefined}
      />,
    )
    openPopup('99 99 * * *')
    expect(screen.getByRole('button', { name: /apply/i })).toBeDisabled()
  })

  it('clicking a disabled Apply does not call onChange', () => {
    const onChange = vi.fn()
    render(
      <CronInput
        value={{ type: 'custom', expression: '99 99 * * *' }}
        onChange={onChange}
      />,
    )
    openPopup('99 99 * * *')
    fireEvent.click(screen.getByRole('button', { name: /apply/i }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('Apply is enabled for non-custom modes', () => {
    render(
      <CronInput
        value={{ type: 'daily', hour: 9, minute: 0 }}
        onChange={() => undefined}
      />,
    )
    openPopup(/daily at 09:00/i)
    expect(screen.getByRole('button', { name: /apply/i })).not.toBeDisabled()
  })

  it('calls onChange with the current draft on Apply', () => {
    const onChange = vi.fn()
    render(
      <CronInput
        value={{ type: 'custom', expression: '0 9 * * *' }}
        onChange={onChange}
      />,
    )
    openPopup('0 9 * * *')
    fireEvent.click(screen.getByRole('button', { name: /apply/i }))
    expect(onChange).toHaveBeenCalledOnce()
  })
})
