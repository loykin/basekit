import { useState, useCallback, useRef, useEffect } from 'react'
import type { CronValue } from './types'

export interface UseCronInputOptions {
  value: CronValue
  onChange: (value: CronValue) => void
}

export interface UseCronInputReturn {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  draft: CronValue
  setDraft: (value: CronValue) => void
  onApply: () => void
  onCancel: () => void
}

export function useCronInput({ value, onChange }: UseCronInputOptions): UseCronInputReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState<CronValue>(value)
  const wasOpen = useRef(false)

  useEffect(() => {
    const justOpened = isOpen && !wasOpen.current
    wasOpen.current = isOpen
    if (justOpened) setDraft(value)
  }, [isOpen, value])

  const onApply = useCallback(() => {
    onChange(draft)
    setIsOpen(false)
  }, [draft, onChange])

  const onCancel = useCallback(() => {
    setDraft(value)
    setIsOpen(false)
  }, [value])

  return { isOpen, setIsOpen, draft, setDraft, onApply, onCancel }
}
