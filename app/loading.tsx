"use client"

import * as React from "react"
import { LoadingLayout } from "@/components/layouts"

export default function LoadingPage() {
  return (
    <LoadingLayout>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 w-full animate-pulse rounded-lg bg-[var(--bg-surface-secondary)]"
          />
        ))}
      </div>
    </LoadingLayout>
  )
}
