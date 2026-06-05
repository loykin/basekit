import { Select } from '@base-ui/react/select'
import { cn } from '../utils'
import { ChevronDownIcon, CheckIcon, RefreshIcon } from './icons'

interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

interface FiSelectProps {
  options: SelectOption[]
  value: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  loading?: boolean
  error?: string | null
  searchable?: boolean
  query?: string
  onQueryChange?: (query: string) => void
  onChange: (value: string) => void
  onOpen?: () => void
  onReload?: () => void
  className?: string
  classNames?: { trigger?: string; popup?: string; item?: string }
}

export function FiSelect({
  options,
  value,
  placeholder = 'Select...',
  disabled,
  required,
  loading,
  error,
  searchable,
  query = '',
  onQueryChange,
  onChange,
  onOpen,
  onReload,
  className,
  classNames,
}: FiSelectProps) {
  return (
    <Select.Root
      value={value}
      onValueChange={(v) => onChange(v ?? '')}
      onOpenChange={(open) => {
        if (open) onOpen?.()
        else onQueryChange?.('')
      }}
      disabled={disabled}
    >
      <Select.Trigger className={cn('fi-select-trigger', classNames?.trigger, className)}>
        <Select.Value placeholder={placeholder} className="fi-select-value" />
        <Select.Icon className="fi-select-icon">
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={4} className="isolate z-50">
          <Select.Popup className={cn('fi-select-popup', classNames?.popup)}>
            {(searchable || onReload) && (
              <div className="fi-popup-header">
                {searchable && (
                  <input
                    className="fi-control"
                    value={query}
                    placeholder="Search..."
                    autoFocus
                    onChange={(e) => onQueryChange?.(e.target.value)}
                    onKeyDown={(e) => {
                      // Allow navigation keys through to base-ui Select for list traversal.
                      // Block everything else to prevent Select's built-in typeahead from firing.
                      const passThrough = ['Escape', 'Tab', 'ArrowDown', 'ArrowUp', 'Enter', 'Home', 'End']
                      if (!passThrough.includes(e.key)) e.stopPropagation()
                    }}
                  />
                )}
                {onReload && (
                  <button type="button" className="fi-reload-button" onClick={onReload} disabled={loading} aria-label="Reload">
                    <RefreshIcon />
                  </button>
                )}
              </div>
            )}
            {(loading || error) && (
              <div className="fi-popup-status">
                {loading
                  ? <span className="fi-loading">Loading…</span>
                  : <span className="fi-error">{error}</span>
                }
                {onReload && !loading && (
                  <button type="button" className="fi-reload-button" onClick={onReload} aria-label="Retry">
                    <RefreshIcon />
                  </button>
                )}
              </div>
            )}
            <Select.List>
              {!loading && !error && !required && (
                <Select.Item value="" className={cn('fi-select-item', classNames?.item)}>
                  <Select.ItemText className="fi-select-item-text">{placeholder}</Select.ItemText>
                </Select.Item>
              )}
              {!loading && !error && options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn('fi-select-item', classNames?.item)}
                >
                  <Select.ItemText className="fi-select-item-text">{option.label}</Select.ItemText>
                  <Select.ItemIndicator className="fi-select-item-indicator">
                    <CheckIcon />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
              {!loading && !error && !options.length && !required && (
                <div className="fi-popup-status">
                  <span className="fi-empty">No options</span>
                </div>
              )}
            </Select.List>
            {onReload && !searchable && !loading && !error && (
              <div className="fi-popup-footer">
                <button type="button" className="fi-reload-button" onClick={onReload} aria-label="Reload">
                  <RefreshIcon />
                </button>
              </div>
            )}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}
