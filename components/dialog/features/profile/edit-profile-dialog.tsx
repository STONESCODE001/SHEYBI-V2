"use client"

import * as React from "react"
import { ResponsiveWrapper } from "../../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../primitives"
import { DialogStatus } from "../../types"
import { useDialog } from "../../dialog-context"

interface EditProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  payload?: {
    currentUsername?: string
  }
  status: DialogStatus
}

export function EditProfileDialog({ isOpen, onClose, payload, status }: EditProfileDialogProps) {
  const dialog = useDialog()
  const [username, setUsername] = React.useState(payload?.currentUsername || "Jane Doe")

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username) return

    onClose()

    // Show loading
    const loader = dialog.loading({
      title: "Saving Profile Changes",
      description: "Uploading profile updates..."
    })

    // Simulate save duration
    await new Promise((r) => setTimeout(r, 1500))

    loader.close()

    // Show success
    await dialog.success({
      title: "Profile Updated",
      description: "Your user profile changes have been saved."
    })
  }

  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="sm"
      title="Edit Profile"
      description="Update your personal details."
    >
      <DialogHeader className="p-0">
        <DialogTitle className="text-xl">Edit Profile</DialogTitle>
        <DialogDescription>Modify your username and customize your account avatar display.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSave} className="mt-4 flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-username" className="text-sm font-medium text-[var(--text-secondary)]">Username</Label>
          <Input
            id="edit-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </ResponsiveWrapper>
  )
}
export default EditProfileDialog
