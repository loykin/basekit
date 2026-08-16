import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from './utils'
import type {
  DateRangeValue,
  FilterInputProps,
  FilterOption,
  FilterOptionValue,
  FilterValue,
  NumberRangeValue,
} from './types'
import { FiSelect } from './ui/select'
import { FiMultiSelect } from './ui/multi-select'
import { XIcon } from './ui/icons'

const EMPTY_OPTIONS: FilterOption[] = []

function stringifyValue(value: FilterOptionValue) {
  return String(value)
}

function normalizeText(value: FilterValue) {
  if (value === null || value === undefined) return ''
  return String(value)
}

function toMultiValue(value: FilterValue): FilterOptionValue[] {
  if (!Array.isArray(value)) return []
  return value
}

function getDateRange(value: FilterValue): DateRangeValue {
  if (!value || Array.isArray(value) || typeof value !== 'object') return {}
  return value as DateRangeValue
}

function getNumberRange(value: FilterValue): NumberRangeValue {
  if (!value || Array.isArray(value) || typeof value !== 'object') return {}
  return value as NumberRangeValue
}

function optionMatches(option: FilterOption, value: FilterOptionValue) {
  return option.value === value || stringifyValue(option.value) === stringifyValue(value)
}

function selectedOptions<TMeta>(options: FilterOption<TMeta>[], value: FilterValue): FilterOption<TMeta>[] {
  if (Array.isArray(value)) {
    return value.map((item) => options.find((option) => optionMatches(option, item)) ?? {
      label: stringifyValue(item),
      value: item,
    } as FilterOption<TMeta>)
  }

  if (value === null || value === undefined || typeof value === 'object') return []
  const option = options.find((item) => optionMatches(item, value))
  return option ? [option] : [{ label: stringifyValue(value), value } as FilterOption<TMeta>]
}

function optionColor(option: FilterOption) {
  if (option.color) return option.color
  return undefined
}

function valueFromString(value: string, options: FilterOption[]) {
  const option = options.find((item) => stringifyValue(item.value) === value)
  return option?.value ?? value
}

function hasRemoteSource<TMeta>(config: FilterInputProps<TMeta>['config']) {
  return config.dataSource?.type === 'remote' && !!config.dataSource.fetch
}

function useOptions<TMeta>({
  config,
  value,
  filters,
  query,
}: Pick<FilterInputProps<TMeta>, 'config' | 'value' | 'filters'> & { query: string }) {
  const staticOptions = config.options ?? (EMPTY_OPTIONS as FilterOption<TMeta>[])
  const [remoteOptions, setRemoteOptions] = useState<FilterOption<TMeta>[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestRef = useRef(0)
  const fetcher = config.dataSource?.fetch
  const remote = hasRemoteSource(config)
  const debounceMs = config.behavior?.debounceMs ?? 200
  const minSearchLength = config.behavior?.minSearchLength ?? 0
  const isLazy = config.dataSource?.trigger === 'open'
  const [activated, setActivated] = useState(!isLazy)
  const [reloadKey, setReloadKey] = useState(0)
  const activate = useCallback(() => setActivated(true), [])
  const reload = useCallback(() => {
    setActivated(true)
    setReloadKey((k) => k + 1)
  }, [])

  useEffect(() => {
    if (!remote || !fetcher || !activated) return
    if (query.length < minSearchLength) {
      setRemoteOptions([])
      setLoading(false)
      setError(null)
      return
    }

    const requestId = requestRef.current + 1
    requestRef.current = requestId
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setLoading(true)
      setError(null)
      fetcher({ query, value, filters, signal: controller.signal })
        .then((items) => {
          if (requestRef.current === requestId) setRemoteOptions(items)
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted || requestRef.current !== requestId) return
          setRemoteOptions([])
          setError(err instanceof Error ? err.message : 'Failed to load options')
        })
        .finally(() => {
          if (requestRef.current === requestId) setLoading(false)
        })
    }, debounceMs)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [activated, debounceMs, fetcher, filters, minSearchLength, query, reloadKey, remote, value])

  return {
    options: remote ? remoteOptions : staticOptions,
    loading,
    error,
    activate,
    reload,
  }
}

