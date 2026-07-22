"use client"

import { ApplicationShell } from "@/components/shell"

/**
 * Temporary host route so the Application Shell can be verified.
 * Routed page content is owned by 06-pages.md and will replace this placeholder.
 */
export default function HomePage() {
  return (
    <ApplicationShell variant="authenticated">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Main Content
        </h1>
        <p className="text-base text-[var(--text-secondary)]">
          Routed pages replace this region only. The Application Shell remains
          mounted around every route.
        </p>
      </section>
    </ApplicationShell>
  )
}
