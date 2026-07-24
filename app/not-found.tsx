"use client"

import * as React from "react"
import { ErrorLayout } from "@/components/layouts"

export default function NotFoundPage() {
  return (
    <ErrorLayout
      title="Page Not Found"
      description="We couldn't find the page you're looking for. It might have been moved or doesn't exist."
      primaryAction={
        <a
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--primary)] px-4 font-medium text-[var(--on-primary)] hover:bg-[var(--primary-hover)]"
        >
          Return Home
        </a>
      }
    />
  )
}
