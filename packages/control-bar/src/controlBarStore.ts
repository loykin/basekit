import { createStore } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ControlBarTab } from './types'

const DEFAULT_HEIGHT = 400
const MIN_HEIGHT = 36

interface ControlBarState {
  tabs: ControlBarTab[]
  activeTabId: string | null
  height: number
  isCollapsed: boolean
  isFullscreen: boolean
}

interface ControlBarActions {
  _open: (tab: ControlBarTab) => void
  _close: (tabId: string) => void
  _activate: (tabId: string) => void
  _setHeight: (height: number) => void
  _collapse: () => void
  _expand: () => void
  _fullscreen: () => void
  _exitFullscreen: () => void
}

export type ControlBarStore = ReturnType<typeof createControlBarStore>

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export { uid, DEFAULT_HEIGHT, MIN_HEIGHT }

export const createControlBarStore = (persistKey = 'cb-state') =>
  createStore<ControlBarState & ControlBarActions>()(
    persist(
      (set, get) => ({
        tabs: [],
        activeTabId: null,
        height: DEFAULT_HEIGHT,
        isCollapsed: false,
        isFullscreen: false,

        _open: (tab) => {
          const existing = get().tabs.find(t => t.id === tab.id)
          if (existing) {
            set({ activeTabId: tab.id, isCollapsed: false })
          } else {
            set(s => ({ tabs: [...s.tabs, tab], activeTabId: tab.id, isCollapsed: false }))
          }
        },

        _close: (tabId) => {
          set(s => {
            const tabs = s.tabs.filter(t => t.id !== tabId)
            const activeTabId = s.activeTabId === tabId
              ? (tabs[tabs.length - 1]?.id ?? null)
              : s.activeTabId
            return { tabs, activeTabId }
          })
        },

        _activate: (tabId) => set({ activeTabId: tabId, isCollapsed: false }),
        _setHeight: (height) => set({ height }),
        _collapse: () => set({ isCollapsed: true, isFullscreen: false }),
        _expand: () => set({ isCollapsed: false }),
        _fullscreen: () => set({ isCollapsed: false, isFullscreen: true }),
        _exitFullscreen: () => set({ isFullscreen: false }),
      }),
      {
        name: persistKey,
        partialize: (s) => ({
          tabs: s.tabs,
          activeTabId: s.activeTabId,
          height: s.height,
          isCollapsed: s.isCollapsed,
          // isFullscreen is not persisted — always starts non-fullscreen
        }),
      }
    )
  )
