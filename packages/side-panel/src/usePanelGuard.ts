import { useEffect, type RefObject } from 'react'
import { useSidePanelContext } from './SidePanelProvider'

export function usePanelGuard(ref: RefObject<HTMLDivElement | null>) {
  const { registerGuard, unregisterGuard } = useSidePanelContext()

  useEffect(() => {
    registerGuard(ref)
    return () => unregisterGuard(ref)
  }, [ref, registerGuard, unregisterGuard])
}
