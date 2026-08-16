import React from 'react'
import { getTabType } from './tabTypeRegistry'
import type { ControlBarTab } from './types'

interface ControlBarContentProps {
  tabs: ControlBarTab[]
  activeTabId: string | null
}

export function ControlBarContent({ tabs, activeTabId }: ControlBarContentProps) {
  return (
    <>
      {tabs.map(tab => {
        const def = getTabType(tab.type)
        const isActive = tab.id === activeTabId
        return (
          <div
            key={tab.id}
            className="control-bar-panel"
            style={{ display: isActive ? 'flex' : 'none' }}
          >
            {def ? def.render(tab.data) : (
              <span style={{ padding: 16, color: 'var(--control-bar-muted-foreground)', fontSize: 12 }}>
                Unknown tab type: {tab.type}
              </span>
            )}
          </div>
        )
      })}
    </>
  )
}
