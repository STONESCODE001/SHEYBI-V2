"use client"

import { ErrorLayout } from "@/components/layouts"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorLayout
      title="Something went wrong"
      description="Something went wrong on our end. Please try again later."
      primaryAction={
        <Button className="min-h-11 rounded-xl" onClick={reset}>
          Try Again
        </Button>
      }
    />
  )
}
