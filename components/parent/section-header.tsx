import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface SectionHeaderProps extends React.ComponentProps<"div"> {
  /** Section title. */
  readonly title: string
  /** Optional supporting description. */
  readonly description?: string
  /** Optional action button label. */
  readonly actionLabel?: string
  /** Optional action button click handler. */
  readonly onAction?: () => void
  /** Heading level for semantic hierarchy. */
  readonly headingLevel?: "h2" | "h3" | "h4"
  /** Whether the header is in a loading state. */
  readonly loading?: boolean
}

function SectionHeaderSkeleton({
  className,
}: {
  className?: string
}): React.ReactElement {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="space-y-1">
        <Skeleton className="h-7 w-36 rounded-lg" />
        <Skeleton className="h-4 w-56 rounded-md" />
      </div>
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  )
}

function SectionHeader({
  title,
  description,
  actionLabel,
  onAction,
  headingLevel: HeadingTag = "h2",
  loading = false,
  className,
  ...props
}: SectionHeaderProps): React.ReactElement {
  if (loading) {
    return <SectionHeaderSkeleton className={className} />
  }

  return (
    <div
      data-slot="section-header"
      className={cn(
        "flex items-start justify-between gap-4",
        "mb-6",
        className
      )}
      {...props}
    >
      <div className="min-w-0 flex-1">
        <HeadingTag className="text-xl font-semibold leading-7 text-[var(--text-primary)]">
          {title}
        </HeadingTag>
        {description && (
          <p className="mt-1 text-sm leading-5 text-[var(--text-muted)]">
            {description}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <Button
          variant="ghost"
          size="default"
          className="shrink-0 text-sm"
          onClick={onAction}
          aria-label={actionLabel}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export { SectionHeader, SectionHeaderSkeleton }
export type { SectionHeaderProps }
