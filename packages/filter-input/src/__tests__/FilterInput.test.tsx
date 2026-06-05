import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FilterInput } from '../FilterInput'

describe('FilterInput', () => {
  it('emits text changes with the configured key', () => {
    const onChange = vi.fn()
    render(
      <FilterInput
        config={{ key: 'query', type: 'text', placeholder: 'Search' }}
        value=""
        onChange={onChange}
      />,
    )

    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'basekit' },
    })

    expect(onChange).toHaveBeenCalledWith(
      'basekit',
      expect.objectContaining({ key: 'query' }),
    )
  })

  it('clears a configured value', () => {
    const onChange = vi.fn()
    render(
      <FilterInput
        config={{ key: 'query', type: 'text', behavior: { clearable: true } }}
        value="basekit"
        onChange={onChange}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))

    expect(onChange).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ key: 'query' }),
    )
  })
})
