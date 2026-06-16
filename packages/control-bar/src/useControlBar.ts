import { useControlBarState, useControlBarStore } from './ControlBarProvider'
import { getTabType } from './tabTypeRegistry'
import { uid } from './controlBarStore'
import type { OpenTabOptions, ControlBarTab } from './types'

export function useControlBar() {
  const store = useControlBarStore()

  const tabs         = useControlBarState(s => s.tabs)
  const activeTabId  = useControlBarState(s => s.activeTabId)
  const isCollapsed  = useControlBarState(s => s.isCollapsed)
  const isFullscreen = useControlBarState(s => s.isFullscreen)

  function open<T>(options: OpenTabOptions<T>): string {
    const def = getTabType(options.type)
    const label = options.label ?? def?.label ?? options.type
    const id = uid()
    const tab: ControlBarTab<T> = { id, type: options.type, label, data: options.data }
    store.getState()._open(tab)
    return id
  }

  function close(tabId: string): void {
    store.getState()._close(tabId)
  }

  function activate(tabId: string): void {
    store.getState()._activate(tabId)
  }

  function collapse(): void    { store.getState()._collapse() }
  function expand(): void      { store.getState()._expand() }
  function fullscreen(): void  { store.getState()._fullscreen() }
  function exitFullscreen(): void { store.getState()._exitFullscreen() }

  return { open, close, activate, tabs, activeTabId, isCollapsed, isFullscreen, collapse, expand, fullscreen, exitFullscreen }
}
