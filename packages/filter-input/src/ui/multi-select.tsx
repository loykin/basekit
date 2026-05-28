import React from 'react'
import { Popover } from '@base-ui/react/popover'
import { cn } from '../utils'
import { ChevronDownIcon, CheckIcon } from './icons'
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
  query: string
  onQueryChange: (query: string) => void
  onToggle: (option: FilterOption) => void
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
  query,
  onQueryChange,
  onToggle,
  renderTriggerValue,
  renderOption,
  classNames,
}: FiMultiSelectProps) {
  return (
    <Popover.Root>
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
            {searchable && (
              <div className="fi-popover-search">
                <input
                  className="fi-control"
                  value={query}
                  placeholder={placeholder}
                  onChange={(e) => onQueryChange(e.target.value)}
                />
              </div>
            )}
            {options.map((option) => {
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
            {!options.length && <div className="fi-empty">No options</div>}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
