import Link from "next/link"
import { cn } from "@/lib/utils"

interface ShellLogoProps {
  readonly className?: string
  readonly compact?: boolean
}

function ShellLogo({ className, compact = false }: ShellLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-xl outline-none",
        "focus-visible:ring-2 focus-visible:ring-[var(--border-active)]",
        className
      )}
      aria-label="Sheybi home"
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-xl bg-[var(--accent-primary)] font-semibold text-[var(--text-inverse)]",
          compact ? "size-8 text-sm" : "size-10 text-base"
        )}
        aria-hidden="true"
      >
        S
      </span>
      {!compact && (
        <span className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
          Sheybi
        </span>
      )}
    </Link>
  )
}

export { ShellLogo }
export type { ShellLogoProps }
