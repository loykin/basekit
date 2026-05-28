import { Select } from '@base-ui/react/select'
import { cn } from '../utils'
import { ChevronDownIcon, CheckIcon } from './icons'

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
  onChange: (value: string) => void
  className?: string
  classNames?: { trigger?: string; popup?: string; item?: string }
}

export function FiSelect({
  options,
  value,
  placeholder = 'Select...',
  disabled,
  required,
  onChange,
  className,
  classNames,
}: FiSelectProps) {
  return (
    <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
      <Select.Trigger className={cn('fi-select-trigger', classNames?.trigger, className)}>
        <Select.Value placeholder={placeholder} className="fi-select-value" />
        <Select.Icon className="fi-select-icon">
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={4} className="isolate z-50">
          <Select.Popup className={cn('fi-select-popup', classNames?.popup)}>
            <Select.List>
              {!required && (
                <Select.Item value="" className={cn('fi-select-item', classNames?.item)}>
                  <Select.ItemText className="fi-select-item-text">{placeholder}</Select.ItemText>
                </Select.Item>
              )}
              {options.map((option) => (
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
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}
