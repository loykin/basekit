import { useMemo, useRef, useState } from 'react'
import { FilterInput, FilterInputConfig, FilterValue, FilterVariable } from '@loykin/filter-input'
import '@loykin/filter-input/styles'
import type { TokenGroupDef } from '../components/TokensPanel'

export const TOKEN_GROUPS: TokenGroupDef[] = [
  {
    title: 'Base',
    description: 'Shared with other packages',
    tokens: [
      { key: '--basekit-background', type: 'color' },
      { key: '--basekit-foreground', type: 'color' },
      { key: '--basekit-popover', type: 'color', description: 'Dropdown popup surface' },
      { key: '--basekit-popover-foreground', type: 'color' },
      { key: '--basekit-muted', type: 'color', description: 'Hover backgrounds, tag fill' },
      { key: '--basekit-muted-foreground', type: 'color', description: 'Placeholder, count display' },
      { key: '--basekit-border', type: 'color', description: 'Outer borders, popup border' },
      { key: '--basekit-input', type: 'color', description: 'Input field border' },
      { key: '--basekit-ring', type: 'color', description: 'Focus ring' },
      { key: '--basekit-primary', type: 'color', description: 'Checked checkbox fill' },
      { key: '--basekit-primary-foreground', type: 'color' },
      { key: '--basekit-destructive', type: 'color', description: 'Required marker' },
      { key: '--basekit-radius', type: 'dimension', rangeMin: 0, rangeMax: 16 },
    ],
  },
  {
    title: 'Control overrides',
    description: 'FilterInput / FilterVariable only — inherits from Base tokens by default',
    tokens: [
      { key: '--basekit-fi-control-background', type: 'color', description: '↳ --basekit-background' },
      { key: '--basekit-fi-control-foreground', type: 'color', description: '↳ --basekit-foreground' },
      { key: '--basekit-fi-control-border', type: 'color', description: '↳ --basekit-input' },
      { key: '--basekit-fi-control-placeholder', type: 'color', description: '↳ --basekit-muted-foreground' },
      { key: '--basekit-fi-separator', type: 'color', description: 'Label | value divider' },
    ],
  },
]

function Code({ children }: { children: string }) {
  return (
    <pre className="text-[11px] font-mono bg-muted text-muted-foreground px-3 py-2 overflow-x-auto whitespace-pre">
      {children.trim()}
    </pre>
  )
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-b border-border px-4 py-3">
      <h2 className="text-xs font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>}
    </div>
  )
}

const statusOptions = [
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
  { label: 'Archived', value: 'archived' },
]

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' },
]

const categoryOptions = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Beta', value: 'beta' },
  { label: 'Gamma', value: 'gamma' },
  { label: 'Delta', value: 'delta' },
  { label: 'Epsilon', value: 'epsilon' },
]

export function FilterInputPreview() {
  const [vals, setVals] = useState<Record<string, FilterValue>>({
    keyword: '',
    state: 'open',
    tags: ['alpha'],
  })
  const update = (v: FilterValue, ctx: { key: string }) =>
    setVals(prev => ({ ...prev, [ctx.key]: v }))

  return (
    <div className="flex flex-col gap-3" style={{ maxWidth: 360 }}>
      <FilterVariable
        config={{ key: 'keyword', label: 'Keyword', type: 'text', placeholder: 'Type...', behavior: { clearable: true } }}
        value={vals.keyword}
        onChange={update}
      />
      <FilterVariable
        config={{ key: 'state', label: 'State', type: 'select', options: statusOptions }}
        value={vals.state}
        onChange={update}
      />
      <FilterVariable
        config={{
          key: 'tags',
          label: 'Tags',
          type: 'multi-select',
          options: categoryOptions,
          behavior: { searchable: true },
          display: { variant: 'tags', maxVisible: 3, overflow: 'count', removable: true },
        }}
        value={vals.tags as string[]}
        onChange={update}
      />
      <FilterVariable
        config={{ key: 'search', type: 'text', placeholder: 'No label…' }}
        value={vals.search as string ?? ''}
        onChange={update}
      />
    </div>
  )
}

const ALL_USERS = [
  { label: 'Alice', value: 'alice' },
  { label: 'Bob', value: 'bob' },
  { label: 'Charlie', value: 'charlie' },
  { label: 'Diana', value: 'diana' },
  { label: 'Eve', value: 'eve' },
]

