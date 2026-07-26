import * as React from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface HeroBannerProps extends React.ComponentProps<"section"> {
  /** Optional custom headline text. */
  readonly headline?: string
  /** Optional custom description text. */
  readonly description?: string
  /** Optional custom mascot image URL (defaults to /sheybi-mascot.png). */
  readonly mascotUrl?: string
  /** Whether the banner is in a loading state. */
  readonly loading?: boolean
}

function HeroBannerSkeleton({
  className,
}: {
  className?: string
}): React.ReactElement {
  return (
    <div className={cn("w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-6", className)}>
      <div className="flex flex-col gap-3 flex-1 w-full">
        <Skeleton className="h-14 w-48 rounded-xl bg-[var(--bg-surface)]" />
        <Skeleton className="h-14 w-72 rounded-xl bg-[var(--bg-surface)]" />
        <Skeleton className="h-14 w-64 rounded-xl bg-[var(--bg-surface)]" />
      </div>
      <Skeleton className="hidden md:block h-72 w-72 rounded-full bg-[var(--bg-surface)]" />
    </div>
  )
}

function HeroBanner({
  headline,
  description,
  mascotUrl = "/sheybi-mascot.png",
  loading = false,
  className,
  ...props
}: HeroBannerProps): React.ReactElement {
  if (loading) {
    return <HeroBannerSkeleton className={className} />
  }

  return (
    <section
      data-slot="hero-banner"
      role="banner"
      className={cn("w-full py-2 sm:py-4 md:py-6", className)}
      {...props}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
        {/* Left: Stacked Headline (Left aligned on all viewports) */}
        <div className="flex flex-col items-start text-left select-none max-w-2xl">
          {headline ? (
            <h1 className="font-black text-4xl sm:text-5xl md:text-6xl tracking-tight text-white leading-tight">
              {headline}
            </h1>
          ) : (
            <h1 className="flex flex-col font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[80px] tracking-tight leading-[1.02]">
              <span className="text-white">Predict</span>
              <span className="text-[#2563EB]">The Outcome.</span>
              <span className="text-[#2563EB]">
                Win Bigger<span className="text-[#FFC700]">.</span>
              </span>
            </h1>
          )}

          {description && (
            <p className="mt-3 text-base sm:text-lg text-gray-300 max-w-xl text-left">
              {description}
            </p>
          )}
        </div>

        {/* Right: Mascot Image (Hidden on Mobile per Figma design; visible & enlarged on Desktop) */}
        <div className="hidden md:flex relative w-64 md:w-[320px] lg:w-[380px] xl:w-[420px] shrink-0 justify-end items-center">
          <img
            src={mascotUrl}
            alt="Sheybi Mascot"
            className="w-full h-auto object-contain max-h-[360px] lg:max-h-[400px] drop-shadow-2xl pointer-events-none select-none"
          />
        </div>
      </div>
    </section>
  )
}

export { HeroBanner, HeroBannerSkeleton }
export type { HeroBannerProps }



