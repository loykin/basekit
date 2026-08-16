import '@testing-library/jest-dom/vitest'

// jsdom does not implement ResizeObserver.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// jsdom does not implement the Web Animations API (used by base-ui's ScrollArea).
if (typeof Element !== 'undefined' && !Element.prototype.getAnimations) {
  Element.prototype.getAnimations = () => []
}

// Node's experimental built-in `localStorage` shadows jsdom's implementation and
// returns undefined without a `--localstorage-file` flag. Polyfill with an in-memory store.
if (typeof globalThis.localStorage === 'undefined') {
  class MemoryStorage implements Storage {
    private store = new Map<string, string>()
    get length() { return this.store.size }
    clear() { this.store.clear() }
    getItem(key: string) { return this.store.has(key) ? this.store.get(key)! : null }
    key(index: number) { return Array.from(this.store.keys())[index] ?? null }
    removeItem(key: string) { this.store.delete(key) }
    setItem(key: string, value: string) { this.store.set(key, String(value)) }
  }
  Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true })
}
