import { useState } from 'react'
import { DatetimeRangeTab } from './tabs/DatetimeRangeTab'
import { UnitTab } from './tabs/UnitTab'

const TABS = [
  { id: 'datetime-range', label: 'Datetime Range', content: <DatetimeRangeTab /> },
  { id: 'unit',           label: 'Unit',           content: <UnitTab /> },
] as const

type TabId = (typeof TABS)[number]['id']

export default function App() {
  const [active, setActive] = useState<TabId>('datetime-range')
  const [dark, setDark] = useState(false)
  const current = TABS.find((t) => t.id === active)!

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground">

        {/* Header */}
        <div className="border-b border-border px-8 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">basekit Playground</h1>
            <p className="text-xs text-muted-foreground mt-0.5">@loykin/basekit</p>
          </div>
          <button
            className="text-xs border border-border px-3 py-1.5 hover:bg-muted transition-colors"
            onClick={() => setDark(d => !d)}
          >
            {dark ? 'Light' : 'Dark'}
          </button>
        </div>

        {/* Tab bar */}
        <div className="border-b border-border px-8">
          <div className="flex gap-0 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                  active === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">{current.content}</div>

      </div>
    </div>
  )
}
