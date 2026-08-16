import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Resizable } from 're-resizable'
import { useControlBarState, useControlBarStore } from './ControlBarProvider'
import { ControlBarTabItem } from './ControlBarTabItem'
import { ControlBarContent } from './ControlBarContent'
import { MIN_HEIGHT } from './controlBarStore'

export interface ControlBarActionContext {
  isCollapsed: boolean
  isFullscreen: boolean
  collapse: () => void
  expand: () => void
  fullscreen: () => void
  exitFullscreen: () => void
  onRequestOpen?: () => void
}

export interface ControlBarProps {
  /** Minimum height in px. @default 36 */
  minHeight?: number
  /** Maximum height in px. @default window.innerHeight * 0.8 */
  maxHeight?: number
  /** Snap heights in px — magnetic during drag. @default [minHeight, 400] */
  snapPoints?: number[]
  /** Distance in px to snap. @default 20 */
  snapGap?: number
  /** Called when the + button is clicked. */
  onRequestOpen?: () => void
  /**
   * Custom action buttons (right side of header).
   * Receives collapse/expand/fullscreen/exitFullscreen so you can wire any UI.
   * Omit to use the default collapse + fullscreen buttons.
   */
  renderActions?: (ctx: ControlBarActionContext) => React.ReactNode
  /**
   * Keep the header bar mounted (at `minHeight`) even when there are no open tabs,
   * instead of returning `null`. @default false
   */
  alwaysVisible?: boolean
  /** Content shown in the tab-strip area when there are no tabs and `alwaysVisible` is set. */
  emptyState?: React.ReactNode
  className?: string
}

export function ControlBar({
  minHeight = MIN_HEIGHT,
  maxHeight,
  snapPoints,
  snapGap = 20,
  onRequestOpen,
  renderActions,
  alwaysVisible = false,
  emptyState,
  className,
}: ControlBarProps) {
  const store    = useControlBarStore()
  const barRef   = useRef<HTMLDivElement>(null)
  const tabsRef  = useRef<HTMLDivElement>(null)
  const [canScrollLeft,  setCanScrollLeft]  = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const tabs         = useControlBarState(s => s.tabs)
  const activeTabId  = useControlBarState(s => s.activeTabId)
  const height       = useControlBarState(s => s.height)
  const isCollapsed  = useControlBarState(s => s.isCollapsed)
  const isFullscreen = useControlBarState(s => s.isFullscreen)

  const resolvedMax   = maxHeight ?? (typeof window !== 'undefined' ? Math.floor(window.innerHeight * 0.8) : 800)
  const resolvedSnaps = snapPoints ?? [minHeight, 400]

  // --control-bar-height CSS variable
  useEffect(() => {
    const el = barRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--control-bar-height', `${el.offsetHeight}px`)
    })
    ro.observe(el)
    return () => { ro.disconnect(); document.documentElement.style.removeProperty('--control-bar-height') }
  }, [])

  // Tab scroll button visibility
  const updateScrollButtons = useCallback(() => {
    const el = tabsRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    const el = tabsRef.current
    if (!el) return
    updateScrollButtons()
    el.addEventListener('scroll', updateScrollButtons)
    const ro = new ResizeObserver(updateScrollButtons)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', updateScrollButtons); ro.disconnect() }
  }, [tabs, updateScrollButtons])

  const scrollTabs = (dir: 'left' | 'right') => {
    tabsRef.current?.scrollBy({ left: dir === 'left' ? -120 : 120, behavior: 'smooth' })
  }

  const isEmpty = tabs.length === 0
  if (isEmpty && !alwaysVisible) return null

  const s = store.getState()
  const actionCtx: ControlBarActionContext = {
    isCollapsed,
    isFullscreen,
    collapse:       () => s._collapse(),
    expand:         () => s._expand(),
    fullscreen:     () => s._fullscreen(),
    exitFullscreen: () => s._exitFullscreen(),
    onRequestOpen,
  }

  const displayHeight = isEmpty
    ? minHeight
    : isFullscreen
      ? (typeof window !== 'undefined' ? window.innerHeight : resolvedMax)
      : isCollapsed ? minHeight : height

  const contentHeight = displayHeight - minHeight

  return (
    <div ref={barRef} className={`control-bar-root${className ? ` ${className}` : ''}`}>
      <Resizable
        size={{ width: '100%', height: displayHeight }}
        minHeight={minHeight}
        maxHeight={isFullscreen ? window.innerHeight : resolvedMax}
        snap={{ y: resolvedSnaps }}
        snapGap={snapGap}
        enable={{
          top: !isEmpty && !isCollapsed && !isFullscreen,
          bottom: false, left: false, right: false,
          topLeft: false, topRight: false, bottomLeft: false, bottomRight: false,
        }}
        onResizeStop={(_e, _dir, _el, delta) => {
          const next = Math.min(resolvedMax, Math.max(minHeight, height + delta.height))
          store.getState()._setHeight(next)
          if (next <= minHeight) store.getState()._collapse()
          else store.getState()._expand()
        }}
      >
        {/* Header */}
        <div className="control-bar-header">
          {!isEmpty && canScrollLeft && (
            <button className="control-bar-scroll-btn control-bar-scroll-btn--left" onClick={() => scrollTabs('left')} aria-label="Scroll tabs left">‹</button>
          )}

          {isEmpty ? (
            <div className="control-bar-tabs control-bar-empty" role="status">{emptyState}</div>
          ) : (
            <div ref={tabsRef} className="control-bar-tabs">
              {tabs.map(tab => (
                <ControlBarTabItem
                  key={tab.id}
                  tab={tab}
                  isActive={tab.id === activeTabId}
                  onActivate={() => {
                    if (tab.id === activeTabId && !isCollapsed) store.getState()._collapse()
                    else store.getState()._activate(tab.id)
                  }}
                  onClose={() => store.getState()._close(tab.id)}
                />
              ))}
            </div>
          )}

          {!isEmpty && canScrollRight && (
            <button className="control-bar-scroll-btn control-bar-scroll-btn--right" onClick={() => scrollTabs('right')} aria-label="Scroll tabs right">›</button>
          )}

          <div className="control-bar-actions">
            {renderActions
              ? renderActions(actionCtx)
              : <DefaultActions ctx={actionCtx} isEmpty={isEmpty} />
            }
          </div>
        </div>

        {/* Content */}
        {!isEmpty && !isCollapsed && contentHeight > 0 && (
          <div className="control-bar-content" style={{ height: contentHeight }}>
            <ControlBarContent tabs={tabs} activeTabId={activeTabId} />
          </div>
        )}
      </Resizable>
    </div>
  )
}

function DefaultActions({ ctx, isEmpty }: { ctx: ControlBarActionContext; isEmpty: boolean }) {
  const { isCollapsed, isFullscreen, collapse, expand, fullscreen, exitFullscreen, onRequestOpen } = ctx

  if (isEmpty) {
    return onRequestOpen
      ? <button className="control-bar-action-btn" onClick={onRequestOpen} title="Open tab">+</button>
      : null
  }

  return (
    <>
      {onRequestOpen && (
        <button className="control-bar-action-btn" onClick={onRequestOpen} title="Open tab">+</button>
      )}
      {!isCollapsed && (
        <button
          className="control-bar-action-btn"
          onClick={isFullscreen ? exitFullscreen : fullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? '⤓' : '⤢'}
        </button>
      )}
      <button
        className="control-bar-action-btn"
        onClick={isCollapsed ? expand : collapse}
        title={isCollapsed ? 'Expand' : 'Collapse'}
      >
        {isCollapsed ? '▲' : '▼'}
      </button>
    </>
  )
}
