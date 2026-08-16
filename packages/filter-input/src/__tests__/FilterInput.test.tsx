import '@testing-library/jest-dom/vitest'
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

  it('applies the configured display.size as a data attribute on the control', () => {
    render(
      <FilterInput
        config={{ key: 'query', type: 'text', placeholder: 'Search', display: { size: 'sm' } }}
        value=""
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByPlaceholderText('Search')).toHaveAttribute('data-size', 'sm')
  })

  it('renders a leading icon and reserves control padding', () => {
    render(
      <FilterInput
        config={{
          key: 'query',
          type: 'text',
          placeholder: 'Search',
          display: { leadingIcon: <span data-testid="search-icon">icon</span> },
        }}
        value=""
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByTestId('search-icon')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search')).toHaveClass('fi-control-has-leading-icon')
  })

  it('does not wrap the control when no icon is configured', () => {
    render(
      <FilterInput
        config={{ key: 'query', type: 'text', placeholder: 'Search' }}
        value=""
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByPlaceholderText('Search').parentElement).not.toHaveClass('fi-control-wrap')
  })
})
