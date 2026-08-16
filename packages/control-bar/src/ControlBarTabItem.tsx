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
      className={clsx('control-bar-tab', isActive && 'control-bar-tab--active')}
      onClick={onActivate}
      title={tab.label}
    >
      {def?.icon && <span className="control-bar-tab-icon">{def.icon}</span>}
      <span className="control-bar-tab-label">{tab.label}</span>
      <span
        className="control-bar-tab-close"
        role="button"
        aria-label={`Close ${tab.label}`}
        onClick={e => { e.stopPropagation(); onClose() }}
      >
        ✕
      </span>
    </button>
  )
}
