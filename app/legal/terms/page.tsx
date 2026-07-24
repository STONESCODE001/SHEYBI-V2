"use client"

import * as React from "react"
import { PublicLayout } from "@/components/layouts"

export default function TermsOfServicePage() {
  return (
    <PublicLayout>
      <div className="mx-auto flex max-w-[800px] flex-col gap-8 py-8 md:py-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Terms of Service
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Last updated: October 1, 2026
          </p>
        </div>
        <div className="prose prose-sm md:prose-base dark:prose-invert">
          <p className="text-[var(--text-secondary)]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui
            mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor
            neque eu tellus rhoncus ut eleifend nibh porttitor.
          </p>
          <h2 className="mt-8 text-xl font-semibold text-[var(--text-primary)]">
            1. Acceptance of Terms
          </h2>
          <p className="mt-2 text-[var(--text-secondary)]">
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
            ut aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur.
          </p>
          <h2 className="mt-8 text-xl font-semibold text-[var(--text-primary)]">
            2. User Obligations
          </h2>
          <p className="mt-2 text-[var(--text-secondary)]">
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum.
          </p>
        </div>
      </div>
    </PublicLayout>
  )
}
