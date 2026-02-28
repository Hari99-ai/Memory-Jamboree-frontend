"use client"

import { useEffect, useState, useRef } from "react"

export function useBlockBackNavigation(enable: boolean) {
  const [open, setOpen] = useState(false)
  // keep the last known history.state so we can restore it if needed
  const lastStateRef = useRef<any>(null)
  // prevent handling multiple popstate events at once (double/triple back)
  const handlingRef = useRef(false)

  useEffect(() => {
    if (!enable) return

    // Seed a state-preserving history entry on the next microtask
    // to ensure React Router has already set history.state.{usr,key,idx}
    const seed = () => {
      try {
        lastStateRef.current = window.history?.state ?? null
        // re-push the current URL but preserve state so router location.state isn't lost
        window.history.pushState(lastStateRef.current, "", window.location.href)
      } catch {
        // ignore
      }
    }
    // queueMicrotask is not available everywhere; setTimeout(0) is fine
    setTimeout(seed, 0)

    const onPopState = (e: PopStateEvent) => {
      // absorb any browser back navigations and show modal
      if (handlingRef.current) {
        // already handling a previous back press; immediately re-push and ignore
        try {
          const st = e.state ?? lastStateRef.current ?? window.history.state
          lastStateRef.current = st
          window.history.pushState(st, "", window.location.href)
        } catch {
          // ignore
        }
        return
      }
      handlingRef.current = true
      try {
        const st = e.state ?? lastStateRef.current ?? window.history.state
        lastStateRef.current = st
        // Immediately push a state-preserving entry so URL stays and RR state isn't lost
        window.history.pushState(st, "", window.location.href)
      } catch {
        // ignore
      } finally {
        setOpen(true)
        // release handling lock on next tick to allow future presses
        setTimeout(() => {
          handlingRef.current = false
        }, 0)
      }
    }

    window.addEventListener("popstate", onPopState)
    return () => {
      window.removeEventListener("popstate", onPopState)
    }
  }, [enable])

  return {
    backAlertOpen: open,
    closeBackAlert: () => setOpen(false),
  }
}
