import { useStore } from 'zustand'
import type React from 'react'
import { useSidePanelContext } from './SidePanelProvider'
import type { PanelOptions } from './sidePanelStore'

export function useSidePanel() {
  const { store, open, close } = useSidePanelContext()
  const isOpen = useStore(store, (s) => s.isOpen)
  return { open, close, isOpen }
}

export function usePanelClose(): () => Promise<void> {
  return useSidePanelContext().close
}

export type { PanelOptions }
export type OpenFn = (content: React.ReactNode, options?: PanelOptions) => void
