"use client"

import Link from "next/link"
import { User } from "lucide-react"
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
          "flex h-16 w-full shrink-0 items-center border-t border-[var(--border-default)] bg-[var(--bg-surface)] p-4",
          className
        )}
      >
        <Link
          href="/sign-in"
          className={cn(
            "flex w-full items-center gap-3 rounded-xl text-sm text-[var(--text-primary)]",
            "outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-active)]"
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--bg-surface-secondary)] text-[var(--text-muted)]">
            <User className="size-5" aria-hidden="true" />
          </span>
          <span>Login / Create Account</span>
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
        "flex h-16 w-full shrink-0 items-center border-t border-[var(--border-default)] bg-[var(--bg-surface)] p-4",
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
          "flex w-full items-center gap-3 rounded-xl outline-none",
          "focus-visible:ring-2 focus-visible:ring-[var(--border-active)]"
        )}
        aria-label="Open profile menu"
      >
        <Avatar className="size-10">
          {userAvatarUrl ? (
            <AvatarImage src={userAvatarUrl} alt={`${userName} avatar`} />
          ) : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--text-primary)]">
            {userName}
          </p>
          <p className="truncate text-xs text-[var(--text-muted)]">
            {/* Clerk User Button placeholder — auth wiring is out of scope */}
            {variant === "admin" ? "Administrator" : "View profile"}
          </p>
        </div>
      </Link>
    </div>
  )
}

export { UserProfileRegion }
export type { UserProfileRegionProps }
