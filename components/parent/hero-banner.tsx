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
        "relative overflow-hidden w-full rounded-3xl border-0 bg-[var(--accent-primary)] p-8 md:p-12",
        className
      )}
    >
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex flex-1 flex-col gap-3">
          <Skeleton className="h-10 w-3/4 rounded-lg bg-white/20" />
          <Skeleton className="h-6 w-full rounded-lg bg-white/10" />
          <Skeleton className="h-6 w-2/3 rounded-lg bg-white/10" />
          <div className="mt-4 flex gap-3">
            <Skeleton className="h-11 w-32 rounded-xl bg-[var(--accent-secondary)]/50" />
            <Skeleton className="h-11 w-32 rounded-xl bg-white/10" />
          </div>
        </div>
        <div className="w-full md:w-2/5">
          <Skeleton className="aspect-video w-full rounded-2xl bg-white/10" />
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
          "relative overflow-hidden w-full rounded-3xl border-0 bg-[var(--accent-primary)] p-8 md:p-12",
          "shadow-[0_10px_40px_-10px_rgba(13,91,255,0.3)]"
        )}
      >
        {/* Decorative background placeholder */}
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1600&auto=format&fit=crop&q=60')] bg-cover bg-center opacity-20 mix-blend-overlay" />

        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center">
          {/* Text region */}
          <div className="flex flex-1 flex-col gap-4">
            <HeadingTag className="text-3xl md:text-4xl font-bold leading-tight text-white">
              {headline}
            </HeadingTag>

            {description && (
              <p className="text-lg leading-relaxed text-white/80 max-w-[90%]">
                {description}
              </p>
            )}

            {actions.length > 0 && (
              <div className="mt-4 flex gap-4">
                {actions.slice(0, 2).map((action) => (
                  <Button
                    key={action.label}
                    variant={action.primary ? "featured" : "secondary"}
                    size="lg"
                    className={cn(
                      "min-h-12 min-w-[120px] rounded-xl font-semibold text-base",
                      !action.primary && "border-white/20 bg-white/10 text-white hover:bg-white/20"
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
