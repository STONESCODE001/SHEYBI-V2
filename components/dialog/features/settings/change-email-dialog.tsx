"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ResponsiveWrapper } from "../../responsive-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../primitives"
import { DialogStatus } from "../../types"
import { useDialog } from "../../dialog-context"

interface ChangeEmailDialogProps {
  isOpen: boolean
  onClose: () => void
  payload?: {
    currentEmail?: string
  }
  status: DialogStatus
}

export function ChangeEmailDialog({ isOpen, onClose, payload, status }: ChangeEmailDialogProps) {
  const dialog = useDialog()
  const [email, setEmail] = React.useState(payload?.currentEmail || "jane.doe@example.com")
  
  // Placeholders for Theme, Language, Notifications
  const [theme, setTheme] = React.useState("dark")
  const [language, setLanguage] = React.useState("english")
  const [pushNotif, setPushNotif] = React.useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    onClose()

    const loader = dialog.loading({
      title: "Updating Account Email",
      description: "Connecting to user management portal..."
    })

    await new Promise((r) => setTimeout(r, 1500))
    loader.close()

    await dialog.success({
      title: "Email Updated",
      description: `Verification link has been sent to ${email}. Please check your inbox.`
    })
  }

  return (
    <ResponsiveWrapper
      isOpen={isOpen}
      onClose={onClose}
      status={status}
      size="sm"
      title="Account Preferences & Settings"
      description="Modify email settings and update options."
    >
      <DialogHeader className="p-0">
        <DialogTitle className="text-xl">Account Settings</DialogTitle>
        <DialogDescription>Update email credentials and configure interface options.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="edit-email" className="text-sm font-medium text-[var(--text-secondary)]">Email Address</Label>
          <Input
            id="edit-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 rounded-xl bg-[var(--bg-surface-secondary)] border-[var(--border-default)] focus-visible:ring-[var(--border-active)]"
          />
        </div>

        {/* Placeholders for Theme, Language, Notifications as per spec */}
        <div className="border-t border-[var(--border-default)] pt-4 space-y-4">
          <h4 className="text-sm font-semibold text-[var(--text-primary)]">Preferences (Placeholders)</h4>
          
          <div className="flex items-center justify-between">
            <Label className="text-xs text-[var(--text-secondary)]">Theme Selection</Label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="px-2 py-1 rounded bg-[var(--bg-surface-secondary)] border border-[var(--border-default)] text-xs text-[var(--text-primary)]"
            >
              <option value="dark">Dark Theme</option>
              <option value="light">Light Theme</option>
              <option value="system">System Default</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-[var(--text-secondary)]">Preferred Language</Label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2 py-1 rounded bg-[var(--bg-surface-secondary)] border border-[var(--border-default)] text-xs text-[var(--text-primary)]"
            >
              <option value="english">English</option>
              <option value="pidgin">Nigerian Pidgin</option>
              <option value="yoruba">Yoruba</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-[var(--text-secondary)]">Push Notifications</Label>
            <button
              type="button"
              onClick={() => setPushNotif(!pushNotif)}
              className={cn(
                "w-10 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 outline-none",
                pushNotif ? "bg-primary" : "bg-[var(--bg-surface-secondary)] border border-[var(--border-default)]"
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-full bg-white transition-transform duration-200",
                  pushNotif ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>
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
            Update Email
          </Button>
        </DialogFooter>
      </form>
    </ResponsiveWrapper>
  )
}
export default ChangeEmailDialog
