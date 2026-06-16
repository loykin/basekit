import React from 'react'
import { clsx } from 'clsx'
import { getTabType } from './tabTypeRegistry'
import type { ControlBarTab } from './types'

interface ControlBarTabItemProps {
  tab: ControlBarTab
  isActive: boolean
  onActivate: () => void
  onClose: () => void
}

export function ControlBarTabItem({ tab, isActive, onActivate, onClose }: ControlBarTabItemProps) {
  const def = getTabType(tab.type)

  return (
    <button
      className={clsx('cb-tab', isActive && 'cb-tab--active')}
      onClick={onActivate}
      title={tab.label}
    >
      {def?.icon && <span className="cb-tab-icon">{def.icon}</span>}
      <span className="cb-tab-label">{tab.label}</span>
      <span
        className="cb-tab-close"
        role="button"
        aria-label={`Close ${tab.label}`}
        onClick={e => { e.stopPropagation(); onClose() }}
      >
        ✕
      </span>
    </button>
  )
}
