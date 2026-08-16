import '@testing-library/jest-dom/vitest'
import React, { createContext, useContext, useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CronInput } from '../CronInput'
import { Popover, PopoverTrigger, PopoverContent } from '../core/UIComponents'
import { CronInputProvider } from '../core/UIAdapterContext'
import type { PopoverTriggerProps } from '../core/UIAdapterContext'
import { Button as DefaultButton } from '../ui/button'
import { createShadcnAdapter } from '../adapters/shadcn'
import type { ShadcnAdapterComponents } from '../adapters/shadcn'

function openPopup(triggerName: string | RegExp) {
  fireEvent.click(screen.getByRole('button', { name: triggerName }))
}

describe('CronInput uiAdapter — default behavior unchanged', () => {
  it('renders with the built-in components when no uiAdapter is passed', () => {
    render(<CronInput value={{ type: 'daily', hour: 9, minute: 0 }} onChange={vi.fn()} />)
    const trigger = screen.getByRole('button', { name: /09:00/i })
    expect(trigger).toHaveClass('cron-input-trigger')
  })
})

describe('CronInput uiAdapter — slot replacement', () => {
  it('replaces a single slot when uiAdapter overrides it', () => {
    render(
      <CronInput
        value={{ type: 'daily', hour: 9, minute: 0 }}
        onChange={vi.fn()}
        uiAdapter={{ Button: (props) => <DefaultButton data-adapter="button" {...props} /> }}
      />,
    )
    openPopup(/09:00/i)
    expect(document.querySelector('[data-adapter="button"]')).toBeInTheDocument()
  })

  it('falls back to built-in components for slots not overridden', () => {
    render(
      <CronInput
        value={{ type: 'daily', hour: 9, minute: 0 }}
        onChange={vi.fn()}
        uiAdapter={{ Button: (props) => <DefaultButton data-adapter="button" {...props} /> }}
      />,
    )
    openPopup(/09:00/i)
    expect(document.querySelector('.cron-input-tabs-trigger')).toBeInTheDocument()
  })
})

describe('CronInputProvider — ambient context propagation', () => {
  it('reaches CronInput nested below it with zero prop drilling', () => {
    const MarkedButton = (props: React.ComponentProps<typeof DefaultButton>) => <DefaultButton data-adapter="button" {...props} />

    render(
      <CronInputProvider adapter={{ Button: MarkedButton }}>
        <CronInput value={{ type: 'daily', hour: 9, minute: 0 }} onChange={vi.fn()} />
      </CronInputProvider>,
    )
    openPopup(/09:00/i)
    expect(document.querySelector('[data-adapter="button"]')).toBeInTheDocument()
  })

  it('lets a local uiAdapter override an ambient provider adapter per-field', () => {
    const ProviderButton = (props: React.ComponentProps<typeof DefaultButton>) => <DefaultButton data-adapter="provider-button" {...props} />
    const LocalButton = (props: React.ComponentProps<typeof DefaultButton>) => <DefaultButton data-adapter="local-button" {...props} />

    render(
      <CronInputProvider adapter={{ Button: ProviderButton }}>
        <CronInput
          value={{ type: 'daily', hour: 9, minute: 0 }}
          onChange={vi.fn()}
          uiAdapter={{ Button: LocalButton }}
        />
      </CronInputProvider>,
    )
    openPopup(/09:00/i)
    expect(document.querySelector('[data-adapter="local-button"]')).toBeInTheDocument()
    expect(document.querySelector('[data-adapter="provider-button"]')).not.toBeInTheDocument()
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
  Tabs: Noop,
  TabsList: Noop,
  TabsTrigger: Noop,
  TabsContent: Noop,
}

describe('createShadcnAdapter', () => {
  it("bridges the render-prop PopoverTrigger to the consumer's asChild Popover", () => {
    const adapter = createShadcnAdapter(shadcnTestComponents)
    render(
      <CronInputProvider adapter={adapter}>
        <Popover>
          <PopoverTrigger
            render={((props: object) => <button {...props}>Open</button>) as PopoverTriggerProps['render']}
          />
          <PopoverContent>Hello</PopoverContent>
        </Popover>
      </CronInputProvider>,
    )

    expect(screen.queryByTestId('fake-popover-content')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Open'))
    expect(screen.getByTestId('fake-popover-content')).toHaveTextContent('Hello')
  })
})
