"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "./use-media-query"
import { DialogSize, DialogType, DialogStatus } from "./types"

interface ResponsiveWrapperProps {
  isOpen: boolean
  onClose: () => void
  status?: DialogStatus
  isFinancial?: boolean
  size?: DialogSize
  type?: DialogType
  title: string
  description?: string
  children: React.ReactNode
  showCloseButton?: boolean
}

export function ResponsiveWrapper({
  isOpen,
  onClose,
  status = "idle",
  isFinancial = false,
  size = "md",
  type = "modal",
  title,
  description,
  children,
  showCloseButton = true
}: ResponsiveWrapperProps) {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const isLocked = isFinancial || status === "disabled" || status === "pending"

  // Max width maps on desktop
  const sizeClasses: Record<DialogSize, string> = {
    xs: "sm:max-w-[320px]",
    sm: "sm:max-w-[400px]",
    md: "sm:max-w-[640px]",
    lg: "sm:max-w-[768px]",
    xl: "sm:max-w-[960px]",
    full: "sm:max-w-[95vw] sm:h-[95vh]"
  }

  // Determine standard classes for Overlay
  const overlayClass = cn(
    "fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-200",
    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
  )

  // Determine standard classes for Content
  let contentClass = ""

  if (isMobile) {
    if (type === "fullscreen") {
      contentClass = cn(
        "fixed inset-0 z-50 flex flex-col bg-[var(--surface-container-low)] dark:bg-[#0B0E14] p-6 outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
      )
    } else {
      // Bottom sheet (modal or sheet type on mobile)
      contentClass = cn(
        "fixed inset-x-0 bottom-0 z-50 flex flex-col gap-4 rounded-t-3xl border-t border-[var(--outline-variant)] bg-[var(--surface-container-low)] dark:bg-[#0F1727] p-4 outline-none shadow-xl",
        "pb-[calc(16px+env(safe-area-inset-bottom))] max-h-[90dvh] overflow-y-auto",
        "transition-transform duration-200 ease-out",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom"
      )
    }
  } else {
    // Desktop layout
    if (type === "sheet") {
      // Side drawer sheet (right-aligned)
      contentClass = cn(
        "fixed top-0 right-0 z-50 h-full w-[360px] border-l border-[var(--outline-variant)] bg-[var(--surface-container-low)] dark:bg-[#0F1727] p-6 shadow-xl outline-none",
        "transition-transform duration-200 ease-out",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right"
      )
    } else if (type === "fullscreen") {
      contentClass = cn(
        "fixed inset-4 z-50 flex flex-col rounded-3xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] dark:bg-[#0F1727] p-6 shadow-2xl outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
      )
    } else {
      // Standard modal
      contentClass = cn(
        "fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4 rounded-3xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] dark:bg-[#0F1727] p-6 shadow-2xl outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
        sizeClasses[size]
      )
    }
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={overlayClass} />
        <DialogPrimitive.Content
          data-slot="dialog-content"
          className={contentClass}
          onPointerDownOutside={(e) => {
            if (isLocked) {
              e.preventDefault()
            }
          }}
          onEscapeKeyDown={(e) => {
            if (isLocked) {
              e.preventDefault()
            }
          }}
        >
          {/* Mobile bottom sheet drag handle */}
          {isMobile && type !== "fullscreen" && (
            <div className="mx-auto h-1 w-12 rounded-full bg-muted-foreground/20 cursor-grab" />
          )}

          {/* Close button (hidden when locked) */}
          {showCloseButton && !isLocked && (
            <DialogPrimitive.Close asChild>
              <Button
                variant="ghost"
                className="absolute top-4 right-4 h-8 w-8 rounded-full border border-border"
                size="icon"
                onClick={onClose}
              >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogPrimitive.Close>
          )}

          {/* Title and Description for A11y */}
          <div className="sr-only">
            <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description>{description}</DialogPrimitive.Description>
            )}
          </div>

          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
export default ResponsiveWrapper
export { ResponsiveWrapper as ResponsiveDialog }

