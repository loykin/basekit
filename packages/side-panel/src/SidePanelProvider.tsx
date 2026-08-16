'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useStore } from 'zustand'
import { Resizable } from 're-resizable'
import { clsx } from 'clsx'
import { createSidePanelStore, SidePanelStore, PanelOptions, Side } from './sidePanelStore'

function cn(...inputs: Parameters<typeof clsx>) {
  return clsx(inputs)
}

type GuardRef = React.RefObject<HTMLDivElement | null>

export type SidePanelContextValue = {
  store: SidePanelStore
  open: (content: React.ReactNode, options?: PanelOptions) => void
  close: () => Promise<void>
  registerGuard: (ref: GuardRef) => void
  unregisterGuard: (ref: GuardRef) => void
}

export const SidePanelContext = createContext<SidePanelContextValue | null>(null)

export function useSidePanelContext(): SidePanelContextValue {
  const ctx = useContext(SidePanelContext)
  if (!ctx) throw new Error('useSidePanelContext: must be used within <SidePanelProvider>')
  return ctx
}

export type SidePanelProviderProps = {
  children: React.ReactNode
  defaultSide?: Side
  defaultSize?: number
  defaultMinSize?: number
  defaultMaxSize?: number
  className?: string
  style?: React.CSSProperties
}

export function SidePanelProvider({
  children,
  defaultSide = 'right',
  defaultSize = 560,
  defaultMinSize = 400,
  defaultMaxSize = 1000,
  className,
  style,
}: SidePanelProviderProps) {
  const storeRef = useRef<SidePanelStore | null>(null)
  if (!storeRef.current) {
    storeRef.current = createSidePanelStore({
      side: defaultSide,
      size: defaultSize,
      minSize: defaultMinSize,
      maxSize: defaultMaxSize,
    })
  }
  const store = storeRef.current
  const guardRefs = useRef<GuardRef[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const registerGuard = useCallback((ref: GuardRef) => {
    guardRefs.current.push(ref)
  }, [])

  const unregisterGuard = useCallback((ref: GuardRef) => {
    const idx = guardRefs.current.indexOf(ref)
    if (idx > -1) guardRefs.current.splice(idx, 1)
  }, [])

  const close = useCallback(async () => {
    const { options, _close } = store.getState()
    if (options.onBeforeClose) {
      const canClose = await options.onBeforeClose()
      if (!canClose) return
    }
    _close()
  }, [store])

  const open = useCallback(
    (content: React.ReactNode, options?: PanelOptions) => {
      store.getState()._open(content, options ?? {})
    },
    [store],
  )

  return (
    <SidePanelContext.Provider value={{ store, open, close, registerGuard, unregisterGuard }}>
      <div ref={containerRef} className={cn('side-panel-root', className)} style={style}>
        {children}
        <SidePanelSlot
          store={store}
          close={close}
          guardRefs={guardRefs}
          containerRef={containerRef}
          defaultMinSize={defaultMinSize}
          defaultMaxSize={defaultMaxSize}
        />
      </div>
    </SidePanelContext.Provider>
  )
}

type SidePanelSlotProps = {
  store: SidePanelStore
  close: () => Promise<void>
  guardRefs: React.RefObject<GuardRef[]>
  containerRef: React.RefObject<HTMLDivElement | null>
  defaultMinSize: number
  defaultMaxSize: number
}

function SidePanelSlot({
  store,
  close,
  guardRefs,
  containerRef,
  defaultMinSize,
  defaultMaxSize,
}: SidePanelSlotProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [containerWidth, setContainerWidth] = useState(Infinity)
  const [containerHeight, setContainerHeight] = useState(Infinity)

  const isOpen = useStore(store, (s) => s.isOpen)
  const size = useStore(store, (s) => s.size)
  const content = useStore(store, (s) => s.content)
  const options = useStore(store, (s) => s.options)

  // Clamp panel size within the container's actual bounds.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    setContainerWidth(el.offsetWidth)
    setContainerHeight(el.offsetHeight)
    const ro = new ResizeObserver(() => {
      setContainerWidth(el.offsetWidth)
      setContainerHeight(el.offsetHeight)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [containerRef])

  const side: Side = options.side ?? 'right'
  const isHorizontal = side === 'left' || side === 'right'
  const containerSize = isHorizontal ? containerWidth : containerHeight

  const resizable = options.resizable ?? true
  const minSize = options.minSize ?? defaultMinSize
  const maxSize = Math.min(options.maxSize ?? defaultMaxSize, containerSize)
  const snapPoints = options.snapPoints
  const snapGap = options.snapGap ?? 20
  const closeOnOutsideClick = options.closeOnOutsideClick ?? true
  const closeOnEsc = options.closeOnEsc ?? true

  const positionStyle: React.CSSProperties = isHorizontal
    ? { position: 'absolute', [side]: 0, top: 0, bottom: 0 }
    : { position: 'absolute', [side]: 0, left: 0, right: 0 }

  // Only the handle facing the main content area is enabled.
  const resizeEnable = {
    top:         resizable && side === 'bottom',
    right:       resizable && side === 'left',
    bottom:      resizable && side === 'top',
    left:        resizable && side === 'right',
    topRight:    false,
    bottomRight: false,
    bottomLeft:  false,
    topLeft:     false,
  }

  // Capture phase fires before React's onClick. If the same click also calls
  // open(), _open() runs afterward and overrides _close() via React 18 batching.
  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick || isResizing) return

    const handler = (e: MouseEvent) => {
      if (panelRef.current?.contains(e.target as Node)) return
      if (guardRefs.current.some((ref) => ref.current?.contains(e.target as Node))) return
      if (document.querySelector('[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]')) return
      close()
    }

    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [isOpen, closeOnOutsideClick, isResizing, close, guardRefs])

  useEffect(() => {
    if (!isOpen || !closeOnEsc) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, closeOnEsc, close])

  if (!isOpen) return null

  return (
    <Resizable
      style={positionStyle}
      size={isHorizontal ? { width: size } : { height: size }}
      minWidth={isHorizontal ? minSize : undefined}
      maxWidth={isHorizontal ? maxSize : undefined}
      minHeight={!isHorizontal ? minSize : undefined}
      maxHeight={!isHorizontal ? maxSize : undefined}
      snap={isHorizontal ? { x: snapPoints } : { y: snapPoints }}
      snapGap={snapGap}
      onResizeStart={() => setIsResizing(true)}
      onResizeStop={(_e, _dir, _el, delta) => {
        store.getState()._setSize(size + (isHorizontal ? delta.width : delta.height))
        setIsResizing(false)
      }}
      enable={resizeEnable}
      className="side-panel-panel"
      data-side={side}
    >
      <div ref={panelRef} className="side-panel-panel-content">
        {content}
      </div>
    </Resizable>
  )
}
