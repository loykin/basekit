import type { TabTypeDefinition } from './types'

const registry = new Map<string, TabTypeDefinition>()

export function registerTabType<T>(type: string, def: TabTypeDefinition<T>): void {
  registry.set(type, def as TabTypeDefinition)
}

export function getTabType(type: string): TabTypeDefinition | undefined {
  return registry.get(type)
}
