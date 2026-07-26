import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CardImage } from "@/components/child/card-image"

interface HeroBannerAction {
  /** Button label text. */
  readonly label: string
  /** Click handler. */
  readonly onClick?: () => void
  /** Whether this is the primary (filled) action. */
  readonly primary?: boolean
}

interface HeroBannerProps extends React.ComponentProps<"section"> {
  /** Banner headline text. */
  readonly headline: string
  /** Supporting description text. */
  readonly description?: string
  /** Promotional image URL. */
  readonly imageUrl?: string
  /** Image alt text. */
  readonly imageAlt?: string
  /** Up to two action buttons. */
  readonly actions?: readonly HeroBannerAction[]
  /** Whether the banner is in a loading state. */
  readonly loading?: boolean
  /** Heading level for semantic hierarchy. */
  readonly headingLevel?: "h1" | "h2"
}

function HeroBannerSkeleton({
  className,
}: {
  className?: string
}): React.ReactElement {
  return (
    <Card
      className={cn(
        "relative overflow-hidden w-full rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-8 md:p-12",
        "shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)]",
        className
      )}
    >
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex flex-1 flex-col gap-3">
          <Skeleton className="h-10 w-3/4 rounded-lg bg-[var(--bg-surface-secondary)]" />
          <Skeleton className="h-6 w-full rounded-lg bg-[var(--bg-surface-secondary)]" />
          <Skeleton className="h-6 w-2/3 rounded-lg bg-[var(--bg-surface-secondary)]" />
          <div className="mt-4 flex gap-3">
            <Skeleton className="h-11 w-32 rounded-xl bg-[var(--accent-primary)]/50" />
            <Skeleton className="h-11 w-32 rounded-xl bg-[var(--bg-surface-secondary)]" />
          </div>
        </div>
        <div className="w-full md:w-2/5">
          <Skeleton className="aspect-video w-full rounded-2xl bg-[var(--bg-surface-secondary)]" />
        </div>
      </div>
    </Card>
  )
}

function HeroBanner({
  headline,
  description,
  imageUrl,
  imageAlt = "Promotional image",
  actions = [],
  loading = false,
  headingLevel: HeadingTag = "h2",
  className,
  ...props
}: HeroBannerProps): React.ReactElement | null {
  if (loading) {
    return <HeroBannerSkeleton className={className} />
  }

  if (!headline) {
    return null
  }

  return (
    <section
      data-slot="hero-banner"
      role="banner"
      className={cn("w-full", className)}
      {...props}
    >
      <Card
        className={cn(
          "relative overflow-hidden w-full rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-8 md:p-12",
          "shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)]"
        )}
      >
        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center">
          {/* Text region */}
          <div className="flex flex-1 flex-col gap-4">
            <HeadingTag className="text-3xl md:text-4xl font-bold leading-tight text-[var(--text-primary)]">
              {headline}
            </HeadingTag>

            {description && (
              <p className="text-lg leading-relaxed text-[var(--text-secondary)] max-w-[90%]">
                {description}
              </p>
            )}

            {actions.length > 0 && (
              <div className="mt-4 flex gap-4">
                {actions.slice(0, 2).map((action) => (
                  <Button
                    key={action.label}
                    variant={action.primary ? "default" : "outline"}
                    size="lg"
                    className={cn(
                      "min-h-12 min-w-[120px] rounded-xl font-semibold text-base",
                      action.primary
                        ? "bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white"
                        : "border-[var(--border-default)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                    )}
                    onClick={action.onClick}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Image region */}
          {imageUrl && (
            <div className="w-full md:w-2/5 lg:w-1/3">
              <CardImage src={imageUrl} alt={imageAlt} />
            </div>
          )}
        </div>
      </Card>
    </section>
  )
}

export { HeroBanner, HeroBannerSkeleton }
export type { HeroBannerProps, HeroBannerAction }
