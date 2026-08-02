import { useEffect, useRef, CSSProperties } from 'react'
import {
  ControlBarProvider,
  useControlBar,
  registerTabType,
} from '@loykin/control-bar'
import '@loykin/control-bar/styles'

// ── Shared tab types ──────────────────────────────────────────────────────────

registerTabType('custom-terminal', {
  label: 'Terminal',
  render: (data: { pod: string }) => (
    <div style={{ padding: 16, fontFamily: 'monospace', fontSize: 12, color: 'var(--cb-foreground)' }}>
      <div style={{ color: 'var(--cb-muted-foreground)', marginBottom: 8 }}>$ terminal — {data.pod}</div>
      <div>{'>'} _</div>
    </div>
  ),
})

registerTabType('custom-log', {
  label: 'Log',
  render: (data: { pod: string }) => (
    <div style={{ padding: 16, fontFamily: 'monospace', fontSize: 12, color: 'var(--cb-foreground)' }}>
      <div style={{ color: 'var(--cb-muted-foreground)', marginBottom: 8 }}>log — {data.pod}</div>
      <div>INFO server started on :8080</div>
      <div>INFO GET /health 200 1ms</div>
    </div>
  ),
})

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-b border-border px-4 py-3">
      <h2 className="text-xs font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>}
    </div>
  )
}

// ── Custom theme presets ──────────────────────────────────────────────────────

const CUSTOM_THEMES: { label: string; description: string; vars: Record<string, string> }[] = [
  {
    label: 'Default',
    description: 'Inherits from base --basekit-* tokens.',
    vars: {},
  },
  {
    label: 'Dark Terminal',
    description: 'Dark background with green accent — classic terminal feel.',
    vars: {
      '--cb-background':       'oklch(0.13 0 0)',
      '--cb-foreground':       'oklch(0.85 0.12 145)',
      '--cb-muted':            'oklch(0.18 0 0)',
      '--cb-muted-foreground': 'oklch(0.5 0.08 145)',
      '--cb-border':           'oklch(0.28 0 0)',
      '--cb-primary':          'oklch(0.65 0.2 145)',
      '--cb-primary-foreground':'oklch(0.1 0 0)',
    },
  },
  {
    label: 'Warm',
    description: 'Warm off-white surface with amber accent.',
    vars: {
      '--cb-background':       'oklch(0.99 0.01 80)',
      '--cb-foreground':       'oklch(0.2 0.02 60)',
      '--cb-muted':            'oklch(0.95 0.02 80)',
      '--cb-muted-foreground': 'oklch(0.55 0.04 60)',
      '--cb-border':           'oklch(0.87 0.03 80)',
      '--cb-primary':          'oklch(0.6 0.18 50)',
      '--cb-primary-foreground':'oklch(0.99 0 0)',
    },
  },
  {
    label: 'High Contrast',
    description: 'Strong borders and pure black/white — maximum legibility.',
    vars: {
      '--cb-background':       'oklch(1 0 0)',
      '--cb-foreground':       'oklch(0 0 0)',
      '--cb-muted':            'oklch(0.94 0 0)',
      '--cb-muted-foreground': 'oklch(0.35 0 0)',
      '--cb-border':           'oklch(0.4 0 0)',
      '--cb-primary':          'oklch(0 0 0)',
      '--cb-primary-foreground':'oklch(1 0 0)',
    },
  },
]

function ThemedPreview({ vars }: { vars: Record<string, string> }) {
  return (
    <div style={vars as CSSProperties}
         className="relative h-28 overflow-hidden rounded border border-border">
      <div className="absolute bottom-0 left-0 right-0"
           style={{ background: 'var(--cb-background)', borderTop: '1px solid var(--cb-border)' }}>
        <div className="flex items-center overflow-hidden"
             style={{ height: 36, background: 'var(--cb-muted)', borderBottom: '1px solid var(--cb-border)' }}>
          {['Terminal', 'Log'].map((label, i) => (
            <div key={label} style={{
              display: 'inline-flex', alignItems: 'center',
              height: 36, padding: '0 12px',
              borderRight: '1px solid var(--cb-border)',
              background: i === 0 ? 'var(--cb-background)' : 'transparent',
              color: i === 0 ? 'var(--cb-foreground)' : 'var(--cb-muted-foreground)',
              borderTop: i === 0 ? '2px solid var(--cb-primary)' : undefined,
              fontSize: 12, flexShrink: 0,
            }}>
              {label}
            </div>
          ))}
        </div>
        <div style={{ padding: '6px 14px', fontFamily: 'monospace', fontSize: 11, color: 'var(--cb-foreground)' }}>
          <span style={{ color: 'var(--cb-muted-foreground)' }}>$ </span>kubectl get pods -n default_
        </div>
      </div>
    </div>
  )
}

