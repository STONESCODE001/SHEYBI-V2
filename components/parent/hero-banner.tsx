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

  // Touch swipe support for mobile
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

  const currentSlide = slides[currentSlideIndex] || DEFAULT_SLIDES[0]

  return (
    <section
      data-slot="hero-banner"
      role="banner"
      suppressHydrationWarning
      className={cn("w-full py-2 sm:py-4 md:py-6", className)}
      {...props}
    >
      {/* MOBILE ONLY: Auto-Sliding Graphic Banner Carousel */}
      <div
        className="block md:hidden relative w-full overflow-hidden rounded-2xl border border-[var(--border-default)] shadow-xl select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Link
          href={currentSlide.ctaHref || "/auth/sign-up"}
          className={cn(
            "relative w-full p-5 flex flex-col justify-between min-h-[145px] bg-gradient-to-br transition-all duration-500 ease-in-out cursor-pointer overflow-hidden",
            currentSlide.bgGradient || "from-[#1E1B4B] via-[#312E81] to-[#0F1727]"
          )}
        >
          {/* Custom graphic image background if available */}
          {currentSlide.imageUrl && (
            <img
              src={currentSlide.imageUrl}
              alt="Slide Banner Background"
              className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
          )}

          {/* Bottom Right Floating Graphic (Gift Box / Clock / Mascot) - Flush at bottom-0 right-0 with 0 margin */}
          {!currentSlide.imageUrl && (
            <div
              className={cn(
                "absolute bottom-0 right-0 z-0 pointer-events-none opacity-95 flex items-end justify-end",
                currentSlide.id === "bonus"
                  ? "w-44 sm:w-52 max-h-[160px]"
                  : "w-36 sm:w-44 max-h-[140px]"
              )}
            >
              <img
                src={currentSlide.graphicUrl || mascotUrl}
                alt="Slide Graphic"
                className="w-full h-auto object-contain drop-shadow-2xl translate-x-1 translate-y-1"
              />
            </div>
          )}

          {/* Slide Text Content (Clean, Punchy Title Only) */}
          <div className="relative z-10 my-auto max-w-[62%] sm:max-w-[65%]">
            <h2 className="text-xl sm:text-2xl font-black text-white leading-snug tracking-tight">
              {currentSlide.title}
            </h2>
          </div>

          {/* Bottom Row: Pagination Indicators */}
          <div className="relative z-10 flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setCurrentSlideIndex(idx)
                  }}
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
        </Link>
      </div>

      {/* DESKTOP ONLY: Stacked Typography + Mascot */}
      <div className="hidden md:flex flex-row items-center justify-between gap-8">
        {/* Left: Stacked Headline */}
        <div suppressHydrationWarning className="flex flex-col items-start text-left select-none max-w-2xl">
          {headline ? (
            <h1 className="font-black text-5xl lg:text-6xl tracking-tight text-white leading-tight">
              {headline}
            </h1>
          ) : (
            <h1 className="flex flex-col font-black text-5xl lg:text-7xl xl:text-[80px] tracking-tight leading-[1.02]">
              <span className="text-[#2563EB]">Turn Your</span>
              <span className="text-[#2563EB]">Opinions Into</span>
              <span className="text-[#2563EB]">
                Profit<span className="text-[#FFC700]">.</span>
              </span>
            </h1>
          )}

          {description && (
            <p className="mt-3 text-lg text-gray-300 max-w-xl text-left">
              {description}
            </p>
          )}
        </div>

        {/* Right: Mascot Image */}
        <div className="relative w-64 md:w-[320px] lg:w-[380px] xl:w-[420px] shrink-0 justify-end items-center">
          <img
            suppressHydrationWarning
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



