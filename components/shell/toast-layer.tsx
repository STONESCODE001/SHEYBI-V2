import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ToastLayerProps {
  readonly children?: ReactNode
  readonly className?: string
}

/**
 * Z-index host for toasts (owned content from 07-dialog.md).
 */
function ToastLayer({ children, className }: ToastLayerProps) {
  return (
    <div
      data-slot="toast-layer"
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed z-50 flex w-auto max-w-[350px] flex-col gap-2 p-4",
        // Mobile: above bottom navigation
        "inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] mx-auto items-center",
        // Tablet: bottom center
        "md:bottom-4 md:items-center",
        // Desktop: bottom right
        "lg:inset-x-auto lg:right-4 lg:bottom-4 lg:items-end",
        className
      )}
    >
      {children ? (
        <div className="pointer-events-auto w-full text-sm text-[var(--text-primary)]">
          {children}
        </div>
      ) : null}
    </div>
  )
}

export { ToastLayer }
export type { ToastLayerProps }
