import { createStore } from 'zustand'
import type React from 'react'

export type Side = 'left' | 'right' | 'top' | 'bottom'

export type PanelOptions = {
  side?: Side
  // size = width for left/right, height for top/bottom
  size?: number
  minSize?: number
  maxSize?: number
  resizable?: boolean
  snapPoints?: number[]
  snapGap?: number
  closeOnOutsideClick?: boolean
  closeOnEsc?: boolean
  onBeforeClose?: () => boolean | Promise<boolean>
}

const DEFAULTS: Required<Omit<PanelOptions, 'onBeforeClose' | 'snapPoints'>> = {
  side: 'right',
  size: 560,
  minSize: 400,
  maxSize: 1000,
  resizable: true,
  snapGap: 20,
  closeOnOutsideClick: true,
  closeOnEsc: true,
}

type SidePanelState = {
  content: React.ReactNode
  isOpen: boolean
  size: number
  options: PanelOptions
}

type SidePanelActions = {
  _open: (content: React.ReactNode, options: PanelOptions) => void
  _close: () => void
  _setSize: (size: number) => void
}

export type SidePanelStore = ReturnType<typeof createSidePanelStore>

export const createSidePanelStore = (providerDefaults: PanelOptions = {}) =>
  createStore<SidePanelState & SidePanelActions>()((set) => ({
    content: null,
    isOpen: false,
    size: providerDefaults.size ?? DEFAULTS.size,
    options: {},
    _open: (content, options) => {
      const merged: PanelOptions = { ...DEFAULTS, ...providerDefaults, ...options }
      set({ content, isOpen: true, size: merged.size!, options: merged })
    },
    _close: () => set({ isOpen: false }),
    _setSize: (size) => set({ size }),
  }))
