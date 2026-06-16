import React from 'react'
import { clsx } from 'clsx'

export interface ControlBarBodyProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function ControlBarBody({ children, className, style }: ControlBarBodyProps) {
  return (
    <div
      className={clsx('cb-body', className)}
      style={{ paddingBottom: 'var(--cb-height, 0px)', ...style }}
    >
      {children}
    </div>
  )
}
