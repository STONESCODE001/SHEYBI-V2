import * as React from "react"
import { cn } from "@/lib/utils"

type NotificationDotVariant = "default" | "alert"

interface NotificationDotProps extends React.ComponentProps<"span"> {
  /** Visual variant controlling dot colour. */
  readonly variant?: NotificationDotVariant
  /** Whether the dot is visible. */
  readonly visible?: boolean
}

function NotificationDot({
  variant = "default",
  visible = true,
  className,
  ...props
}: NotificationDotProps): React.ReactElement | null {
  if (!visible) {
    return null
  }

  return (
    <span
      data-slot="notification-dot"
      data-variant={variant}
      aria-label="unread notifications"
      className={cn(
        "absolute top-0 right-0 z-10 block size-2 rounded-full",
        "ring-2 ring-[var(--bg-surface)]",
        "transition-opacity duration-200",
        variant === "default" && "bg-[var(--accent-primary)]",
        variant === "alert" && "bg-[var(--state-error)]",
        className
      )}
      {...props}
    />
  )
}

export { NotificationDot }
export type { NotificationDotProps, NotificationDotVariant }