function CustomThemesSection() {
  return (
    <section className="border border-border">
      <SectionHeader
        title="Custom Themes"
        description="Apply --cb-* overrides on the container to theme independently of the base tokens."
      />
      <div className="grid grid-cols-2 gap-4 p-4">
        {CUSTOM_THEMES.map(theme => (
          <div key={theme.label} className="flex flex-col gap-2">
            <div>
              <p className="text-[11px] font-medium text-foreground">{theme.label}</p>
              <p className="text-[10px] text-muted-foreground">{theme.description}</p>
            </div>
            <ThemedPreview vars={theme.vars} />
            {Object.keys(theme.vars).length > 0 && (
              <pre className="text-[10px] font-mono text-muted-foreground bg-muted/40 px-3 py-2 overflow-x-auto">
                {Object.entries(theme.vars).map(([k, v]) => `${k}: ${v};`).join('\n')}
              </pre>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Headless custom UI examples ───────────────────────────────────────────────

function OpenTabsOnMount({ types }: { types: { type: string; label: string; data: unknown }[] }) {
  const { open } = useControlBar()
  const initialized = useRef(false)
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    types.forEach(t => open(t as Parameters<typeof open>[0]))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

const DEMO_TABS = [
  { type: 'custom-terminal', label: 'Terminal', data: { pod: 'my-pod' } },
  { type: 'custom-log',      label: 'Log',      data: { pod: 'my-pod' } },
  { type: 'custom-terminal', label: 'Output',   data: { pod: 'my-pod' } },
]

function ContentArea() {
  const { tabs, activeTabId } = useControlBar()
  const active = tabs.find(t => t.id === activeTabId)
  return (
    <div style={{ flex: 1, padding: '8px 14px', fontFamily: 'monospace', fontSize: 11 }}>
      <span style={{ color: 'var(--basekit-muted-foreground)' }}>$ </span>
      <span style={{ color: 'var(--basekit-foreground)' }}>{active?.label.toLowerCase()} — my-pod_</span>
    </div>
  )
}

// Design 1: Browser tabs — tabs at top, rounded bottom connects to content
function BrowserTabsBar() {
  const { tabs, activeTabId, activate, close } = useControlBar()
  return (
    <div className="overflow-hidden rounded border border-border" style={{ height: 120 }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 2,
        padding: '0 6px', height: 34,
        background: 'var(--basekit-muted)',
        borderBottom: '1px solid var(--basekit-border)',
      }}>
        {tabs.map(tab => {
          const active = tab.id === activeTabId
          return (
            <button key={tab.id} onClick={() => activate(tab.id)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 28, padding: '0 10px',
              border: '1px solid var(--basekit-border)',
              borderTop: active ? '2px solid var(--basekit-primary)' : '1px solid var(--basekit-border)',
              borderBottom: active ? '1px solid var(--basekit-background)' : '1px solid var(--basekit-border)',
              borderRadius: '4px 4px 0 0',
              background: active ? 'var(--basekit-background)' : 'transparent',
              color: active ? 'var(--basekit-foreground)' : 'var(--basekit-muted-foreground)',
              fontSize: 11, cursor: 'pointer', flexShrink: 0,
              marginBottom: -1,
            }}>
              {tab.label}
              <span onClick={e => { e.stopPropagation(); close(tab.id) }}
                style={{ fontSize: 10, opacity: 0.5 }}>×</span>
            </button>
          )
        })}
      </div>
      <div style={{ flex: 1, background: 'var(--basekit-background)', height: 86 }}>
        <ContentArea />
      </div>
    </div>
  )
}

// Design 2: Sidebar — tabs as vertical list on the left, content on the right
function SidebarBar() {
  const { tabs, activeTabId, activate, close } = useControlBar()
  return (
    <div className="overflow-hidden rounded border border-border flex" style={{ height: 120 }}>
      <div style={{
        width: 96, flexShrink: 0,
        background: 'var(--basekit-muted)',
        borderRight: '1px solid var(--basekit-border)',
        display: 'flex', flexDirection: 'column',
        padding: '4px 0',
      }}>
        {tabs.map(tab => {
          const active = tab.id === activeTabId
          return (
            <button key={tab.id} onClick={() => activate(tab.id)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '5px 10px',
              border: 'none',
              borderLeft: active ? '2px solid var(--basekit-primary)' : '2px solid transparent',
              background: active ? 'var(--basekit-background)' : 'transparent',
              color: active ? 'var(--basekit-foreground)' : 'var(--basekit-muted-foreground)',
              fontSize: 11, cursor: 'pointer', textAlign: 'left',
            }}>
              <span style={{ truncate: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{tab.label}</span>
              <span onClick={e => { e.stopPropagation(); close(tab.id) }}
                style={{ fontSize: 10, opacity: 0.4, flexShrink: 0 }}>×</span>
            </button>
          )
        })}
      </div>
      <div style={{ flex: 1, background: 'var(--basekit-background)' }}>
        <ContentArea />
      </div>
    </div>
  )
}

// Design 3: VS Code — tabs at top, dark palette, blue top-border on active
function VSCodeBar() {
  const { tabs, activeTabId, activate, close } = useControlBar()
  return (
    <div className="overflow-hidden rounded border border-border" style={{ height: 120 }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        height: 34, background: '#252526',
        borderBottom: '1px solid #454545',
      }}>
        {tabs.map(tab => {
          const active = tab.id === activeTabId
          return (
            <button key={tab.id} onClick={() => activate(tab.id)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: '100%', padding: '0 12px',
              border: 'none',
              borderTop: active ? '1px solid #007acc' : '1px solid transparent',
              borderRight: '1px solid #3c3c3c',
              background: active ? '#1e1e1e' : 'transparent',
              color: active ? '#ffffff' : '#8c8c8c',
              fontSize: 11, cursor: 'pointer', flexShrink: 0,
            }}>
              {tab.label}
              <span onClick={e => { e.stopPropagation(); close(tab.id) }}
                style={{ fontSize: 10, opacity: 0.5, color: '#cccccc' }}>×</span>
            </button>
          )
        })}
      </div>
      <div style={{ background: '#1e1e1e', height: 86, padding: '8px 14px', fontFamily: 'monospace', fontSize: 11, color: '#d4d4d4' }}>
        <span style={{ color: '#6a9955' }}>$ </span>
        {tabs.find(t => t.id === activeTabId)?.label.toLowerCase()} — my-pod_
      </div>
    </div>
  )
}

const CUSTOM_UI_EXAMPLES = [
  {
    label: 'Browser Tabs',
    description: 'Tabs on top with content below — the active tab connects to the content area.',
    persistKey: 'cb-demo-browser',
    Bar: BrowserTabsBar,
  },
  {
    label: 'Sidebar',
    description: 'A vertical tab list on the left with content on the right — ideal for side panels and inspectors.',
    persistKey: 'cb-demo-sidebar',
    Bar: SidebarBar,
  },
  {
    label: 'VS Code',
    description: 'Tabs on top with a fixed dark palette and a blue top border when active — independent of --cb-* tokens.',
    persistKey: 'cb-demo-vscode',
    Bar: VSCodeBar,
  },
]

function CustomUISection() {
  return (
    <section className="border border-border">
      <SectionHeader
        title="Custom UI"
        description="useControlBar() provides tabs, activeTabId, activate, close — you own the markup and styles entirely."
      />
      <div className="grid grid-cols-3 gap-4 p-4">
        {CUSTOM_UI_EXAMPLES.map(({ label, description, persistKey, Bar }) => (
          <ControlBarProvider key={label} persistKey={persistKey}>
            <OpenTabsOnMount types={DEMO_TABS} />
            <div className="flex flex-col gap-2">
              <div>
                <p className="text-[11px] font-medium text-foreground">{label}</p>
                <p className="text-[10px] text-muted-foreground">{description}</p>
              </div>
              <Bar />
            </div>
          </ControlBarProvider>
        ))}
      </div>
    </section>
  )
}

// ── Tab export ────────────────────────────────────────────────────────────────

export function ControlBarCustomTab() {
  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <CustomThemesSection />
      <CustomUISection />
    </div>
  )
}
