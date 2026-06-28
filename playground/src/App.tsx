import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { DatetimeRangeTab, DatetimeRangePreview, TOKEN_GROUPS as DR_TOKENS } from './tabs/DatetimeRangeTab'
import { DatetimeRangeComposableTab } from './tabs/DatetimeRangeComposableTab'
import { FilterInputTab, FilterInputPreview, TOKEN_GROUPS as FI_TOKENS } from './tabs/FilterInputTab'
import { SidePanelTab, SidePanelPreview, TOKEN_GROUPS as SP_TOKENS } from './tabs/SidePanelTab'
import { UnitTab } from './tabs/UnitTab'
import { ControlBarTab, ControlBarPreview, TOKEN_GROUPS as CB_TOKENS } from './tabs/ControlBarTab'
import { ControlBarCustomTab } from './tabs/ControlBarCustomTab'
import { CronInputTab } from './tabs/CronInputTab'
import { TokensPanel } from './components/TokensPanel'
import { THEMES, type Theme } from './themes'

// ── Nav config ────────────────────────────────────────────────────────────────

type PackageId = 'datetime-range' | 'filter-input' | 'unit' | 'side-panel' | 'control-bar' | 'cron-input'
type Section   = 'usage' | 'tokens' | 'composable'

const NAV_GROUPS = [
  { id: 'datetime-range' as PackageId, label: 'Datetime Range', pkg: '@loykin/datetime-range', hasTokens: true,  hasComposable: true,  composableLabel: 'Composable' },
  { id: 'filter-input'   as PackageId, label: 'Filter Input',   pkg: '@loykin/filter-input',   hasTokens: true,  hasComposable: false, composableLabel: 'Composable' },
  { id: 'unit'           as PackageId, label: 'Unit',           pkg: '@loykin/unit',           hasTokens: false, hasComposable: false, composableLabel: 'Composable' },
  { id: 'side-panel'     as PackageId, label: 'Side Panel',     pkg: '@loykin/side-panel',     hasTokens: true,  hasComposable: false, composableLabel: 'Composable' },
  { id: 'control-bar'    as PackageId, label: 'Control Bar',    pkg: '@loykin/control-bar',    hasTokens: true,  hasComposable: true,  composableLabel: 'Custom'      },
  { id: 'cron-input'     as PackageId, label: 'Cron Input',     pkg: '@loykin/cron-input',     hasTokens: false, hasComposable: false, composableLabel: 'Composable'  },
]

// ── Theme / Radius controls ───────────────────────────────────────────────────

const RADIUS_PRESETS = [
  { label: 'None', value: '0rem'     },
  { label: 'SM',   value: '0.25rem'  },
  { label: 'MD',   value: '0.375rem' },
  { label: 'LG',   value: '0.5rem'   },
  { label: 'XL',   value: '0.75rem'  },
] as const

type RadiusValue = (typeof RADIUS_PRESETS)[number]['value']

const ALL_THEME_VAR_KEYS = [...new Set(THEMES.flatMap(t => Object.keys(t.vars)))]

