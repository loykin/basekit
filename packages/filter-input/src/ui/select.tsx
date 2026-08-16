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
  size?: 'sm' | 'md' | 'lg'
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
  size,
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
      <Select.Trigger className={cn('filter-input-select-trigger', classNames?.trigger, className)} data-size={size}>
        <Select.Value placeholder={placeholder} className="filter-input-select-value" />
        <Select.Icon className="filter-input-select-icon">
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={4} className="filter-input-positioner">
          <Select.Popup className={cn('filter-input-select-popup', classNames?.popup)}>
            {(searchable || onReload) && (
              <div className="filter-input-popup-header">
                {searchable && (
                  <input
                    className="filter-input-control"
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
                  <button type="button" className="filter-input-reload-button" onClick={onReload} disabled={loading} aria-label="Reload">
                    <RefreshIcon />
                  </button>
                )}
              </div>
            )}
            {(loading || error) && (
              <div className="filter-input-popup-status">
                {loading
                  ? <span className="filter-input-loading">Loading…</span>
                  : <span className="filter-input-error">{error}</span>
                }
                {onReload && !loading && (
                  <button type="button" className="filter-input-reload-button" onClick={onReload} aria-label="Retry">
                    <RefreshIcon />
                  </button>
                )}
              </div>
            )}
            <Select.List>
              {!loading && !error && !required && (
                <Select.Item value="" className={cn('filter-input-select-item', classNames?.item)}>
                  <Select.ItemText className="filter-input-select-item-text">{placeholder}</Select.ItemText>
                </Select.Item>
              )}
              {!loading && !error && options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn('filter-input-select-item', classNames?.item)}
                >
                  <Select.ItemText className="filter-input-select-item-text">{option.label}</Select.ItemText>
                  <Select.ItemIndicator className="filter-input-select-item-indicator">
                    <CheckIcon />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
              {!loading && !error && !options.length && !required && (
                <div className="filter-input-popup-status">
                  <span className="filter-input-empty">No options</span>
                </div>
              )}
            </Select.List>
            {onReload && !searchable && !loading && !error && (
              <div className="filter-input-popup-footer">
                <button type="button" className="filter-input-reload-button" onClick={onReload} aria-label="Reload">
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
