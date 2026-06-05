import React from 'react'
import { Popover } from '@base-ui/react/popover'
import { cn } from '../utils'
import { ChevronDownIcon, CheckIcon, RefreshIcon } from './icons'
import type { FilterOption, FilterOptionValue } from '../types'

function stringifyValue(value: FilterOptionValue) {
  return String(value)
}

function optionMatches(option: FilterOption, value: FilterOptionValue) {
  return option.value === value || stringifyValue(option.value) === stringifyValue(value)
}

interface FiMultiSelectProps {
  options: FilterOption[]
  value: FilterOptionValue[]
  placeholder?: string
  disabled?: boolean
  searchable?: boolean
  loading?: boolean
  error?: string | null
  query: string
  onQueryChange: (query: string) => void
  onToggle: (option: FilterOption) => void
  onOpen?: () => void
  onReload?: () => void
  renderTriggerValue: () => React.ReactNode
  renderOption?: (option: FilterOption) => React.ReactNode
  classNames?: {
    trigger?: string
    popup?: string
    item?: string
  }
}

export function FiMultiSelect({
  options,
  value,
  placeholder = 'Select...',
  disabled,
  searchable,
  loading,
  error,
  query,
  onQueryChange,
  onToggle,
  onOpen,
  onReload,
  renderTriggerValue,
  renderOption,
  classNames,
}: FiMultiSelectProps) {
  return (
    <Popover.Root onOpenChange={(open) => { if (open) onOpen?.() }}>
      <Popover.Trigger
        className={cn('fi-multi-trigger', classNames?.trigger)}
        disabled={disabled}
      >
        <span className="fi-multi-value">{renderTriggerValue()}</span>
        <span className="fi-chevron">
          <ChevronDownIcon />
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={4} align="start" className="isolate z-50">
          <Popover.Popup className={cn('fi-multi-popup', classNames?.popup)}>
            {(searchable || onReload) && (
              <div className="fi-popup-header">
                {searchable && (
                  <input
                    className="fi-control"
                    value={query}
                    placeholder={placeholder}
                    onChange={(e) => onQueryChange(e.target.value)}
                  />
                )}
                {onReload && (
                  <button
                    type="button"
                    className="fi-reload-button"
                    onClick={onReload}
                    disabled={loading}
                    aria-label="Reload"
                  >
                    <RefreshIcon />
                  </button>
                )}
              </div>
            )}
            {loading && <div className="fi-popup-status"><span className="fi-loading">Loading…</span></div>}
            {!loading && error && <div className="fi-popup-status"><span className="fi-error">{error}</span></div>}
            {!loading && !error && options.map((option) => {
              const checked = value.some((item) => optionMatches(option, item))
              return (
                <button
                  key={stringifyValue(option.value)}
                  type="button"
                  className={cn('fi-option', classNames?.item)}
                  disabled={option.disabled}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onToggle(option)}
                >
                  <span className="fi-option-check" data-checked={checked || undefined}>
                    {checked && <CheckIcon />}
                  </span>
                  <span className="fi-option-label">
                    {renderOption ? renderOption(option) : option.label}
                  </span>
                </button>
              )
            })}
            {!loading && !error && !options.length && (
              <div className="fi-popup-status"><span className="fi-empty">No options</span></div>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