function SelectedValueDisplay<TMeta>({
  options,
  value,
  display,
  onRemove,
}: {
  options: FilterOption<TMeta>[]
  value: FilterValue
  display: NonNullable<FilterInputProps<TMeta>['config']['display']>
  onRemove?: (value: FilterOptionValue) => void
}) {
  const items = selectedOptions(options, value)
  const emptyText = display.emptyText ?? 'No value'
  const variant = display.variant ?? (Array.isArray(value) ? 'tags' : 'text')

  if (!items.length) {
    return <span className="filter-input-selected-empty">{emptyText}</span>
  }

  if (variant === 'count') {
    return <span className="filter-input-selected-count">{items.length} selected</span>
  }

  if (variant === 'summary') {
    return <span className="filter-input-selected-summary">{items.length} {display.summaryLabel ?? 'selected'}</span>
  }

  const maxVisible = display.maxVisible ?? items.length
  const visible = items.slice(0, maxVisible)
  const hidden = Math.max(0, items.length - visible.length)
  if (variant === 'text') {
    return (
      <span className="filter-input-selected-text">
        {items.map((item) => display.formatLabel?.(item) ?? item.label).join(', ')}
      </span>
    )
  }

  return (
    <div className="filter-input-selected-list">
      {visible.map((item) => {
        const label = display.formatLabel?.(item) ?? item.label
        return (
          <span
            key={stringifyValue(item.value)}
            className="filter-input-tag"
            data-size={display.size ?? 'sm'}
            title={label}
            style={display.colorBy !== 'none' ? { borderColor: optionColor(item), color: optionColor(item) } : undefined}
          >
            <span className="filter-input-tag-label">{label}</span>
            {display.removable && onRemove && (
              <button
                type="button"
                className="filter-input-tag-remove"
                aria-label={`Remove ${label}`}
                onClick={() => onRemove(item.value)}
              >
                <XIcon />
              </button>
            )}
          </span>
        )
      })}
      {hidden > 0 && display.overflow !== 'collapse' && (
        <span
          className="filter-input-tag-overflow"
          title={display.overflow === 'tooltip' ? items.slice(maxVisible).map((item) => item.label).join(', ') : undefined}
        >
          +{hidden}
        </span>
      )}
    </div>
  )
}

