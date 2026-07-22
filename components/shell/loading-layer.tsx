import { cn } from "@/lib/utils"

interface LoadingLayerProps {
  readonly visible?: boolean
  readonly className?: string
}

function LoadingLayer({ visible = false, className }: LoadingLayerProps) {
  if (!visible) {
    return (
      <div data-slot="loading-layer" className="contents" aria-hidden="true" />
    )
  }

  return (
    <div
      data-slot="loading-layer"
      role="status"
      aria-busy="true"
      aria-live="assertive"
      aria-label="Loading"
      className={cn(
        "fixed inset-0 z-[100] flex h-[100vh] w-[100vw] items-center justify-center",
        "bg-[var(--bg-base)]/80",
        className
      )}
    >
      <div
        className="size-10 animate-spin rounded-full border-2 border-[var(--border-default)] border-t-[var(--accent-primary)]"
        aria-hidden="true"
      />
      <span className="sr-only">Loading</span>
    </div>
  )
}

export { LoadingLayer }
export type { LoadingLayerProps }
