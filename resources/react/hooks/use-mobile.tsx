import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // matchMedia fires only on threshold crossing — no forced reflow.
    // Handler uses e.matches (browser-computed) instead of window.innerWidth.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = (e: MediaQueryListEvent) => { setIsMobile(e.matches) }
    mql.addEventListener("change", onChange)
    setIsMobile(mql.matches)   // initial value — no forced reflow
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
