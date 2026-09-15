import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Gift, TrendingUp, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"

export interface BannerSlide {
  readonly id: string
  readonly title: React.ReactNode
  readonly subtitle?: string
  readonly ctaHref?: string
  readonly imageUrl?: string
  readonly graphicUrl?: string
  readonly bgGradient?: string
}

const DEFAULT_SLIDES: BannerSlide[] = [
  {
    id: "bonus",
    title: (
      <>
        Get <span className="text-[#FFC91F]">₦300</span> when you sign up
      </>
    ),
    ctaHref: "/auth/sign-up",
    graphicUrl: "/gift-box.png",
    bgGradient: "from-[#1E1B4B] via-[#312E81] to-[#0F1727]",
  },
  {
    id: "eviction",
    title: (
      <>
        Don't miss out on <span className="text-[#FFC91F]">Sunday Evictions</span>
      </>
    ),
    ctaHref: "/markets",
    graphicUrl: "/clock.png",
    bgGradient: "from-[#0F1727] via-[#1E2A44] to-[#111827]",
  },
  {
    id: "trade",
    title: (
      <>
        Trade your <span className="text-[#FFC91F]">opinion</span> for profit
      </>
    ),
    ctaHref: "/markets",
    graphicUrl: "/sheybi-mascot.png",
    bgGradient: "from-[#080B14] via-[#161F33] to-[#0F1727]",
  },
]

interface HeroBannerProps extends React.ComponentProps<"section"> {
  /** Optional custom headline text for desktop. */
  readonly headline?: string
  /** Optional custom description text. */
  readonly description?: string
  /** Optional custom mascot image URL (defaults to /sheybi-mascot.png). */
  readonly mascotUrl?: string
  /** Custom banner slides for mobile carousel. */
  readonly slides?: BannerSlide[]
  /** Whether the banner is in a loading state. */
  readonly loading?: boolean
}

function HeroBannerSkeleton({
  className,
}: {
  className?: string
}): React.ReactElement {
  return (
    <div className={cn("w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-4", className)}>
      <div className="flex flex-col gap-3 flex-1 w-full">
        <Skeleton className="h-44 md:h-64 w-full rounded-2xl bg-[var(--bg-surface)]" />
      </div>
    </div>
  )
}

function HeroBanner({
  headline,
  description,
  mascotUrl = "/sheybi-mascot.png",
  slides = DEFAULT_SLIDES,
  loading = false,
  className,
  ...props
}: HeroBannerProps): React.ReactElement {
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0)
  const [touchStartX, setTouchStartX] = React.useState<number | null>(null)

  // Auto-slide / rotate every 4.5 seconds
  React.useEffect(() => {
    if (!slides || slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % slides.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [slides])

  const handleNext = React.useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const handlePrev = React.useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX - touchEndX
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext()
      else handlePrev()
    }
    setTouchStartX(null)
  }

  if (loading) {
    return <HeroBannerSkeleton className={className} />
  }

  return (
    <section
      data-slot="hero-banner"
      role="banner"
      suppressHydrationWarning
      className={cn("w-full py-2 sm:py-4 md:py-6 overflow-hidden", className)}
      {...props}
    >
      {/* Dynamic Expand & Shrink Accordion Banner Layout */}
      <div
        className="relative w-full select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Accordion Row Container */}
        <div className="flex w-full gap-3 sm:gap-4 items-stretch min-h-[145px] sm:min-h-[160px]">
          {slides.map((slide, idx) => {
            const isActive = idx === currentSlideIndex

            return (
              <Link
                key={slide.id}
                href={slide.ctaHref || "/auth/sign-up"}
                onClick={(e) => {
                  // If clicking a shrunk card, expand it instead of immediate navigation
                  if (!isActive) {
                    e.preventDefault()
                    setCurrentSlideIndex(idx)
                  }
                }}
                className={cn(
                  "relative p-4 sm:p-6 flex flex-col justify-between rounded-2xl border border-[var(--border-default)] overflow-hidden cursor-pointer",
                  "transition-all duration-500 ease-in-out bg-gradient-to-br",
                  slide.bgGradient || "from-[#1E1B4B] via-[#312E81] to-[#0F1727]",
                  // Active expanded card: flex-[4] (~75% width), full opacity, scale-100
                  // Inactive shrunk card: flex-[1] (~22% width), dimmed, scale-95
                  isActive
                    ? "flex-[4] sm:flex-[3.5] opacity-100 scale-100 shadow-2xl z-10"
                    : "flex-[1] opacity-65 scale-[0.96] hover:opacity-90 shadow-md z-0"
                )}
              >
                {/* Custom graphic background if available */}
                {slide.imageUrl && (
                  <img
                    src={slide.imageUrl}
                    alt="Slide Banner Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity duration-300"
                  />
                )}

                {/* Floating Graphic Image (Enlarged on Active, Compact on Shrunk) */}
                {!slide.imageUrl && (
                  <div
                    className={cn(
                      "absolute bottom-0 right-0 z-0 pointer-events-none opacity-95 flex items-end justify-end transition-all duration-500",
                      isActive
                        ? slide.id === "bonus"
                          ? "w-40 sm:w-48 md:w-56 max-h-[160px]"
                          : "w-32 sm:w-40 md:w-44 max-h-[140px]"
                        : "w-16 sm:w-20 max-h-[90px] opacity-70"
                    )}
                  >
                    <img
                      src={slide.graphicUrl || mascotUrl}
                      alt="Slide Graphic"
                      className="w-full h-auto object-contain drop-shadow-2xl translate-x-1 translate-y-1"
                    />
                  </div>
                )}

                {/* Slide Text Content — Only visible when card is expanded */}
                <div
                  className={cn(
                    "relative z-10 my-auto transition-all duration-300",
                    isActive
                      ? "opacity-100 translate-x-0 max-w-[65%] sm:max-w-[68%]"
                      : "opacity-0 pointer-events-none -translate-x-4 max-w-0"
                  )}
                >
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-snug tracking-tight">
                    {slide.title}
                  </h2>
                </div>

                {/* Shrunk Card Compact Title Teaser (Visible only when shrunk) */}
                {!isActive && (
                  <div className="relative z-10 my-auto flex items-center justify-center text-center">
                    <span className="text-xs sm:text-sm font-black text-white/80 uppercase tracking-widest rotate-90 sm:rotate-0 truncate">
                      {slide.id}
                    </span>
                  </div>
                )}
              </Link>
            )
          })}
        </div>

        {/* Bottom Pagination Dot Indicators */}
        <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-3">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                idx === currentSlideIndex
                  ? "w-6 bg-[#FFC91F]"
                  : "w-1.5 bg-white/30 hover:bg-white/50"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export { HeroBanner, HeroBannerSkeleton }
export type { HeroBannerProps }



