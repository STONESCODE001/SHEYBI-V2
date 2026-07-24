"use client"

import * as React from "react"
import { useDialog } from "./dialog-context"
import { DialogRegistry } from "./dialog-registry"

export function DialogViewport() {
  const { activeDialog, status, close, setStatus } = useDialog()

  if (!activeDialog) return null

  const Component = DialogRegistry.get(activeDialog.id)

  if (!Component) {
    console.error(`Dialog component with ID "${activeDialog.id}" is not registered.`)
    return null
  }

  const isOpen = status !== "closing" && status !== "idle"

  const handleClose = (result?: any) => {
    // Prevent closing if dialog is disabled (financial lock)
    if (status === "disabled" || status === "pending") {
      console.log("[Dialog Framework] Prevented close request due to active transaction lock.")
      return
    }
    close(activeDialog.id, result)
  }

  return (
    <Component
      isOpen={isOpen}
      onClose={handleClose}
      payload={activeDialog.payload}
      status={status}
      setStatus={setStatus}
    />
  )
}
export default DialogViewport
