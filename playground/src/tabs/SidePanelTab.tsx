import { useRef, useState, useEffect } from 'react'
import {
  SidePanelProvider,
  useSidePanel,
  usePanelClose,
  usePanelGuard,
  type Side,
} from '@loykin/side-panel'
import '@loykin/side-panel/styles'
import type { TokenGroupDef } from '../components/TokensPanel'

export const TOKEN_GROUPS: TokenGroupDef[] = [
  {
    title: 'Side Panel Tokens',
    tokens: [
      { key: '--basekit-background', type: 'color', description: 'Panel content area background' },
      { key: '--basekit-card', type: 'color', description: 'Panel surface (.side-panel-panel)' },
      { key: '--basekit-border', type: 'color', description: 'Panel edge border' },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Badge({ children, color = 'gray' }: { children: React.ReactNode; color?: 'green' | 'blue' | 'gray' | 'red' }) {
  const colors = {
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    blue:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    gray:  'bg-muted text-muted-foreground',
    red:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return (
    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}

function Btn({
  children,
  onClick,
  variant = 'default',
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'default' | 'ghost' | 'danger'
}) {
  const styles = {
    default: 'bg-primary text-primary-foreground hover:opacity-90',
    ghost:   'border border-border hover:bg-muted',
    danger:  'border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950',
  }
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium transition-colors ${styles[variant]}`}
    >
      {children}
    </button>
  )
}

// ─── Panel content ────────────────────────────────────────────────────────────

type User = { id: number; name: string; role: string; status: 'active' | 'blocked'; joined: string }

function UserDetailPanel({ user }: { user: User }) {
  const close = usePanelClose()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div>
          <p className="text-sm font-semibold">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.role}</p>
        </div>
        <button onClick={close} className="text-muted-foreground hover:text-foreground text-lg leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-3">
          {[
            ['ID',      `#${user.id}`],
            ['Status',  <Badge color={user.status === 'active' ? 'green' : 'red'}>{user.status}</Badge>],
            ['Role',    user.role],
            ['Joined',  user.joined],
          ].map(([label, value]) => (
            <div key={String(label)}>
              <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
              <p>{value}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Bio</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
          </p>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border shrink-0 flex gap-2">
        <Btn>Edit</Btn>
        <Btn variant="ghost" onClick={close}>Close</Btn>
      </div>
    </div>
  )
}

function SettingsPanel() {
  const close = usePanelClose()
  const [dirty, setDirty] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <p className="text-sm font-semibold">Settings</p>
        <button onClick={close} className="text-muted-foreground hover:text-foreground text-lg leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm">
        <p className="text-xs text-muted-foreground">
          Change a value to trigger the <code className="font-mono bg-muted px-1">onBeforeClose</code> confirmation.
        </p>
        {['Notifications', 'Dark mode', 'Auto-save', 'Telemetry'].map((label) => (
          <label key={label} className="flex items-center justify-between cursor-pointer">
            <span>{label}</span>
            <input
              type="checkbox"
              className="w-4 h-4"
              onChange={() => setDirty(true)}
            />
          </label>
        ))}
        {dirty && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            ⚠ Unsaved changes — closing will ask for confirmation.
          </p>
        )}
      </div>

      <div className="px-4 py-3 border-t border-border shrink-0 flex gap-2">
        <Btn onClick={() => { setDirty(false); close() }}>Save & Close</Btn>
        <Btn variant="ghost" onClick={close}>Cancel</Btn>
      </div>
    </div>
  )
}

// ─── Example 1: open panel on table row click ─────────────────────────────────

const USERS: User[] = [
  { id: 1, name: 'Alice Kim',    role: 'Admin',   status: 'active',  joined: '2023-01-15' },
  { id: 2, name: 'Bob Lee',      role: 'Editor',  status: 'active',  joined: '2023-03-22' },
  { id: 3, name: 'Carol Park',   role: 'Viewer',  status: 'blocked', joined: '2023-06-08' },
  { id: 4, name: 'Dave Choi',    role: 'Editor',  status: 'active',  joined: '2024-01-30' },
  { id: 5, name: 'Eve Jeong',    role: 'Admin',   status: 'active',  joined: '2024-05-11' },
]

function UserTable() {
  const { open, isOpen } = useSidePanel()
  const [selected, setSelected] = useState<number | null>(null)

  const handleRowClick = (user: User) => {
    setSelected(user.id)
    open(<UserDetailPanel user={user} />, { size: 420 })
  }

  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="border-b border-border text-muted-foreground">
          <th className="text-left py-2 pr-4 font-medium w-8">#</th>
          <th className="text-left py-2 pr-4 font-medium">Name</th>
          <th className="text-left py-2 pr-4 font-medium">Role</th>
          <th className="text-left py-2 font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        {USERS.map((user) => {
          const isSelected = isOpen && selected === user.id
          return (
            <tr
              key={user.id}
              onClick={() => handleRowClick(user)}
              className={`border-t border-border cursor-pointer transition-colors ${
                isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'
              }`}
            >
              <td className="py-2 pr-4 text-muted-foreground">{user.id}</td>
              <td className="py-2 pr-4 font-medium">{user.name}</td>
              <td className="py-2 pr-4 text-muted-foreground">{user.role}</td>
              <td className="py-2">
                <Badge color={user.status === 'active' ? 'green' : 'red'}>{user.status}</Badge>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function Example1() {
  return (
    <div style={{ height: 480 }}>
      <SidePanelProvider defaultSize={420} defaultMinSize={320} defaultMaxSize={700} className="h-full border border-border">
        <div className="h-full flex flex-col">
          <div className="px-4 py-2 border-b border-border bg-muted/30 text-xs text-muted-foreground shrink-0">
            Row click → opens panel · Outside click → closes · Left edge drag → resize
          </div>
          <div className="flex-1 overflow-auto p-4">
            <UserTable />
          </div>
        </div>
      </SidePanelProvider>
    </div>
  )
}

// ─── Example 2: onBeforeClose ────────────────────────────────────────────────

function Example2() {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div style={{ height: 400 }}>
      <SidePanelProvider defaultSize={380} className="h-full border border-border">
        <Example2Inner onConfirm={() => setConfirmed(true)} confirmed={confirmed} />
      </SidePanelProvider>
    </div>
  )
}

function Example2Inner({ onConfirm, confirmed }: { onConfirm: () => void; confirmed: boolean }) {
  const { open, isOpen } = useSidePanel()

  const handleOpen = () => {
    open(<SettingsPanel />, {
      onBeforeClose: () => {
        const ok = window.confirm('Discard unsaved changes?')
        if (ok) onConfirm()
        return ok
      },
    })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 border-b border-border bg-muted/30 text-xs text-muted-foreground shrink-0">
        onBeforeClose — change a setting then try to close
      </div>
      <div className="flex-1 p-4 flex flex-col gap-3">
        <Btn onClick={handleOpen} variant={isOpen ? 'ghost' : 'default'}>
          {isOpen ? 'Panel is open' : 'Open Settings Panel'}
        </Btn>
        {confirmed && (
          <p className="text-xs text-green-600 dark:text-green-400">✓ User confirmed close</p>
        )}
        <p className="text-xs text-muted-foreground leading-relaxed">
          Change a checkbox inside the panel, then click outside or press Close.
          The panel intercepts the close and shows a confirmation.
        </p>
      </div>
    </div>
  )
}

// ─── Example 3: PanelGuard ───────────────────────────────────────────────────

function Example3() {
  return (
    <div style={{ height: 400 }}>
      <SidePanelProvider defaultSize={380} className="h-full border border-border">
        <Example3Inner />
      </SidePanelProvider>
    </div>
  )
}

function Example3Inner() {
  const { open, isOpen } = useSidePanel()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropOpen, setDropOpen] = useState(false)
  usePanelGuard(dropdownRef)

  const openPanel = () => {
    open(
      <SimplePanel title="Guard Demo" description="Click the dropdown outside — the panel stays open." />,
      { size: 340 },
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 border-b border-border bg-muted/30 text-xs text-muted-foreground shrink-0">
        usePanelGuard — clicking the dropdown does not close the panel
      </div>
      <div className="flex-1 p-4 flex flex-col gap-3">
        <div className="flex gap-2 items-start">
          <Btn onClick={openPanel} variant={isOpen ? 'ghost' : 'default'}>
            {isOpen ? 'Panel open' : 'Open panel'}
          </Btn>

          {/* This dropdown is registered as a guard — clicking it won't close the panel */}
          <div ref={dropdownRef} className="relative">
            <Btn variant="ghost" onClick={() => setDropOpen((v) => !v)}>
              Dropdown ▾
            </Btn>
            {dropOpen && (
              <div className="absolute top-full left-0 mt-1 border border-border bg-card z-10 min-w-32 shadow-sm">
                {['Option A', 'Option B', 'Option C'].map((opt) => (
                  <button
                    key={opt}
                    className="block w-full text-left px-3 py-2 text-xs hover:bg-muted"
                    onClick={() => setDropOpen(false)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          The dropdown ref is registered via <code className="font-mono bg-muted px-1">usePanelGuard</code>.
          Clicks inside it are excluded from the outside-click detector.
        </p>
      </div>
    </div>
  )
}

function SimplePanel({ title, description }: { title: string; description?: string }) {
  const close = usePanelClose()
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <p className="text-sm font-semibold">{title}</p>
        <button onClick={close} className="text-muted-foreground hover:text-foreground text-lg leading-none">✕</button>
      </div>
      <div className="flex-1 px-4 py-4">
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}

// ─── Token preview ────────────────────────────────────────────────────────────

export function SidePanelPreview() {
  return (
    <div style={{ height: 420 }}>
      <SidePanelProvider defaultSize={280} defaultMinSize={200} defaultMaxSize={500} className="h-full border border-border">
        <SidePanelPreviewInner />
      </SidePanelProvider>
    </div>
  )
}

function SidePanelPreviewInner() {
  const { open, isOpen } = useSidePanel()

  useEffect(() => {
    open(
      <SimplePanel title="Preview Panel" description="Edit tokens on the left to see panel colors change." />,
      { size: 280 }
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 border-b border-border bg-muted/30 text-xs text-muted-foreground shrink-0">
        Click outside the panel to close, then click "Open Panel" to reopen.
      </div>
      <div className="flex-1 p-4">
        {!isOpen && (
          <button
            onClick={() => open(
              <SimplePanel title="Preview Panel" description="Edit tokens on the left to see panel colors change." />,
              { size: 280 }
            )}
            className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded"
          >
            Open Panel
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Tab root ─────────────────────────────────────────────────────────────────

function Section({ title, description, children }: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <h2 className="text-xs font-semibold">{title}</h2>
        {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export function SidePanelTab() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl">

      <Section
        title="Row click → Side panel"
        description="Table and panel coexist. Main content stays interactive while the panel is open."
      >
        <Example1 />
      </Section>

      <Section
        title="onBeforeClose"
        description="Intercept close — sync or async. Return false to cancel."
      >
        <Example2 />
      </Section>

      <Section
        title="usePanelGuard"
        description="Register a ref to prevent clicks inside it from closing the panel."
      >
        <Example3 />
      </Section>

      <Section
        title="side option"
        description="Choose left / right / top / bottom. Size limits can also be set per open() call."
      >
        <Example4 />
      </Section>

    </div>
  )
}

// ─── Example 4: side selection ────────────────────────────────────────────────

const SIDES: Side[] = ['right', 'left', 'top', 'bottom']

function Example4() {
  return (
    <div style={{ height: 400 }}>
      <SidePanelProvider
        defaultSide="right"
        defaultSize={320}
        defaultMinSize={200}
        defaultMaxSize={600}
        className="h-full border border-border"
      >
        <Example4Inner />
      </SidePanelProvider>
    </div>
  )
}

function Example4Inner() {
  const { open, isOpen } = useSidePanel()

  const openSide = (side: Side) => {
    open(
      <SimplePanel
        title={`${side} panel`}
        description={`Opened from the ${side} side.`}
      />,
      { side },
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 border-b border-border bg-muted/30 text-xs text-muted-foreground shrink-0">
        side option — pick a direction with the buttons
      </div>
      <div className="flex-1 p-4 flex flex-col gap-3">
        <div className="flex gap-2 flex-wrap">
          {SIDES.map((side) => (
            <Btn key={side} onClick={() => openSide(side)} variant={isOpen ? 'ghost' : 'default'}>
              {side}
            </Btn>
          ))}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Each button calls <code className="font-mono bg-muted px-1">open(content, {'{ side }'})</code>.
          left/right panels resize by width; top/bottom panels resize by height.
        </p>
      </div>
    </div>
  )
}
