"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../primitives"
import { DialogStatus } from "../../types"
import { useDialog } from "../../dialog-context"

interface UpdatePasswordDialogProps {
  isOpen: boolean
  onClose: () => void
  status: DialogStatus
}

export function UpdatePasswordDialog({ isOpen, onClose, status }: UpdatePasswordDialogProps) {
  const dialog = useDialog()
  const [oldPassword, setOldPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!oldPassword || !newPassword) return

    onClose()

    const loader = dialog.loading({
      title: "Updating Security Password",
      description: "Hashing credentials securely..."
    })

    await new Promise((r) => setTimeout(r, 1500))
    loader.close()

    await dialog.success({
      title: "Password Updated",
      description: "Your login password has been changed successfully. Please log in with your new credentials."
    })
  }

  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="sm"
      title="Update Password"
      description="Update security password credentials."
    >
      <DialogHeader className="p-0">
        <DialogTitle className="text-xl">Update Password</DialogTitle>
        <DialogDescription>Modify your account password. Use a strong, unique combination of characters.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="old-password" className="text-sm font-medium text-[var(--text-secondary)]">Old Password</Label>
          <Input
            id="old-password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            className="h-11 rounded-xl bg-[var(--bg-surface-secondary)] border-[var(--border-default)] focus-visible:ring-[var(--border-active)]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password" className="text-sm font-medium text-[var(--text-secondary)]">New Password</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="h-11 rounded-xl bg-[var(--bg-surface-secondary)] border-[var(--border-default)] focus-visible:ring-[var(--border-active)]"
          />
        </div>

        <DialogFooter className="mt-4 p-0 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-1/2 text-[var(--text-secondary)] border-[var(--border-default)]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-1/2 bg-primary text-white hover:bg-primary-hover"
          >
            Update Password
          </Button>
        </DialogFooter>
      </form>
    </ResponsiveWrapper>
  )
}
export default UpdatePasswordDialog
