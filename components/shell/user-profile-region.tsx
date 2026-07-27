"use client"

import Link from "next/link"
import { useAuth, UserButton } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import type { ShellVariant } from "./types"

interface UserProfileRegionProps {
  readonly variant: ShellVariant
  readonly userName?: string
  readonly userAvatarUrl?: string
  readonly className?: string
}

export function UserProfileRegion({
  variant,
  className,
}: UserProfileRegionProps) {
  const { isSignedIn } = useAuth()

  if (variant === "guest" || !isSignedIn) {
    return (
      <div
        data-slot="user-profile-region"
        className={cn(
          "flex w-full flex-col gap-2 shrink-0 p-4",
          className
        )}
      >
        <Link
          href="/auth/sign-in"
          className={cn(
            "flex h-11 w-full items-center justify-center rounded-xl font-semibold text-sm",
            "bg-[var(--bg-base)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
            "outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[var(--border-active)]"
          )}
        >
          Log In
        </Link>
        <Link
          href="/auth/sign-up"
          className={cn(
            "flex h-11 w-full items-center justify-center rounded-xl font-semibold text-sm",
            "bg-[var(--accent-yellow)] text-[var(--text-inverse)] hover:bg-[var(--accent-yellow-hover)]",
            "outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[var(--border-active)]"
          )}
        >
          Sign up
        </Link>
      </div>
    )
  }

  return (
    <div
      data-slot="user-profile-region"
      className={cn(
        "flex w-full shrink-0 items-center justify-between p-4 pt-2",
        className
      )}
    >
      <div className="flex w-full items-center gap-3 rounded-xl bg-[var(--bg-base)] px-3.5 py-2">
        <UserButton
          showName
          userProfileMode="navigation"
          userProfileUrl="/profile"
          appearance={{
            elements: {
              userButtonBox: "flex flex-row-reverse justify-between w-full items-center gap-2",
              userButtonOuterIdentifier: "text-sm font-semibold text-[var(--text-primary)] truncate max-w-[120px]",
              avatarBox: "size-7 rounded-full",
            },
          }}
        />
      </div>
    </div>
  )
}

export default UserProfileRegion
export type { UserProfileRegionProps }
