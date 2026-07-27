"use client"

import * as React from "react"
import { UserProfile } from "@clerk/nextjs"
import { AuthenticatedLayout } from "@/components/layouts"
import { User } from "lucide-react"

export default function ProfilePage() {
  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-4xl flex flex-col gap-8 py-2">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <User className="size-6 text-primary" />
              <span>User Profile</span>
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Manage your personal identity, account settings, and trading performance.
            </p>
          </div>
        </div>

        {/* Embedded Clerk User Profile Component */}
        <div className="flex justify-center w-full rounded-2xl overflow-hidden">
          <UserProfile
            routing="hash"
            appearance={{
              elements: {
                rootBox: "w-full",
                cardBox: "w-full shadow-none border-none",
              },
            }}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
