import React, { createContext, useContext, useRef } from 'react'
import { useStore } from 'zustand'
import { createControlBarStore, type ControlBarStore } from './controlBarStore'

const ControlBarContext = createContext<ControlBarStore | null>(null)

export function useControlBarStore(): ControlBarStore {
  const store = useContext(ControlBarContext)
  if (!store) throw new Error('useControlBarStore: must be used within <ControlBarProvider>')
  return store
}

export function useControlBarState<T>(selector: (s: ReturnType<ControlBarStore['getState']>) => T): T {
  const store = useControlBarStore()
  return useStore(store, selector)
}

export interface ControlBarProviderProps {
  children: React.ReactNode
  /** Zustand persist key — use a unique value per layout to avoid state collisions. @default 'control-bar-state' */
  persistKey?: string
}

export function ControlBarProvider({ children, persistKey = 'control-bar-state' }: ControlBarProviderProps) {
  const storeRef = useRef<ControlBarStore | null>(null)
  if (!storeRef.current) {
    storeRef.current = createControlBarStore(persistKey)
  }

  return (
    <ControlBarContext.Provider value={storeRef.current}>
      {children}
    </ControlBarContext.Provider>
  )
}
