import * as React from "react"
import { Inbox } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyIllustrationProps extends React.ComponentProps<"div"> {
  /** Primary title for the empty state. */
  readonly title?: string
  /** Supporting description text. */
  readonly description?: string
  /** Optional icon override. Defaults to Inbox. */
  readonly icon?: React.ReactNode
  /** Whether the illustration is decorative (hidden from screen readers). */
  readonly decorative?: boolean
}

function EmptyIllustration({
  title,
  description,
  icon,
  decorative = false,
  className,
  children,
  ...props
}: EmptyIllustrationProps): React.ReactElement {
  return (
    <div
      data-slot="empty-illustration"
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12",
        "text-center",
        className
      )}
      {...props}
    >
      <div
        aria-hidden={decorative ? "true" : undefined}
        className={cn(
          "flex size-16 items-center justify-center rounded-2xl",
          "bg-[var(--bg-surface-secondary)]",
          "text-[var(--text-muted)]"
        )}
      >
        {icon ?? <Inbox className="size-8" strokeWidth={1.5} />}
      </div>

      {title && (
        <h3 className="text-base font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
      )}

      {description && (
        <p className="max-w-xs text-sm text-[var(--text-muted)]">
          {description}
        </p>
      )}

      {children && <div className="mt-2">{children}</div>}
    </div>
  )
}

export { EmptyIllustration }
export type { EmptyIllustrationProps }
