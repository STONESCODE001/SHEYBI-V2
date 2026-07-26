"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { ShellVariant } from "./types"
import { PLACEHOLDER_USER_NAME } from "./constants"
import { useDialog } from "@/components/dialog"

interface UserProfileRegionProps {
  readonly variant: ShellVariant
  readonly userName?: string
  readonly userAvatarUrl?: string
  readonly className?: string
}

function UserProfileRegion({
  variant,
  userName = PLACEHOLDER_USER_NAME,
  userAvatarUrl,
  className,
}: UserProfileRegionProps) {
  const dialog = useDialog()

  if (variant === "guest") {
    return (
      <div
        data-slot="user-profile-region"
        className={cn(
          "flex w-full flex-col gap-2 shrink-0 p-4",
          className
        )}
      >
        <Link
          href="/sign-in"
          className={cn(
            "flex h-11 w-full items-center justify-center rounded-xl font-semibold text-sm",
            "bg-[var(--bg-base)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
            "outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[var(--border-active)]"
          )}
        >
          Log In
        </Link>
        <Link
          href="/sign-in"
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

  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      data-slot="user-profile-region"
      className={cn(
        "flex w-full shrink-0 items-center p-4 pt-2",
        className
      )}
    >
      <Link
        href={variant === "admin" ? "/admin/settings" : "/profile"}
        onClick={(e) => {
          if (variant !== "admin") {
            e.preventDefault()
            dialog.open("profile/menu", { userName, userAvatarUrl })
          }
        }}
        className={cn(
          "flex h-11 w-full items-center gap-3 rounded-xl bg-[var(--bg-base)] px-3.5 outline-none transition-colors hover:bg-[var(--bg-hover)]",
          "focus-visible:ring-2 focus-visible:ring-[var(--border-active)]"
        )}
        aria-label="Open profile menu"
      >
        <Avatar className="size-6">
          {userAvatarUrl ? (
            <AvatarImage src={userAvatarUrl} alt={`${userName} avatar`} />
          ) : null}
          <AvatarFallback className="bg-[var(--bg-surface-secondary)] text-[10px] text-[var(--text-primary)] font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
          {userName}
        </span>
      </Link>
    </div>
  )
}

export { UserProfileRegion }
export type { UserProfileRegionProps }
