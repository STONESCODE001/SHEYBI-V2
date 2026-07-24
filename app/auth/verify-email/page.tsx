"use client"

import * as React from "react"
import { CenteredLayout } from "@/components/layouts"
import { PlaceholderFeedbackCard } from "@/components/parent"

export default function VerifyEmailPage() {
  return (
    <CenteredLayout>
      <div className="flex w-full max-w-sm flex-col items-center justify-center">
        <PlaceholderFeedbackCard
          title="Verify your email"
          message="We've sent a verification link to your email address. Please click the link to continue."
          action={
            <button
              type="button"
              className="text-sm font-medium text-[var(--primary)] hover:underline focus:outline-none"
              disabled
            >
              Resend verification email
            </button>
          }
        />
      </div>
    </CenteredLayout>
  )
}
