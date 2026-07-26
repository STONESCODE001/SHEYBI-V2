"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { ShellLogo } from "./shell-logo"

interface FooterRegionProps {
  readonly className?: string
}

function FooterRegion({ className }: FooterRegionProps) {
  return (
    <footer
      data-slot="footer-region"
      className={cn(
        "w-full border-t border-[var(--border-default)] bg-[var(--bg-base)] px-4 py-8 md:px-8 md:py-12",
        className
      )}
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
        {/* Top row: Logo + Quick Navigation Links */}
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <ShellLogo showTagline />

          <nav aria-label="Footer Navigation" className="flex flex-col gap-2 sm:flex-row sm:gap-6">
            <Link
              href="/"
              className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent-yellow)]"
            >
              Home
            </Link>
            <Link
              href="/contact"
              className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent-yellow)]"
            >
              Contact
            </Link>
          </nav>
        </div>

        {/* Middle row: Financial risk disclaimer text */}
        <p className="max-w-3xl text-xs leading-relaxed text-[var(--text-muted)]">
          Prediction markets involve financial risk—only trade with funds you can afford to lose. Bayse does not provide investment or financial advice. All market outcomes are resolved transparently using publicly verifiable sources. Participation is restricted to individuals 18 years and older and may be limited in some jurisdictions. Please review our Terms of Service, Privacy Policy, and Prohibition Policy before using the platform.
        </p>

        {/* Bottom row: Copyright line */}
        <p className="text-xs text-[var(--text-muted)]">
          &copy; 2026 Sheybi. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export { FooterRegion }
export type { FooterRegionProps }
