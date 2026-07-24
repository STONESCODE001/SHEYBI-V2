"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../primitives"
import { DialogStatus } from "../../types"
import { useDialog } from "../../dialog-context"
import { useRouter } from "next/navigation"
import { User, Wallet, Settings, LogOut } from "lucide-react"

interface ProfileMenuDialogProps {
  isOpen: boolean
  onClose: () => void
  payload?: {
    userName?: string
    userAvatarUrl?: string
  }
  status: DialogStatus
}

export function ProfileMenuDialog({ isOpen, onClose, payload, status }: ProfileMenuDialogProps) {
  const dialog = useDialog()
  const router = useRouter()
  const userName = payload?.userName || "Jane Doe"
  const avatarUrl = payload?.userAvatarUrl

  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleWallet = () => {
    onClose()
    dialog.open("wallet/details")
  }

  const handleProfile = () => {
    onClose()
    router.push("/profile")
  }

  const handleSettings = () => {
    onClose()
    router.push("/settings")
  }

  const handleLogout = async () => {
    onClose()
    const confirmed = await dialog.confirm({
      title: "Logout Confirmation",
      description: "Are you sure you want to log out of your Sheybi account?"
    })
    if (confirmed) {
      console.log("[Dialog Framework] User logging out...")
      window.location.href = "/"
    }
  }

  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="xs"
      title="User Menu"
      description="Quick actions for your account."
    >
      <div className="flex flex-col items-center gap-4 py-2">
        {/* User Avatar and Name */}
        <Avatar size="lg" className="size-16">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={`${userName} avatar`} />
          ) : null}
          <AvatarFallback className="text-lg bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">{userName}</h3>
          <p className="text-xs text-[var(--text-muted)]">Verified Trader</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mt-2">
        <button
          onClick={handleProfile}
          className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[var(--bg-hover)] text-sm font-medium text-[var(--text-primary)] transition-colors text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-active)]"
        >
          <User className="size-4.5 text-[var(--text-muted)]" />
          <span>My Profile</span>
        </button>

        <button
          onClick={handleWallet}
          className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[var(--bg-hover)] text-sm font-medium text-[var(--text-primary)] transition-colors text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-active)]"
        >
          <Wallet className="size-4.5 text-[var(--text-muted)]" />
          <span>My Wallet</span>
        </button>

        <button
          onClick={handleSettings}
          className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[var(--bg-hover)] text-sm font-medium text-[var(--text-primary)] transition-colors text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-active)]"
        >
          <Settings className="size-4.5 text-[var(--text-muted)]" />
          <span>Account Settings</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[var(--danger-soft)] text-sm font-medium text-[var(--danger)] transition-colors text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)]"
        >
          <LogOut className="size-4.5" />
          <span>Log Out</span>
        </button>
      </div>

      <DialogFooter className="mt-4 p-0">
        <Button onClick={onClose} className="w-full text-[var(--text-secondary)] border-[var(--border-default)]" variant="outline">
          Close
        </Button>
      </DialogFooter>
    </ResponsiveWrapper>
  )
}
export default ProfileMenuDialog
