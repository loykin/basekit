import { useCallback, useEffect, useMemo, useState } from 'react'

export type TokenDef = {
  key: string
  type: 'color' | 'dimension'
  description?: string
  rangeMin?: number
  rangeMax?: number
}

export type TokenGroupDef = {
  title: string
  description?: string
  tokens: TokenDef[]
}

function resolveColorInfo(cssValue: string): { hex: string; opaque: boolean } | null {
  if (!cssValue) return null
  try {
    const c = document.createElement('canvas')
    c.width = c.height = 1
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = cssValue.trim()
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
    return {
      hex: '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join(''),
      opaque: a >= 230,
    }
  } catch {
    return null
  }
}

function readValues(keys: string[]): Record<string, string> {
  const s = getComputedStyle(document.documentElement)
  return Object.fromEntries(keys.map(k => [k, s.getPropertyValue(k).trim()]))
}

function TokenRow({
  token,
  value,
  hexValue,
  showPicker,
  isOverride,
  onChange,
  onReset,
}: {
  token: TokenDef
  value: string
  hexValue: string
  showPicker: boolean
  isOverride: boolean
  onChange: (key: string, cssValue: string, newHex?: string) => void
  onReset: (key: string) => void
}) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      {/* Swatch — clickable for color tokens */}
      <div
        className="w-5 h-5 rounded-sm border border-black/10 shrink-0 relative overflow-hidden"
        style={{ background: `var(${token.key})` }}
        title={showPicker ? 'Click to pick color' : undefined}
      >
        {token.type === 'color' && showPicker && (
          <input
            key={hexValue}
            type="color"
            defaultValue={hexValue}
            onChange={e => onChange(token.key, e.target.value, e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        )}
      </div>

      {/* Token name + description */}
      <div className="w-52 shrink-0">
        <code className="text-[11px] font-mono block leading-none text-foreground">{token.key}</code>
        {token.description && (
          <span className="text-[10px] text-muted-foreground">{token.description}</span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {token.type === 'dimension' && (
          <input
            type="range"
            min={token.rangeMin ?? 0}
            max={token.rangeMax ?? 16}
            step={1}
            value={parseFloat(value) || 0}
            onChange={e => onChange(token.key, `${e.target.value}px`)}
            className="w-24 shrink-0 cursor-pointer accent-primary"
          />
        )}
        <input
          type="text"
          value={value}
          onChange={e => onChange(token.key, e.target.value)}
          className="h-6 flex-1 min-w-0 px-2 text-[11px] font-mono border border-border rounded bg-background text-foreground outline-none focus:border-ring"
          spellCheck={false}
        />
        {isOverride && (
          <button
            onClick={() => onReset(token.key)}
            className="shrink-0 h-6 px-1.5 text-[10px] border border-border rounded bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Reset to theme default"
          >
            ↩
          </button>
        )}
      </div>
    </div>
  )
}

export function TokensPanel({ groups }: { groups: TokenGroupDef[] }) {
  const allTokens = useMemo(() => groups.flatMap(g => g.tokens), [groups])
  const allKeys = useMemo(() => allTokens.map(t => t.key), [allTokens])

  const [displayValues, setDisplayValues] = useState<Record<string, string>>({})
  const [hexValues, setHexValues] = useState<Record<string, string>>({})
  const [showPicker, setShowPicker] = useState<Record<string, boolean>>({})
  const [overrides, setOverrides] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)

  const refresh = useCallback(() => {
    const vals = readValues(allKeys)
    setDisplayValues(vals)
    setOverrides(new Set())
    const hexes: Record<string, string> = {}
    const pickers: Record<string, boolean> = {}
    allTokens.forEach(t => {
      if (t.type === 'color') {
        const info = resolveColorInfo(vals[t.key])
        if (info) {
          hexes[t.key] = info.hex
          pickers[t.key] = info.opaque
        }
      }
    })
    setHexValues(hexes)
    setShowPicker(pickers)
  }, [allKeys, allTokens])

  useEffect(() => {
    refresh()
    const obs = new MutationObserver(refresh)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] })
    return () => obs.disconnect()
  }, [refresh])

  function handleChange(key: string, cssValue: string, newHex?: string) {
    setDisplayValues(prev => ({ ...prev, [key]: cssValue }))
    setOverrides(prev => new Set(prev).add(key))
    document.documentElement.style.setProperty(key, cssValue)
    if (newHex) {
      setHexValues(prev => ({ ...prev, [key]: newHex }))
    } else {
      const info = resolveColorInfo(cssValue)
      if (info) {
        setHexValues(prev => ({ ...prev, [key]: info.hex }))
        setShowPicker(prev => ({ ...prev, [key]: info.opaque }))
      }
    }
  }

  function handleReset(key: string) {
    document.documentElement.style.removeProperty(key)
    setOverrides(prev => { const s = new Set(prev); s.delete(key); return s })
    const val = getComputedStyle(document.documentElement).getPropertyValue(key).trim()
    setDisplayValues(prev => ({ ...prev, [key]: val }))
    const info = resolveColorInfo(val)
    if (info) {
      setHexValues(prev => ({ ...prev, [key]: info.hex }))
      setShowPicker(prev => ({ ...prev, [key]: info.opaque }))
    }
  }

  function getCSSOutput() {
    const lines = [':root {']
    allTokens.forEach(({ key }) => {
      const v = displayValues[key]
      if (v) lines.push(`  ${key}: ${v};`)
    })
    lines.push('}')
    return lines.join('\n')
  }

  function handleCopy() {
    navigator.clipboard.writeText(getCSSOutput())
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section className="border border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <h2 className="text-xs font-semibold">Theme Tokens</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Swatch(색상 토큰) 클릭 → 컬러 피커. 텍스트 입력으로 oklch 등 직접 입력 가능. 사이드바 테마 전환 시 초기화됨.
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="h-6 px-3 text-[11px] border border-border rounded bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
        >
          {copied ? 'Copied!' : 'Copy CSS'}
        </button>
      </div>

      {groups.map((group, i) => (
        <div key={group.title}>
          {groups.length > 1 && (
            <div className={`px-4 py-1.5 bg-muted/40 ${i > 0 ? 'border-t border-border' : ''}`}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {group.title}
              </p>
              {group.description && (
                <p className="text-[10px] text-muted-foreground">{group.description}</p>
              )}
            </div>
          )}
          <div className="px-4">
            {group.tokens.map(token => (
              <TokenRow
                key={token.key}
                token={token}
                value={displayValues[token.key] ?? ''}
                hexValue={hexValues[token.key] ?? '#000000'}
                showPicker={showPicker[token.key] ?? false}
                isOverride={overrides.has(token.key)}
                onChange={handleChange}
                onReset={handleReset}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