export function FilterInput<TMeta = unknown>({
  config,
  value,
  filters,
  onChange,
  onSearch,
  className,
  inputClassName,
  classNames,
  renderOption,
}: FilterInputProps<TMeta>) {
  const [query, setQuery] = useState('')
  const { options, loading, error, activate, reload } = useOptions({ config, value, filters, query })
  const behavior = config.behavior ?? {}
  const display = config.display ?? {}
  const searchable = !!behavior.searchable || config.type === 'autocomplete' || config.type === 'combobox'
  const disabled = !!behavior.disabled
  const remote = hasRemoteSource(config)

  const filteredOptions = useMemo(() => {
    if (remote || !query || !searchable) return options
    const normalized = query.toLowerCase()
    return options.filter((option) => option.label.toLowerCase().includes(normalized) || stringifyValue(option.value).toLowerCase().includes(normalized))
  }, [options, query, remote, searchable])

  const emit = (nextValue: FilterValue, option?: FilterOption) => {
    onChange(nextValue, { key: config.key, option: option as FilterOption<TMeta> | undefined, options: options as FilterOption<TMeta>[] })
  }

  const clearButton = behavior.clearable && value !== undefined && value !== null && value !== '' && (
    <button
      type="button"
      className={cn('filter-input-clear-button', classNames?.clearButton)}
      disabled={disabled}
      onClick={() => emit(Array.isArray(value) ? [] : null)}
    >
      Clear
    </button>
  )

  const commonInputClass = cn(
    'filter-input-control',
    classNames?.control,
    inputClassName,
  )
  const leadingIcon = display.leadingIcon
  const trailingIcon = display.trailingIcon
  const hasIcons = !!(leadingIcon || trailingIcon)
  const iconAwareInputClass = cn(
    commonInputClass,
    leadingIcon && 'filter-input-control-has-leading-icon',
    trailingIcon && 'filter-input-control-has-trailing-icon',
  )

  const withIconWrap = (inputEl: React.ReactElement) => {
    if (!hasIcons) return inputEl
    return (
      <div className={cn('filter-input-control-wrap', classNames?.controlWrap)}>
        {leadingIcon && <span className="filter-input-control-icon filter-input-control-icon-leading">{leadingIcon}</span>}
        {inputEl}
        {trailingIcon && <span className="filter-input-control-icon filter-input-control-icon-trailing">{trailingIcon}</span>}
      </div>
    )
  }

  const control = (() => {
    switch (config.type) {
      case 'textarea':
        return (
          <textarea
            className={cn('filter-input-textarea', classNames?.control, inputClassName)}
            value={normalizeText(value)}
            placeholder={config.placeholder}
            disabled={disabled}
            required={behavior.required}
            data-size={display.size}
            onChange={(event) => emit(event.target.value)}
          />
        )

      case 'number':
        return withIconWrap(
          <input
            className={iconAwareInputClass}
            type="number"
            value={normalizeText(value)}
            min={config.validation?.min}
            max={config.validation?.max}
            placeholder={config.placeholder}
            disabled={disabled}
            required={behavior.required}
            data-size={display.size}
            onKeyDown={(event) => {
              if (['e', 'E', '+'].includes(event.key)) event.preventDefault()
              if (event.key === '-' && (config.validation?.min ?? Number.NEGATIVE_INFINITY) >= 0) event.preventDefault()
            }}
            onChange={(event) => emit(event.target.value === '' ? null : Number(event.target.value))}
          />,
        )

      case 'boolean':
        return (
          <div className={cn('filter-input-row', classNames?.row)}>
            <FiSelect
              className="filter-input-flex-1"
              size={display.size}
              options={[
                { label: 'True', value: 'true' },
                { label: 'False', value: 'false' },
              ]}
              value={value === null || value === undefined ? '' : String(value)}
              placeholder={config.placeholder ?? 'Any'}
              disabled={disabled}
              onChange={(next) => {
                if (next === '') emit(null)
                else emit(next === 'true')
              }}
            />
            {clearButton}
          </div>
        )

      case 'multi-select': {
        const selected = toMultiValue(value)
        const toggleOption = (option: FilterOption) => {
          const exists = selected.some((item) => optionMatches(option, item))
          const next = exists
            ? selected.filter((item) => !optionMatches(option, item))
            : [...selected, option.value]
          emit(next as string[] | number[], option)
        }

        return (
          <div className={cn('filter-input-multi', classNames?.multi)}>
            <FiMultiSelect
              options={filteredOptions}
              value={selected}
              placeholder={config.placeholder ?? 'Select...'}
              disabled={disabled}
              searchable={searchable}
              loading={loading}
              error={error}
              query={query}
              onQueryChange={(q) => {
                setQuery(q)
                onSearch?.(q, { key: config.key })
              }}
              onToggle={toggleOption}
              onOpen={activate}
              onReload={hasRemoteSource(config) && behavior.showReload !== false ? reload : undefined}
              renderTriggerValue={() => (
                <SelectedValueDisplay
                  options={options}
                  value={value}
                  display={{ variant: 'tags', maxVisible: 2, overflow: 'count', removable: false, emptyText: config.placeholder ?? 'Select...', ...display }}
                />
              )}
              renderOption={renderOption ? (o) => renderOption(o as FilterOption<TMeta>) : undefined}
              classNames={classNames ? { trigger: classNames.multiTrigger, popup: classNames.popover, item: classNames.option } : undefined}
            />
            <div className="filter-input-row">
              {clearButton}
            </div>
          </div>
        )
      }

      case 'select':
        return (
          <div className={cn('filter-input-row', classNames?.row)}>
            <FiSelect
              className="filter-input-flex-1"
              size={display.size}
              options={filteredOptions.map((o) => ({ label: o.label, value: stringifyValue(o.value), disabled: o.disabled }))}
              value={value === null || value === undefined ? '' : normalizeText(value)}
              placeholder={config.placeholder ?? 'Select...'}
              disabled={disabled}
              required={behavior.required}
              loading={loading}
              error={error}
              searchable={searchable}
              query={query}
              onQueryChange={(q) => {
                setQuery(q)
                onSearch?.(q, { key: config.key })
              }}
              onOpen={activate}
              onReload={hasRemoteSource(config) && behavior.showReload !== false ? reload : undefined}
              onChange={(next) => {
                const resolved = valueFromString(next, options)
                emit(next === '' ? null : resolved, options.find((o) => optionMatches(o, resolved)))
              }}
            />
            {clearButton}
          </div>
        )

      case 'autocomplete':
      case 'combobox':
        return (
          <div className={cn('filter-input-stack', classNames?.stack)}>
            <div className={cn('filter-input-row', classNames?.row)}>
              {withIconWrap(
                <input
                  className={iconAwareInputClass}
                  value={query}
                  placeholder={config.placeholder ?? 'Search...'}
                  disabled={disabled}
                  data-size={display.size}
                  onChange={(event) => {
                    const nextQuery = event.target.value
                    setQuery(nextQuery)
                    onSearch?.(nextQuery, { key: config.key })
                    if (config.type === 'combobox' && behavior.allowCustomValue) emit(nextQuery)
                  }}
                  onBlur={() => {
                    if (config.type === 'combobox' && behavior.selectOnBlur && query) emit(query)
                  }}
                />,
              )}
              {clearButton}
            </div>
            {(loading || error || filteredOptions.length > 0) && (
              <div className={cn('filter-input-popover', classNames?.popover)}>
                {loading && <div className="filter-input-loading">Loading...</div>}
                {error && <div className="filter-input-error">{error}</div>}
                {!loading && !error && filteredOptions.map((option) => (
                  <button
                    key={stringifyValue(option.value)}
                    type="button"
                    className={cn('filter-input-option', classNames?.option)}
                    disabled={disabled || option.disabled}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setQuery(option.label)
                      emit(option.value as FilterValue, option)
                    }}
                  >
                    <span className={cn('filter-input-option-label', classNames?.optionLabel)}>{renderOption ? renderOption(option as FilterOption<TMeta>) : option.label}</span>
                    {optionMatches(option, value as FilterOptionValue) && <span className="filter-input-selected-mark">Selected</span>}
                  </button>
                ))}
              </div>
            )}
            <SelectedValueDisplay options={options} value={value} display={display} />
          </div>
        )

      case 'date':
      case 'datetime':
        return (
          <input
            className={commonInputClass}
            type={config.type === 'date' ? 'date' : 'datetime-local'}
            value={normalizeText(value)}
            placeholder={config.placeholder}
            disabled={disabled}
            required={behavior.required}
            data-size={display.size}
            onChange={(event) => emit(event.target.value || null)}
          />
        )

      case 'date-range':
      case 'datetime-range': {
        const range = getDateRange(value)
        const inputType = config.type === 'date-range' ? 'date' : 'datetime-local'
        return (
          <div className={cn('filter-input-range', classNames?.range)}>
            <input className={commonInputClass} type={inputType} value={range.from ?? ''} disabled={disabled} data-size={display.size} onChange={(event) => emit({ ...range, from: event.target.value || undefined })} />
            <input className={commonInputClass} type={inputType} value={range.to ?? ''} disabled={disabled} data-size={display.size} onChange={(event) => emit({ ...range, to: event.target.value || undefined })} />
          </div>
        )
      }

      case 'range': {
        const range = getNumberRange(value)
        return (
          <div className={cn('filter-input-range', classNames?.range)}>
            <input className={commonInputClass} type="number" value={range.min ?? ''} placeholder="Min" disabled={disabled} data-size={display.size} min={config.validation?.min} max={config.validation?.max} onChange={(event) => emit({ ...range, min: event.target.value === '' ? undefined : Number(event.target.value) })} />
            <input className={commonInputClass} type="number" value={range.max ?? ''} placeholder="Max" disabled={disabled} data-size={display.size} min={config.validation?.min} max={config.validation?.max} onChange={(event) => emit({ ...range, max: event.target.value === '' ? undefined : Number(event.target.value) })} />
          </div>
        )
      }

      case 'tag': {
        const tags = toMultiValue(value).map(stringifyValue)
        const addTag = () => {
          const nextTag = query.trim()
          if (!nextTag) return
          if (!tags.includes(nextTag)) emit([...tags, nextTag])
          setQuery('')
        }

        return (
          <div
            className={cn(
              'filter-input-tag-input',
              classNames?.tagInput,
            )}
            data-disabled={disabled || undefined}
            onClick={() => {
              if (!disabled) {
                const input = document.getElementById(`${config.key}-tag-input`)
                input?.focus()
              }
            }}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className={cn('filter-input-tag', classNames?.tag)}
                title={tag}
              >
                <span className={cn('filter-input-tag-label', classNames?.tagLabel)}>{tag}</span>
                <button
                  type="button"
                  className={cn('filter-input-tag-remove', classNames?.tagRemove)}
                  aria-label={`Remove ${tag}`}
                  disabled={disabled}
                  onClick={(event) => {
                    event.stopPropagation()
                    emit(tags.filter((item) => item !== tag))
                  }}
                >
                  <XIcon />
                </button>
              </span>
            ))}
            <input
              id={`${config.key}-tag-input`}
              className={cn('filter-input-tag-text-input', classNames?.tagTextInput)}
              value={query}
              placeholder={tags.length ? '' : config.placeholder ?? 'Add tag...'}
              disabled={disabled}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addTag()
                }
                if (event.key === 'Backspace' && !query && tags.length) {
                  emit(tags.slice(0, -1))
                }
              }}
              onBlur={addTag}
            />
          </div>
        )
      }

      case 'text':
      default:
        return (
          <div className={cn('filter-input-row', classNames?.row)}>
            {withIconWrap(
              <input
                className={iconAwareInputClass}
                type="text"
                value={normalizeText(value)}
                pattern={config.validation?.pattern}
                placeholder={config.placeholder}
                disabled={disabled}
                required={behavior.required}
                data-size={display.size}
                onChange={(event) => emit(event.target.value)}
              />,
            )}
            {clearButton}
          </div>
        )
    }
  })()

  return (
    <div className={cn('filter-input-field', classNames?.root, className)}>
      {config.label && (
        <label className={cn('filter-input-field-label', classNames?.label)}>
          {config.label}
          {behavior.required && <span className="filter-input-field-required"> *</span>}
        </label>
      )}
      {control}
    </div>
  )
}
