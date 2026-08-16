import type { ComponentProps } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ControlBar } from '../ControlBar'
import { ControlBarProvider } from '../ControlBarProvider'
import { useControlBar } from '../useControlBar'

function Harness({ persistKey, ...props }: { persistKey: string } & ComponentProps<typeof ControlBar>) {
  return (
    <ControlBarProvider persistKey={persistKey}>
      <ControlBar {...props} />
    </ControlBarProvider>
  )
}

describe('ControlBar — always-visible empty state', () => {
  it('renders nothing when there are no tabs and alwaysVisible is not set', () => {
    const { container } = render(<Harness persistKey="control-bar-test-default" />)
    expect(container.querySelector('.control-bar-root')).toBeNull()
  })

  it('renders the empty-state header when alwaysVisible is set with zero tabs', () => {
    render(
      <Harness
        persistKey="control-bar-test-always-visible"
        alwaysVisible
        emptyState="No active resource panels"
      />,
    )
    expect(screen.getByRole('status').textContent).toBe('No active resource panels')
  })

  it('calls onRequestOpen from the empty-state + button', () => {
    const onRequestOpen = vi.fn()
    render(
      <Harness persistKey="control-bar-test-empty-action" alwaysVisible onRequestOpen={onRequestOpen} />,
    )
    fireEvent.click(screen.getByTitle('Open tab'))
    expect(onRequestOpen).toHaveBeenCalledTimes(1)
  })

  it('hides collapse/fullscreen controls in the empty state', () => {
    render(
      <Harness persistKey="control-bar-test-empty-controls" alwaysVisible onRequestOpen={() => undefined} />,
    )
    expect(screen.queryByTitle('Collapse')).toBeNull()
    expect(screen.queryByTitle('Expand')).toBeNull()
    expect(screen.queryByTitle('Fullscreen')).toBeNull()
  })

  it('switches from the empty state to the tab strip once a tab opens', () => {
    function OpenTabButton() {
      const { open } = useControlBar()
      return <button onClick={() => open({ type: 'demo', label: 'Demo', data: undefined })}>open-tab</button>
    }

    render(
      <ControlBarProvider persistKey="control-bar-test-transition">
        <OpenTabButton />
        <ControlBar alwaysVisible emptyState="No active resource panels" />
      </ControlBarProvider>,
    )

    expect(screen.getByRole('status').textContent).toBe('No active resource panels')

    fireEvent.click(screen.getByText('open-tab'))

    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getByText('Demo')).not.toBeNull()
  })
})
