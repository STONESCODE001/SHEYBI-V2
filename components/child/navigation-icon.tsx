import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type NavigationIconVariant = "primary" | "secondary"

interface NavigationIconProps extends React.ComponentProps<"button"> {
  /** The Lucide icon component to render. */
  readonly icon: LucideIcon
  /** Visual variant. */
  readonly variant?: NavigationIconVariant
  /** Accessible label describing the navigation action. */
  readonly "aria-label": string
}

function NavigationIcon({
  icon: Icon,
  variant = "primary",
  className,
  disabled,
  ...props
}: NavigationIconProps): React.ReactElement {
  return (
    <button
      data-slot="navigation-icon"
      data-variant={variant}
      type="button"
      role="button"
      disabled={disabled}
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-xl",
        "outline-none transition-colors duration-200",
        "focus-visible:ring-2 focus-visible:ring-[var(--border-active)]",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && [
          "text-[var(--accent-primary)]",
          "hover:bg-[var(--accent-primary)]/10",
          "active:bg-[var(--accent-primary)]/20",
        ],
        variant === "secondary" && [
          "text-[var(--text-muted)]",
          "hover:bg-[var(--bg-hover)]",
          "active:bg-[var(--bg-active)]",
        ],
        className
      )}
      {...props}
    >
      <Icon className="size-5" />
    </button>
  )
}

export { NavigationIcon }
export type { NavigationIconProps, NavigationIconVariant }
