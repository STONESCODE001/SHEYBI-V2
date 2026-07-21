import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActionIconProps extends React.ComponentProps<"button"> {
  /** The Lucide icon component to render. */
  readonly icon: LucideIcon
  /** Whether the action is in its active/selected state. */
  readonly active?: boolean
  /** Accessible label describing the action. */
  readonly "aria-label": string
}

function ActionIcon({
  icon: Icon,
  active,
  className,
  disabled,
  ...props
}: ActionIconProps): React.ReactElement {
  return (
    <button
      data-slot="action-icon"
      data-active={active ? "true" : undefined}
      type="button"
      role="button"
      aria-pressed={active}
      disabled={disabled}
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-xl",
        "outline-none transition-colors duration-200",
        "focus-visible:ring-2 focus-visible:ring-[var(--border-active)]",
        "disabled:pointer-events-none disabled:opacity-50",
        active
          ? "text-[var(--accent-primary)]"
          : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
        "hover:bg-[var(--bg-hover)]",
        "active:bg-[var(--bg-active)]",
        className
      )}
      {...props}
    >
      <Icon className="size-5" />
    </button>
  )
}

export { ActionIcon }
export type { ActionIconProps }
