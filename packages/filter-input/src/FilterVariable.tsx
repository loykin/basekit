import { FilterInput } from './FilterInput'
import { cn } from './utils'
import type { FilterChangeContext, FilterInputConfig, FilterValue, FilterVariableClassNames } from './types'

export type FilterVariableProps<TMeta = unknown> = {
  config: FilterInputConfig<TMeta>
  value: FilterValue
  values?: Record<string, FilterValue>
  onChange: (value: FilterValue, context: FilterChangeContext<TMeta>) => void
  className?: string
  labelClassName?: string
  valueClassName?: string
  classNames?: FilterVariableClassNames
}

export function FilterVariable<TMeta = unknown>({
  config,
  value,
  values,
  onChange,
  className,
  labelClassName,
  valueClassName,
  classNames,
}: FilterVariableProps<TMeta>) {
  const valueConfig = { ...config, label: undefined }
  const disabled = !!config.behavior?.disabled
  const label = config.label ?? config.key

  return (
    <div
      className={cn(
        'fi-variable',
        classNames?.root,
        className,
      )}
      data-disabled={disabled || undefined}
    >
      {label && (
        <div
          className={cn(
            'fi-variable-label',
            classNames?.label,
            labelClassName,
          )}
        >
          {label}
        </div>
      )}
      <div className={cn('fi-variable-value', classNames?.value, valueClassName)}>
        <FilterInput
          config={valueConfig}
          value={value}
          filters={values}
          classNames={classNames?.input}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
