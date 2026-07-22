import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface DialogLayerProps {
  readonly children?: ReactNode
  readonly className?: string
}

/**
 * Z-index host for modal dialogs (owned content from 07-dialog.md).
 * Renders structural host always; children appear when provided.
 */
function DialogLayer({ children, className }: DialogLayerProps) {
  if (!children) {
    return <div data-slot="dialog-layer" className="contents" aria-hidden="true" />
  }

  return (
    <div
      data-slot="dialog-layer"
      className={cn(
        "fixed inset-0 z-40 flex items-end justify-center sm:items-center",
        "bg-[var(--bg-base)]/60 backdrop-blur-sm",
        className
      )}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "max-h-[90vh] w-full overflow-y-auto p-6",
          "rounded-t-3xl bg-[var(--bg-surface)] shadow-[0_20px_50px_rgba(0,0,0,0.45)]",
          "sm:max-w-[500px] sm:rounded-3xl"
        )}
      >
        {children}
      </div>
    </div>
  )
}

export { DialogLayer }
export type { DialogLayerProps }
