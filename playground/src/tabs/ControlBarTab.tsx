import { useEffect } from 'react'
import {
  ControlBarProvider,
  ControlBarBody,
  ControlBar,
  useControlBar,
  registerTabType,
} from '@loykin/control-bar'
import '@loykin/control-bar/styles'
import type { TokenGroupDef } from '../components/TokensPanel'

// ── Register tab types once ───────────────────────────────────────────────────

registerTabType('terminal', {
  label: 'Terminal',
  render: (data: { pod: string; namespace: string }) => (
    <div style={{ padding: 16, fontFamily: 'monospace', fontSize: 12, color: 'var(--control-bar-foreground)' }}>
      <div style={{ color: 'var(--control-bar-muted-foreground)', marginBottom: 8 }}>
        $ terminal — {data.pod} / {data.namespace}
      </div>
      <div>{'>'} _</div>
    </div>
  ),
})

registerTabType('log', {
  label: 'Log',
  render: (data: { pod: string; lines: string[] }) => (
    <div style={{ padding: 16, fontFamily: 'monospace', fontSize: 12, color: 'var(--control-bar-foreground)', overflow: 'auto', height: '100%' }}>
      <div style={{ color: 'var(--control-bar-muted-foreground)', marginBottom: 8 }}>
        log — {data.pod}
      </div>
      {data.lines.map((line, i) => <div key={i}>{line}</div>)}
    </div>
  ),
})

// ── Demo controls ─────────────────────────────────────────────────────────────

function DemoControls() {
  const { open, close, tabs, activeTabId } = useControlBar()

  // Open one tab on mount so the bar is visible by default
  useEffect(() => {
    open({
      type: 'terminal',
      label: 'Terminal — my-pod',
      data: { pod: 'my-pod', namespace: 'default' },
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Open tabs</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="datetime-range-btn" data-variant="outline" data-size="sm"
            onClick={() => open({ type: 'terminal', label: 'Terminal — pod-1', data: { pod: 'pod-1', namespace: 'default' } })}
          >
            + Terminal (pod-1)
          </button>
          <button
            className="datetime-range-btn" data-variant="outline" data-size="sm"
            onClick={() => open({ type: 'terminal', label: 'Terminal — pod-2', data: { pod: 'pod-2', namespace: 'kube-system' } })}
          >
            + Terminal (pod-2)
          </button>
          <button
            className="datetime-range-btn" data-variant="outline" data-size="sm"
            onClick={() => open({
              type: 'log',
              label: 'Log — my-pod',
              data: {
                pod: 'my-pod',
                lines: [
                  '2024-01-01 00:00:00 INFO  Starting server...',
                  '2024-01-01 00:00:01 INFO  Listening on :8080',
                  '2024-01-01 00:00:02 DEBUG Received request GET /health',
                  '2024-01-01 00:00:02 INFO  200 OK /health 1ms',
                ],
              },
            })}
          >
            + Log
          </button>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Open tabs ({tabs.length})</h2>
        {tabs.length === 0
          ? <p style={{ fontSize: 11, color: 'var(--basekit-muted-foreground)' }}>No tabs open.</p>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {tabs.map(tab => (
                <div key={tab.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <span style={{
                    display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                    background: tab.id === activeTabId ? 'var(--basekit-primary)' : 'var(--basekit-border)',
                  }} />
                  <span>{tab.label}</span>
                  <button
                    className="datetime-range-btn" data-variant="ghost" data-size="xs"
                    onClick={() => close(tab.id)}
                  >
                    Close
                  </button>
                </div>
              ))}
            </div>
          )
        }
      </div>

      <p style={{ fontSize: 11, color: 'var(--basekit-muted-foreground)' }}>
        The bar at the bottom is fixed-position. Drag the top edge to resize. Click a tab to toggle collapse.
      </p>
    </div>
  )
}

// ── Token groups ──────────────────────────────────────────────────────────────

export const TOKEN_GROUPS: TokenGroupDef[] = [
  {
    title: 'Base',
    description: 'Shared with other packages',
    tokens: [
      { key: '--basekit-background',        type: 'color' },
      { key: '--basekit-foreground',        type: 'color' },
      { key: '--basekit-muted',             type: 'color' },
      { key: '--basekit-muted-foreground',  type: 'color', description: 'De-emphasized text' },
      { key: '--basekit-border',            type: 'color' },
      { key: '--basekit-primary',           type: 'color', description: 'Active tab indicator' },
      { key: '--basekit-primary-foreground',type: 'color' },
      { key: '--basekit-radius',            type: 'dimension', rangeMin: 0, rangeMax: 16 },
    ],
  },
  {
    title: 'Control Bar overrides',
    description: '--control-bar-* tokens override independently of base theme',
    tokens: [
      { key: '--control-bar-background',        type: 'color', description: '↳ --basekit-background' },
      { key: '--control-bar-foreground',        type: 'color', description: '↳ --basekit-foreground' },
      { key: '--control-bar-muted',             type: 'color', description: '↳ --basekit-muted' },
      { key: '--control-bar-muted-foreground',  type: 'color', description: '↳ --basekit-muted-foreground' },
      { key: '--control-bar-border',            type: 'color', description: '↳ --basekit-border' },
      { key: '--control-bar-primary',           type: 'color', description: '↳ --basekit-primary' },
      { key: '--control-bar-primary-foreground',type: 'color', description: '↳ --basekit-primary-foreground' },
      { key: '--control-bar-radius',            type: 'dimension', rangeMin: 0, rangeMax: 16, description: '↳ --basekit-radius' },
    ],
  },
]

// ── Token preview ─────────────────────────────────────────────────────────────

const PREVIEW_TABS = ['Terminal', 'Log', 'Output']

export function ControlBarPreview() {
  return (
    <div className="relative h-24 overflow-hidden rounded border border-border">
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ background: 'var(--control-bar-background)', borderTop: '1px solid var(--control-bar-border)' }}
      >
        <div
          className="flex items-center overflow-hidden"
          style={{ height: 'var(--control-bar-header-height, 36px)', background: 'var(--control-bar-muted)', borderBottom: '1px solid var(--control-bar-border)' }}
        >
          {PREVIEW_TABS.map((label, i) => (
            <div
              key={label}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 'var(--control-bar-header-height, 36px)',
                padding: '0 12px',
                borderRight: '1px solid var(--control-bar-border)',
                background: i === 0 ? 'var(--control-bar-background)' : 'transparent',
                color: i === 0 ? 'var(--control-bar-foreground)' : 'var(--control-bar-muted-foreground)',
                fontSize: 12,
                borderTop: i === 0 ? '2px solid var(--control-bar-primary)' : undefined,
                flexShrink: 0,
              }}
            >
              {label}
            </div>
          ))}
        </div>
        <div style={{ padding: '6px 14px', fontFamily: 'monospace', fontSize: 11, color: 'var(--control-bar-foreground)' }}>
          <span style={{ color: 'var(--control-bar-muted-foreground)' }}>$ </span>terminal — my-pod_
        </div>
      </div>
    </div>
  )
}

// ── Tab export ────────────────────────────────────────────────────────────────

export function ControlBarTab() {
  return (
    <ControlBarProvider persistKey="playground-control-bar">
      <ControlBarBody>
        <DemoControls />
      </ControlBarBody>
      <ControlBar
        snapPoints={[36, 200, 400]}
        onRequestOpen={() => {
          // In a real app, open a tab picker here
        }}
      />
    </ControlBarProvider>
  )
}
