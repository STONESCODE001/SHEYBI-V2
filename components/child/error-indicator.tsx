import * as React from "react"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type ErrorIndicatorVariant = "inline" | "toast"

interface ErrorIndicatorProps extends React.ComponentProps<"div"> {
  /** The error message to display. */
  readonly message: string
  /** Visual variant. */
  readonly variant?: ErrorIndicatorVariant
  /** Whether the indicator is visible. */
  readonly visible?: boolean
}

function ErrorIndicator({
  message,
  variant = "inline",
  visible = true,
  className,
  ...props
}: ErrorIndicatorProps): React.ReactElement | null {
  if (!visible) {
    return null
  }

  return (
    <div
      data-slot="error-indicator"
      data-variant={variant}
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex items-center gap-2",
        "transition-opacity duration-200",
        variant === "inline" && [
          "text-sm text-[var(--state-error)]",
        ],
        variant === "toast" && [
          "rounded-xl border border-[var(--state-error)]/20 bg-[var(--state-error)]/10",
          "px-4 py-3 text-sm text-[var(--state-error)]",
        ],
        className
      )}
      {...props}
    >
      <AlertCircle className="size-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

export { ErrorIndicator }
export type { ErrorIndicatorProps, ErrorIndicatorVariant }