function ThemeSwatch({ theme, active, onClick }: { theme: Theme; active: boolean; onClick: () => void }) {
  const primary = theme.vars['--basekit-primary'] ?? (theme.dark ? 'oklch(0.424 0.199 265.638)' : 'oklch(0.488 0.243 264.376)')
  const bg      = theme.vars['--basekit-background'] ?? (theme.dark ? 'oklch(0.145 0 0)' : 'oklch(1 0 0)')
  return (
    <button
      onClick={onClick}
      title={theme.name}
      className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs w-full transition-colors ${
        active ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      }`}
    >
      <span className="flex gap-0.5 shrink-0">
        <span className="w-3 h-3 rounded-sm border border-black/10" style={{ background: bg }} />
        <span className="w-3 h-3 rounded-sm" style={{ background: primary }} />
      </span>
      {theme.name}
    </button>
  )
}

// ── Main content ──────────────────────────────────────────────────────────────

function PageContent({ pkg, section }: { pkg: PackageId; section: Section }) {
  if (section === 'tokens') {
    const groups =
      pkg === 'datetime-range' ? DR_TOKENS :
      pkg === 'filter-input'   ? FI_TOKENS :
      pkg === 'side-panel'     ? SP_TOKENS :
      pkg === 'control-bar'    ? CB_TOKENS : null

    if (!groups) return null

    const preview =
      pkg === 'datetime-range' ? <DatetimeRangePreview /> :
      pkg === 'filter-input'   ? <FilterInputPreview /> :
      pkg === 'side-panel'     ? <SidePanelPreview /> :
      pkg === 'control-bar'    ? <ControlBarPreview /> : null

    return (
      <div className="flex gap-6 items-start">
        <div className="w-120 shrink-0">
          <TokensPanel groups={groups} />
        </div>
        <div className="flex-1 min-w-0 sticky top-0">
          <div className="border border-border">
            <div className="px-4 py-2 border-b border-border bg-muted/30">
              <p className="text-[11px] font-medium text-muted-foreground">Live Preview</p>
            </div>
            <div className="p-4">
              {preview}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (section === 'composable' && pkg === 'datetime-range') return <DatetimeRangeComposableTab />
  if (section === 'composable' && pkg === 'control-bar')   return <ControlBarCustomTab />

  if (pkg === 'datetime-range') return <DatetimeRangeTab />
  if (pkg === 'filter-input')   return <FilterInputTab />
  if (pkg === 'unit')           return <UnitTab />
  if (pkg === 'side-panel')     return <SidePanelTab />
  if (pkg === 'control-bar')    return <ControlBarTab />
  if (pkg === 'cron-input')     return <CronInputTab />
  return null
}

// ── Shell (sidebar + layout) ──────────────────────────────────────────────────

const VALID_PKGS: PackageId[] = ['datetime-range', 'filter-input', 'unit', 'side-panel', 'control-bar', 'cron-input']

function isPackageId(s: string | undefined): s is PackageId {
  return VALID_PKGS.includes(s as PackageId)
}

function PlaygroundApp() {
  const { pkgId = 'datetime-range', sectionId } = useParams<{ pkgId: string; sectionId?: string }>()
  const navigate = useNavigate()
  const pkg = isPackageId(pkgId) ? pkgId : 'datetime-range'
  const section: Section = sectionId === 'tokens' ? 'tokens' : sectionId === 'composable' ? 'composable' : 'usage'

  const [theme, setTheme] = useState<Theme>(THEMES[0]!)
  const [radius, setRadius] = useState<RadiusValue>('0rem')

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', !!theme.dark)
    ALL_THEME_VAR_KEYS.forEach(k => root.style.removeProperty(k))
    root.style.removeProperty('--basekit-radius')
    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v))
    root.style.setProperty('--basekit-radius', radius)
    return () => {
      root.classList.remove('dark')
      ALL_THEME_VAR_KEYS.forEach(k => root.style.removeProperty(k))
      root.style.removeProperty('--basekit-radius')
    }
  }, [theme, radius])

  const currentGroup = NAV_GROUPS.find(g => g.id === pkg)!
  const pageTitle =
    section === 'tokens'     ? `${currentGroup.label} — Theme Tokens` :
    section === 'composable' ? `${currentGroup.label} — ${currentGroup.composableLabel}` :
    currentGroup.label

  return (
    <SidebarProvider>
      <Sidebar>

        <SidebarHeader>
          <div className="px-2 py-1">
            <p className="text-sm font-semibold">basekit</p>
            <p className="text-xs text-sidebar-foreground/50">@loykin/basekit</p>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {NAV_GROUPS.map(group => (
            <SidebarGroup key={group.id}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pkg === group.id && section === 'usage'}
                    onClick={() => navigate(`/${group.id}`)}
                  >
                    Usage
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {group.hasTokens && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pkg === group.id && section === 'tokens'}
                      onClick={() => navigate(`/${group.id}/tokens`)}
                    >
                      Theme Tokens
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {group.hasComposable && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pkg === group.id && section === 'composable'}
                      onClick={() => navigate(`/${group.id}/composable`)}
                    >
                      {group.composableLabel}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <SidebarSeparator />
          <div className="px-2 py-2 flex flex-col gap-3">

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50 mb-1.5 px-1">
                Radius
              </p>
              <div className="flex gap-1 flex-wrap">
                {RADIUS_PRESETS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setRadius(p.value)}
                    className={`px-1.5 py-0.5 text-[10px] font-medium border rounded transition-colors ${
                      radius === p.value
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-primary'
                        : 'border-sidebar-border text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50 mb-1 px-1">
                Theme
              </p>
              <div className="flex flex-col gap-0.5">
                {THEMES.map(t => (
                  <ThemeSwatch
                    key={t.name}
                    theme={t}
                    active={t.name === theme.name}
                    onClick={() => setTheme(t)}
                  />
                ))}
              </div>
            </div>

          </div>
        </SidebarFooter>

      </Sidebar>

      <SidebarInset>
        <header className="flex h-10 items-center px-4 border-b border-border shrink-0">
          <p className="text-xs font-medium">{pageTitle}</p>
          <p className="text-xs text-muted-foreground ml-2">{currentGroup.pkg}</p>
        </header>
        <div className="flex-1 overflow-auto px-6 py-5">
          <PageContent pkg={pkg} section={section} />
        </div>
      </SidebarInset>

    </SidebarProvider>
  )
}

// ── Routes ────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      <Route path="/:pkgId/:sectionId" element={<PlaygroundApp />} />
      <Route path="/:pkgId" element={<PlaygroundApp />} />
      <Route path="/" element={<Navigate to="/datetime-range" replace />} />
      <Route path="*" element={<Navigate to="/datetime-range" replace />} />
    </Routes>
  )
}
