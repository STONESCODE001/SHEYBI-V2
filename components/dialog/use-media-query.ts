import { useEffect, useState } from "react"

export function useMediaQuery(query: string): boolean {
  const [value, setValue] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches)
    }

    const result = window.matchMedia(query)
    // Support older browsers compatibility
    if (result.addEventListener) {
      result.addEventListener("change", onChange)
    } else {
      (result as any).addListener(onChange)
    }
    setValue(result.matches)

    return () => {
      if (result.removeEventListener) {
        result.removeEventListener("change", onChange)
      } else {
        (result as any).removeListener(onChange)
      }
    }
  }, [query])

  return value
}
export default useMediaQuery
