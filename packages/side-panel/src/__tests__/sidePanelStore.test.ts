import { describe, expect, it } from 'vitest'
import { createSidePanelStore } from '../sidePanelStore'

describe('createSidePanelStore', () => {
  it('merges provider and call options when opening', () => {
    const store = createSidePanelStore({ side: 'left', size: 420 })

    store.getState()._open('content', { size: 640 })

    expect(store.getState()).toMatchObject({
      content: 'content',
      isOpen: true,
      size: 640,
      options: {
        side: 'left',
        size: 640,
        minSize: 400,
        maxSize: 1000,
      },
    })
  })

  it('closes without discarding panel content', () => {
    const store = createSidePanelStore()
    store.getState()._open('content', {})
    store.getState()._close()

    expect(store.getState().isOpen).toBe(false)
    expect(store.getState().content).toBe('content')
  })
})
