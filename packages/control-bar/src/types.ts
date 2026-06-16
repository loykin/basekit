import type React from 'react'

export interface TabTypeDefinition<T = unknown> {
  label: string
  icon?: React.ReactNode
  render: (data: T) => React.ReactNode
}

export interface OpenTabOptions<T = unknown> {
  type: string
  data: T
  label?: string
}

export interface ControlBarTab<T = unknown> {
  id: string
  type: string
  label: string
  data: T
}
