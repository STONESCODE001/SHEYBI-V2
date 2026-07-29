import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ShellLogoProps {
  readonly className?: string
  readonly compact?: boolean
  readonly showTagline?: boolean
}

function ShellLogo({
  className,
  compact = false,
  showTagline = true,
}: ShellLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "flex shrink-0 flex-col items-start gap-0.5 rounded-xl outline-none",
        "focus-visible:ring-2 focus-visible:ring-[var(--border-active)]",
        className
      )}
      aria-label="Sheybi home"
    >
      <div className="flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="Sheybi Logo"
          width={compact ? 100 : 130}
          height={compact ? 28 : 36}
          style={{ height: "auto" }}
          className="max-h-9 w-auto object-contain"
          priority
        />
      </div>
      {!compact && showTagline && (
        <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[var(--text-muted)]">
          PREDICT. PLAY. WIN.
        </span>
      )}
    </Link>
  )
}

export { ShellLogo }
export type { ShellLogoProps }

