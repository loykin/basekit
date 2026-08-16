import '@testing-library/jest-dom/vitest'
import React, { createContext, useContext, useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DatetimeRange } from '../DatetimeRange'
import { SidePanel } from '../DatetimeRangeSidePanel'
import { Popover, PopoverTrigger, PopoverContent } from '../core/UIComponents'
import { DatetimeRangeProvider } from '../core/UIAdapterContext'
import type { PopoverTriggerProps } from '../core/UIAdapterContext'
import { Button as DefaultButton } from '../ui/button'
import { Switch as DefaultSwitch } from '../ui/switch'
import { SelectTrigger as DefaultSelectTrigger } from '../ui/select'
import { createShadcnAdapter } from '../adapters/shadcn'
import type { ShadcnAdapterComponents } from '../adapters/shadcn'
import { relativeAgo, relativeNow } from '../datetime-utils'

describe('DatetimeRange uiAdapter — default behavior unchanged', () => {
  it('renders with the built-in components when no uiAdapter is passed', () => {
    const { container } = render(
      <DatetimeRange startTime={relativeAgo(1, 'Hours ago')} endTime={relativeNow()} onChange={vi.fn()} />,
    )
    const trigger = container.querySelector('.datetime-range-range-trigger')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveClass('datetime-range-btn')
  })
})

describe('DatetimeRange uiAdapter — slot replacement', () => {
  it('replaces a single slot when uiAdapter overrides it', () => {
    render(
      <DatetimeRange
        startTime={relativeAgo(1, 'Hours ago')}
        endTime={relativeNow()}
        onChange={vi.fn()}
        uiAdapter={{ Button: (props) => <DefaultButton data-adapter="button" {...props} /> }}
      />,
    )
    expect(document.querySelector('[data-adapter="button"]')).toBeInTheDocument()
  })

  it('falls back to built-in components for slots not overridden', () => {
    render(
      <SidePanel
        title="Start"
        value={relativeAgo(5, 'Minutes ago')}
        onChange={vi.fn()}
        showAbsolute={false}
        uiAdapter={{ Button: (props) => <DefaultButton data-adapter="button" {...props} /> }}
      />,
    )
    expect(document.querySelector('.datetime-range-switch')).toBeInTheDocument()
    expect(document.querySelector('.datetime-range-select-trigger')).toBeInTheDocument()
  })
})

describe('SidePanel uiAdapter — standalone (no DatetimeRange)', () => {
  it('accepts its own uiAdapter when composed directly', () => {
    render(
      <SidePanel
        title="Start"
        value={relativeAgo(1, 'Hours ago')}
        onChange={vi.fn()}
        showRelative={false}
        uiAdapter={{ Button: (props) => <DefaultButton data-adapter="button" {...props} /> }}
      />,
    )
    expect(document.querySelector('[data-adapter="button"]')).toBeInTheDocument()
  })
})

describe('DatetimeRangeProvider — ambient context propagation', () => {
  it('reaches nested Switch/SelectTrigger with zero prop drilling', () => {
    const MarkedSwitch = (props: React.ComponentProps<typeof DefaultSwitch>) => <DefaultSwitch data-adapter="switch" {...props} />
    const MarkedSelectTrigger = (props: React.ComponentProps<typeof DefaultSelectTrigger>) => (
      <DefaultSelectTrigger data-adapter="select-trigger" {...props} />
    )

    render(
      <DatetimeRangeProvider adapter={{ Switch: MarkedSwitch, SelectTrigger: MarkedSelectTrigger }}>
        <SidePanel title="Start" value={relativeAgo(5, 'Minutes ago')} onChange={vi.fn()} showAbsolute={false} />
      </DatetimeRangeProvider>,
    )

    expect(document.querySelector('[data-adapter="switch"]')).toBeInTheDocument()
    expect(document.querySelector('[data-adapter="select-trigger"]')).toBeInTheDocument()
  })

  it('lets a local uiAdapter override an ambient provider adapter per-field', () => {
    const ProviderSwitch = (props: React.ComponentProps<typeof DefaultSwitch>) => <DefaultSwitch data-adapter="provider-switch" {...props} />
    const LocalSwitch = (props: React.ComponentProps<typeof DefaultSwitch>) => <DefaultSwitch data-adapter="local-switch" {...props} />
    const ProviderSelectTrigger = (props: React.ComponentProps<typeof DefaultSelectTrigger>) => (
      <DefaultSelectTrigger data-adapter="provider-select" {...props} />
    )

    render(
      <DatetimeRangeProvider adapter={{ Switch: ProviderSwitch, SelectTrigger: ProviderSelectTrigger }}>
        <SidePanel
          title="Start"
          value={relativeAgo(5, 'Minutes ago')}
          onChange={vi.fn()}
          showAbsolute={false}
          uiAdapter={{ Switch: LocalSwitch }}
        />
      </DatetimeRangeProvider>,
    )

    expect(document.querySelector('[data-adapter="local-switch"]')).toBeInTheDocument()
    expect(document.querySelector('[data-adapter="provider-switch"]')).not.toBeInTheDocument()
    // Non-overridden field from the ambient provider still applies.
    expect(document.querySelector('[data-adapter="provider-select"]')).toBeInTheDocument()
  })
})

