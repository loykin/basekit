import React, { useRef, type PropsWithChildren } from 'react'
import { usePanelGuard } from './usePanelGuard'

export function PanelGuard({ children }: PropsWithChildren) {
  const ref = useRef<HTMLDivElement>(null)
  usePanelGuard(ref)
  return <div ref={ref}>{children}</div>
}
