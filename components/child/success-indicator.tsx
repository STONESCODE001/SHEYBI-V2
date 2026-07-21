import * as React from "react"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

type SuccessIndicatorVariant = "inline" | "toast"

interface SuccessIndicatorProps extends React.ComponentProps<"div"> {
  /** The success message to display. */
  readonly message: string
  /** Visual variant. */
  readonly variant?: SuccessIndicatorVariant
  /** Whether the indicator is visible. */
  readonly visible?: boolean
}

function SuccessIndicator({
  message,
  variant = "inline",
  visible = true,
  className,
  ...props
}: SuccessIndicatorProps): React.ReactElement | null {
  if (!visible) {
    return null
  }

  return (
    <div
      data-slot="success-indicator"
      data-variant={variant}
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center gap-2",
        "transition-opacity duration-200",
        variant === "inline" && [
          "text-sm text-[var(--state-success)]",
        ],
        variant === "toast" && [
          "rounded-xl border border-[var(--state-success)]/20 bg-[var(--state-success)]/10",
          "px-4 py-3 text-sm text-[var(--state-success)]",
        ],
        className
      )}
      {...props}
    >
      <CheckCircle2 className="size-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

export { SuccessIndicator }
export type { SuccessIndicatorProps, SuccessIndicatorVariant }
