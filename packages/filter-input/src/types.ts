import type React from 'react'

export type FilterInputType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multi-select'
  | 'autocomplete'
  | 'combobox'
  | 'date'
  | 'date-range'
  | 'datetime'
  | 'datetime-range'
  | 'range'
  | 'tag'

export type FilterValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | DateRangeValue
  | NumberRangeValue
  | null
  | undefined

export type DateRangeValue = {
  from?: string
  to?: string
}

export type NumberRangeValue = {
  min?: number
  max?: number
}

export type FilterOptionValue = string | number | boolean

export type FilterOption<TMeta = unknown> = {
  label: string
  value: FilterOptionValue
  disabled?: boolean
  color?: string
  meta?: TMeta
}

export type FilterDataSourceContext = {
  query?: string
  value?: FilterValue
  filters?: Record<string, FilterValue>
  signal?: AbortSignal
}

export type FilterDataSource<TMeta = unknown> = {
  type: 'static' | 'remote'
  /** 'immediate' fetches on mount; 'open' fetches only when the dropdown first opens. @default 'immediate' */
  trigger?: 'immediate' | 'open'
  fetch?: (context: FilterDataSourceContext) => Promise<FilterOption<TMeta>[]>
}

export type FilterBehaviorConfig = {
  searchable?: boolean
  clearable?: boolean
  disabled?: boolean
  required?: boolean
  closeOnSelect?: boolean
  debounceMs?: number
  minSearchLength?: number
  allowCustomValue?: boolean
  selectOnBlur?: boolean
  /** Show the reload button for remote sources. Set to false to hide it. @default true */
  showReload?: boolean
}

export type FilterDisplayConfig<TMeta = unknown> = {
  variant?: 'text' | 'tags' | 'count' | 'summary'
  maxVisible?: number
  overflow?: 'count' | 'collapse' | 'tooltip'
  removable?: boolean
  size?: 'sm' | 'md' | 'lg'
  colorBy?: 'none' | 'value' | 'option-meta'
  emptyText?: string
  summaryLabel?: string
  formatLabel?: (option: FilterOption<TMeta>) => string
  /** Icon rendered inside the control, before the input text. */
  leadingIcon?: React.ReactNode
  /** Icon rendered inside the control, after the input text. */
  trailingIcon?: React.ReactNode
}

export type FilterValidationConfig = {
  min?: number
  max?: number
  pattern?: string
}

export type FilterInputConfig<TMeta = unknown> = {
  key: string
  label?: string
  type: FilterInputType
  placeholder?: string
  options?: FilterOption<TMeta>[]
  dataSource?: FilterDataSource<TMeta>
  behavior?: FilterBehaviorConfig
  display?: FilterDisplayConfig<TMeta>
  validation?: FilterValidationConfig
}

export type FilterChangeContext<TMeta = unknown> = {
  key: string
  option?: FilterOption<TMeta>
  options?: FilterOption<TMeta>[]
}

export type FilterInputClassNames = {
  root?: string
  label?: string
  control?: string
  controlWrap?: string
  row?: string
  stack?: string
  range?: string
  clearButton?: string
  multi?: string
  multiTrigger?: string
  multiValue?: string
  popover?: string
  popoverSearch?: string
  option?: string
  optionCheck?: string
  optionLabel?: string
  selectedList?: string
  tagInput?: string
  tag?: string
  tagLabel?: string
  tagRemove?: string
  tagTextInput?: string
}

export type FilterVariableClassNames = {
  root?: string
  label?: string
  value?: string
  input?: FilterInputClassNames
}

export type FilterInputProps<TMeta = unknown> = {
  config: FilterInputConfig<TMeta>
  value: FilterValue
  filters?: Record<string, FilterValue>
  onChange: (value: FilterValue, context: FilterChangeContext<TMeta>) => void
  onSearch?: (query: string, context: { key: string }) => void
  className?: string
  inputClassName?: string
  classNames?: FilterInputClassNames
  renderOption?: (option: FilterOption<TMeta>) => React.ReactNode
}