// ─── Minimal shadcn/Radix-style test doubles (no real radix-ui dependency) ───────

const FakePopoverCtx = createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => {} })

function FakePopover({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return <FakePopoverCtx.Provider value={{ open, setOpen }}>{children}</FakePopoverCtx.Provider>
}

function FakePopoverTrigger({ asChild, children }: { asChild?: boolean; children?: React.ReactElement }) {
  const { setOpen } = useContext(FakePopoverCtx)
  if (asChild && children) return React.cloneElement(children, { onClick: () => setOpen(true) } as React.HTMLAttributes<HTMLElement>)
  return <button onClick={() => setOpen(true)}>{children}</button>
}

function FakePopoverContent({ children }: { children: React.ReactNode }) {
  const { open } = useContext(FakePopoverCtx)
  return open ? <div data-testid="fake-popover-content">{children}</div> : null
}

const Noop = (props: Record<string, unknown>) => <div {...props} />

const shadcnTestComponents: ShadcnAdapterComponents = {
  Button: (props: Record<string, unknown>) => <button type="button" {...props} />,
  Popover: FakePopover,
  PopoverTrigger: FakePopoverTrigger,
  PopoverContent: FakePopoverContent,
  Select: Noop,
  SelectTrigger: Noop,
  SelectValue: Noop,
  SelectContent: Noop,
  SelectItem: Noop,
  Tabs: Noop,
  TabsList: Noop,
  TabsTrigger: Noop,
  TabsContent: Noop,
  Switch: Noop,
  Input: Noop,
}

describe('createShadcnAdapter', () => {
  it("bridges the render-prop PopoverTrigger to the consumer's asChild Popover", () => {
    const adapter = createShadcnAdapter(shadcnTestComponents)
    render(
      <DatetimeRangeProvider adapter={adapter}>
        <Popover>
          <PopoverTrigger
            render={((props: object) => <button {...props}>Open</button>) as PopoverTriggerProps['render']}
          />
          <PopoverContent>Hello</PopoverContent>
        </Popover>
      </DatetimeRangeProvider>,
    )

    expect(screen.queryByTestId('fake-popover-content')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Open'))
    expect(screen.getByTestId('fake-popover-content')).toHaveTextContent('Hello')
  })

  it('maps every internal Button size value without throwing', () => {
    const adapter = createShadcnAdapter(shadcnTestComponents)
    const AdaptedButton = adapter.Button!
    const sizes = ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'] as const
    for (const size of sizes) {
      const { unmount } = render(<AdaptedButton size={size}>x</AdaptedButton>)
      unmount()
    }
  })

  it('strips DR-only TabsList.variant and Switch.size before forwarding', () => {
    const adapter = createShadcnAdapter(shadcnTestComponents)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const AdaptedTabsList = adapter.TabsList!
    const AdaptedSwitch = adapter.Switch!

    render(<AdaptedTabsList variant="line" />)
    render(<AdaptedSwitch size="sm" />)

    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
