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

  // Auto-slide every 4.5 seconds
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
  const mainSlideIndex = currentSlideIndex % slides.length
  const peekSlideIndex = (currentSlideIndex + 1) % slides.length

  const mainSlide = slides[mainSlideIndex] || slides[0]
  const peekSlide = slides[peekSlideIndex] || slides[1]

  return (
    <section
      data-slot="hero-banner"
      role="banner"
      suppressHydrationWarning
      className={cn("w-full py-2 sm:py-4 md:py-6 overflow-hidden", className)}
      {...props}
    >
      {/* 2-Slot Dynamic Main + Peek Circular Reel */}
      <div
        className="relative w-full overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Track Container: Holds Main Card (74%) + Peeking Card (24%) */}
        <div className="flex gap-3 sm:gap-4 w-full items-center h-[140px] sm:h-[145px]">
          {/* Slot 1: Main Active Banner (~74% Mobile / ~64% Desktop) */}
          <Link
            key={mainSlide.id}
            href={mainSlide.ctaHref || "/auth/sign-up"}
            className={cn(
              "relative shrink-0 flex flex-col justify-between overflow-hidden cursor-pointer rounded-2xl border transition-all duration-500 ease-out h-full bg-gradient-to-br p-5 sm:p-6 opacity-100 border-[var(--border-default)] shadow-2xl z-10 w-[74%] sm:w-[68%] md:w-[64%] lg:w-[60%]",
              mainSlide.bgGradient || "from-[#1E1B4B] via-[#312E81] to-[#0F1727]"
            )}
          >
            {/* Custom graphic background if available */}
            {mainSlide.imageUrl && (
              <img
                src={mainSlide.imageUrl}
                alt="Slide Banner Background"
                className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity duration-500"
              />
            )}

            {/* Bottom Right Floating Graphic */}
            {!mainSlide.imageUrl && (
              <div
                className={cn(
                  "absolute bottom-0 right-0 z-0 pointer-events-none flex items-end justify-end transition-all duration-500 max-h-[120px] sm:max-h-[130px] overflow-hidden opacity-95",
                  mainSlide.id === "bonus"
                    ? "w-28 sm:w-36 md:w-40 h-full"
                    : "w-24 sm:w-32 md:w-36 h-full"
                )}
              >
                <img
                  src={mainSlide.graphicUrl || mascotUrl}
                  alt="Slide Graphic"
                  className="w-full h-full object-contain object-bottom drop-shadow-2xl translate-x-1 translate-y-1"
                />
              </div>
            )}

            {/* Main Banner Text Content */}
            <div className="relative z-10 my-auto transition-all duration-500 max-w-[65%] sm:max-w-[68%]">
              <h2 className="font-black text-white text-xl sm:text-2xl md:text-3xl leading-snug tracking-tight">
                {mainSlide.title}
              </h2>
            </div>
          </Link>

          {/* Slot 2: Peek Next Banner (~24% Mobile / ~32% Desktop — Queued seamlessly behind Main) */}
          <Link
            key={peekSlide.id}
            href={peekSlide.ctaHref || "/auth/sign-up"}
            onClick={(e) => {
              e.preventDefault()
              setCurrentSlideIndex(peekSlideIndex)
            }}
            className={cn(
              "relative flex-1 flex flex-col justify-between overflow-hidden cursor-pointer rounded-2xl border transition-all duration-500 ease-out h-full bg-gradient-to-br p-3 sm:p-4 opacity-60 hover:opacity-85 border-white/10 shadow-md z-0",
              peekSlide.bgGradient || "from-[#1E1B4B] via-[#312E81] to-[#0F1727]"
            )}
          >
            {/* Custom graphic background if available */}
            {peekSlide.imageUrl && (
              <img
                src={peekSlide.imageUrl}
                alt="Slide Banner Background"
                className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-500"
              />
            )}

            {/* Bottom Right Floating Graphic (Compact for Peek) */}
            {!peekSlide.imageUrl && (
              <div
                className={cn(
                  "absolute bottom-0 right-0 z-0 pointer-events-none flex items-end justify-end transition-all duration-500 max-h-[90px] sm:max-h-[100px] overflow-hidden opacity-40 scale-75",
                  peekSlide.id === "bonus"
                    ? "w-16 sm:w-20 h-full"
                    : "w-14 sm:w-16 h-full"
                )}
              >
                <img
                  src={peekSlide.graphicUrl || mascotUrl}
                  alt="Slide Graphic"
                  className="w-full h-full object-contain object-bottom drop-shadow-2xl translate-x-1 translate-y-1"
                />
              </div>
            )}

            {/* Peek Banner Text Content */}
            <div className="relative z-10 my-auto transition-all duration-500 max-w-[90%]">
              <h2 className="font-black text-white text-xs sm:text-sm line-clamp-2 opacity-90 leading-snug tracking-tight">
                {peekSlide.title}
              </h2>
            </div>
          </Link>
        </div>

        {/* Bottom Pagination Dot Indicators */}
        <div className="flex items-center gap-1.5 pt-3">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                idx === mainSlideIndex
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