function AsyncSection() {
  const [vals, setVals] = useState<Record<string, FilterValue>>({ user: '', users: [] })
  const update = (v: FilterValue, ctx: { key: string }) =>
    setVals(prev => ({ ...prev, [ctx.key]: v }))

  const fetchCountRef = useRef(0)
  const [fetchLog, setFetchLog] = useState<string[]>([])
  const [simulateError, setSimulateError] = useState(false)

  const makeFetch = (key: string) => async ({ query, signal }: { query?: string; signal?: AbortSignal }) => {
    const n = ++fetchCountRef.current
    const willFail = simulateError
    setFetchLog(prev => [...prev, `#${n} [${key}] fetch (query="${query}"${willFail ? ', will fail' : ''})`])
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(resolve, 600)
      signal?.addEventListener('abort', () => { clearTimeout(t); reject(new Error('aborted')) })
    })
    if (willFail) throw new Error('Network error (simulated)')
    const q = query?.toLowerCase() ?? ''
    return ALL_USERS.filter(u => u.label.toLowerCase().includes(q))
  }

  const lazySelectConfig = useMemo<FilterInputConfig>(() => ({
    key: 'user',
    label: 'User (searchable)',
    type: 'select',
    placeholder: 'Select user...',
    behavior: { searchable: true },
    dataSource: { type: 'remote', trigger: 'open', fetch: makeFetch('select') },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [simulateError])

  const lazyMultiConfig = useMemo<FilterInputConfig>(() => ({
    key: 'users',
    label: 'Users',
    type: 'multi-select',
    placeholder: 'Select users...',
    behavior: { searchable: true },
    display: { variant: 'tags', maxVisible: 3, overflow: 'count' },
    dataSource: { type: 'remote', trigger: 'open', fetch: makeFetch('multi') },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [simulateError])

  const noReloadConfig = useMemo<FilterInputConfig>(() => ({
    key: 'user2',
    label: 'No reload btn',
    type: 'select',
    placeholder: 'Select user...',
    behavior: { showReload: false },
    dataSource: { type: 'remote', trigger: 'open', fetch: makeFetch('no-reload') },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [simulateError])

  return (
    <section className="border border-border">
      <SectionHeader
        title="Async / Lazy loading + Reload"
        description="trigger: 'open' — fetch runs only on first open, not on mount. Reload button appears automatically for remote sources."
      />
      <div className="flex flex-col gap-3 p-4">
        <Code>{`dataSource: {
  type: 'remote',
  trigger: 'open',   // 'immediate' (default) | 'open'
  fetch: async ({ query, signal }) => fetchUsers(query),
}
// reload button is shown automatically for any remote source`}</Code>
        <label className="flex items-center gap-2 text-[12px] text-muted-foreground cursor-pointer select-none">
          <input type="checkbox" checked={simulateError} onChange={e => setSimulateError(e.target.checked)} />
          Simulate fetch error (next fetch will fail)
        </label>
        <Code>{`// hide reload button
behavior: { showReload: false }`}</Code>
        <div className="flex flex-col gap-2">
          <FilterVariable config={lazySelectConfig} value={vals.user} onChange={update} />
          <FilterVariable config={lazyMultiConfig} value={vals.users as string[]} onChange={update} />
          <FilterVariable config={noReloadConfig} value={vals.user2 as string ?? ''} onChange={update} />
        </div>
        <div className="border border-border bg-background p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Fetch log</span>
            <button
              type="button"
              className="text-[10px] text-muted-foreground hover:text-foreground"
              onClick={() => { fetchCountRef.current = 0; setFetchLog([]) }}
            >
              Clear
            </button>
          </div>
          {fetchLog.length === 0
            ? <p className="text-[11px] text-muted-foreground">Open a dropdown to see fetch calls logged here.</p>
            : fetchLog.map((line, i) => (
              <p key={i} className="text-[11px] font-mono text-muted-foreground">{line}</p>
            ))
          }
        </div>
      </div>
    </section>
  )
}

export function FilterInputTab() {
  const [labeled, setLabeled] = useState<Record<string, FilterValue>>({
    keyword: 'abc',
    keywords: ['a', 'b'],
    state: 'open',
    categories: ['alpha', 'beta'],
  })

  const [unlabeled, setUnlabeled] = useState<Record<string, FilterValue>>({
    search: '',
    priority: 'medium',
    tags: ['react', 'ts'],
  })

  const [standalone, setStandalone] = useState<Record<string, FilterValue>>({
    text: '',
    note: '',
    count: 5,
    active: 'true',
    status: '',
    picks: ['alpha'],
  })

  const labeledConfigs = useMemo<FilterInputConfig[]>(() => [
    { key: 'keyword', label: 'Keyword', type: 'text', placeholder: 'Type text...', behavior: { clearable: true } },
    {
      key: 'keywords',
      label: 'Keywords',
      type: 'tag',
      placeholder: 'Type and press Enter',
      display: { variant: 'tags', maxVisible: 3, overflow: 'count', removable: true },
    },
    { key: 'state', label: 'State', type: 'select', options: statusOptions },
    {
      key: 'categories',
      label: 'Categories',
      type: 'multi-select',
      options: categoryOptions,
      behavior: { searchable: true },
      display: { variant: 'tags', maxVisible: 2, overflow: 'count', removable: true },
    },
  ], [])

  const unlabeledConfigs = useMemo<FilterInputConfig[]>(() => [
    { key: 'search', type: 'text', placeholder: 'Search…', behavior: { clearable: true } },
    { key: 'priority', type: 'select', options: priorityOptions },
    {
      key: 'tags',
      type: 'tag',
      placeholder: 'Add tag…',
      display: { variant: 'tags', maxVisible: 3, overflow: 'count', removable: true },
    },
  ], [])

  const standaloneConfigs = useMemo<FilterInputConfig[]>(() => [
    { key: 'text', type: 'text', placeholder: 'Plain text input' },
    { key: 'note', type: 'textarea', placeholder: 'Textarea input' },
    { key: 'count', type: 'number', validation: { min: 0, max: 100 } },
    { key: 'active', type: 'boolean' },
    { key: 'status', type: 'select', options: statusOptions },
    {
      key: 'picks',
      type: 'multi-select',
      options: categoryOptions,
      behavior: { searchable: true },
      display: { variant: 'tags', maxVisible: 2, overflow: 'count', removable: true },
    },
  ], [])

  return (
    <div className="flex max-w-3xl flex-col gap-4">

      {/* ── FilterVariable with labels ──────────────────── */}
      <section className="border border-border">
        <SectionHeader
          title="FilterVariable — with label"
          description="Label on the left acts as the key. The right area renders by config.type."
        />
        <div className="flex flex-col gap-3 p-4">
          <Code>{`<FilterVariable
  config={{ key: 'categories', label: 'Categories', type: 'multi-select', options }}
  value={values.categories}
  onChange={(v, ctx) => setValues(prev => ({ ...prev, [ctx.key]: v }))}
/>`}</Code>
          <div className="flex flex-col gap-2">
            {labeledConfigs.map((config) => (
              <FilterVariable
                key={config.key}
                config={config}
                value={labeled[config.key]}
                values={labeled}
                onChange={(value, ctx) => setLabeled(prev => ({ ...prev, [ctx.key]: value }))}
              />
            ))}
          </div>
          <pre className="text-[11px] font-mono border border-border bg-background p-3 text-muted-foreground">
            {JSON.stringify(labeled, null, 2)}
          </pre>
        </div>
      </section>

      {/* ── FilterVariable without labels ───────────────── */}
      <section className="border border-border">
        <SectionHeader
          title="FilterVariable — no label"
          description="Omit config.label (or set to undefined) to render the value field full-width with no prefix."
        />
        <div className="flex flex-col gap-3 p-4">
          <Code>{`// No label prop — control fills the full width
<FilterVariable
  config={{ key: 'search', type: 'text', placeholder: 'Search…' }}
  value={values.search}
  onChange={(v, ctx) => setValues(prev => ({ ...prev, [ctx.key]: v }))}
/>`}</Code>
          <div className="flex flex-col gap-2">
            {unlabeledConfigs.map((config) => (
              <FilterVariable
                key={config.key}
                config={config}
                value={unlabeled[config.key]}
                values={unlabeled}
                onChange={(value, ctx) => setUnlabeled(prev => ({ ...prev, [ctx.key]: value }))}
              />
            ))}
          </div>
          <pre className="text-[11px] font-mono border border-border bg-background p-3 text-muted-foreground">
            {JSON.stringify(unlabeled, null, 2)}
          </pre>
        </div>
      </section>

      {/* ── Standalone FilterInput ───────────────────────── */}
      <section className="border border-border">
        <SectionHeader
          title="FilterInput — standalone"
          description="Use FilterInput directly when you want just the field without the label wrapper."
        />
        <div className="flex flex-col gap-3 p-4">
          <Code>{`// FilterInput renders only the input, no label or border wrapper
<FilterInput
  config={{ key: 'status', type: 'select', options }}
  value={values.status}
  onChange={(v, ctx) => setValues(prev => ({ ...prev, [ctx.key]: v }))}
/>`}</Code>
          <div className="grid grid-cols-2 gap-3">
            {standaloneConfigs.map((config) => (
              <div key={config.key} className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                  {config.key} ({config.type})
                </span>
                <FilterInput
                  config={config}
                  value={standalone[config.key]}
                  filters={standalone}
                  onChange={(value, ctx) => setStandalone(prev => ({ ...prev, [ctx.key]: value }))}
                />
              </div>
            ))}
          </div>
          <pre className="text-[11px] font-mono border border-border bg-background p-3 text-muted-foreground">
            {JSON.stringify(standalone, null, 2)}
          </pre>
        </div>
      </section>

      {/* ── Async / lazy loading ─────────────────────────── */}
      <AsyncSection />

      {/* ── Shape reference ──────────────────────────────── */}
      <section className="border border-border">
        <SectionHeader title="Shape" />
        <div className="p-4">
          <Code>{`With label:
┌──────────────────────────────────────────────────┐
│ Categories │ [ Alpha x ][ Beta x ]            v  │
└──────────────────────────────────────────────────┘

Without label (.fi-variable with no .fi-variable-label):
┌──────────────────────────────────────────────────┐
│ [ Alpha x ][ Beta x ]                        v   │
└──────────────────────────────────────────────────┘

Standalone (no .fi-variable wrapper):
[ Alpha x ][ Beta x ]                         v

Types: text · textarea · number · boolean · select · multi-select · tag`}</Code>
        </div>
      </section>

    </div>
  )
}
