"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import {
  ActiveDialog,
  AlertConfig,
  ConfirmConfig,
  SuccessConfig,
  ErrorConfig,
  LoadingConfig,
  DialogStatus,
  DialogService
} from "./types"
import { registerDialogs } from "./register-dialogs"

// Initialize centralized dialog registrations
registerDialogs()

const DialogContext = createContext<DialogService | null>(null)

interface DialogState {
  activeDialog: ActiveDialog | null
  queue: ActiveDialog[]
  status: DialogStatus
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState>({
    activeDialog: null,
    queue: [],
    status: "idle"
  })

  const pathname = usePathname()
  const pathnameRef = useRef(pathname)

  // Track path changes to close non-persistent dialogs
  useEffect(() => {
    if (pathname !== pathnameRef.current) {
      pathnameRef.current = pathname
      if (state.activeDialog) {
        const isSystem = state.activeDialog.id.startsWith("system/")
        const isFinancial =
          state.activeDialog.payload?.isFinancial ||
          state.status === "pending" ||
          state.status === "disabled"

        if (!isSystem && !isFinancial) {
          // Auto-close on route change
          console.log("[Analytics] dialog:route_change_dismissed", state.activeDialog.id)
          close(state.activeDialog.id, undefined)
        }
      }
    }
  }, [pathname, state.activeDialog, state.status])

  const open = <TResult = any>(id: string, payload?: any): Promise<TResult | undefined> => {
    const priority = id.startsWith("system/") ? "system" : "regular"
    console.log("[Analytics] dialog:opened", id, payload)

    return new Promise<TResult | undefined>((resolve, reject) => {
      const newDialog: ActiveDialog = {
        id,
        payload,
        resolve: (value) => resolve(value),
        reject: (reason) => reject(reason),
        priority
      }

      setState((current) => {
        if (!current.activeDialog) {
          return {
            activeDialog: newDialog,
            queue: current.queue,
            status: "open"
          }
        }

        // Stacking and priority rules
        if (priority === "system" && current.activeDialog.priority === "regular") {
          // Suspend current regular dialog: push to front of queue
          console.log("[Analytics] dialog:suspended", current.activeDialog.id, "superseded by", id)
          return {
            activeDialog: newDialog,
            queue: [current.activeDialog, ...current.queue],
            status: "open"
          }
        } else {
          // Push to queue FIFO
          return {
            activeDialog: current.activeDialog,
            queue: [...current.queue, newDialog],
            status: current.status
          }
        }
      })
    })
  }

  const close = (id: string, result?: any) => {
    setState((current) => {
      if (!current.activeDialog || current.activeDialog.id !== id) return current

      console.log("[Analytics] dialog:closed", id, { result })

      // Schedule exit animation wait (200ms based on motion tokens)
      setTimeout(() => {
        // Resolve the promise
        current.activeDialog!.resolve(result)

        // Pull next dialog from the queue
        setState((latest) => {
          if (latest.queue.length > 0) {
            const next = latest.queue[0]
            console.log("[Analytics] dialog:restored", next.id)
            return {
              activeDialog: next,
              queue: latest.queue.slice(1),
              status: "open"
            }
          } else {
            return {
              activeDialog: null,
              queue: [],
              status: "idle"
            }
          }
        })
      }, 200)

      return {
        ...current,
        status: "closing"
      }
    })
  }

  // Promise-based Dialog Presets APIs
  const alert = (config: AlertConfig): Promise<void> => {
    return open("system/alert", config).then(() => {})
  }

  const confirm = (config: ConfirmConfig): Promise<boolean> => {
    return open("system/confirm", config).then((res) => !!res)
  }

  const success = (config: SuccessConfig): Promise<void> => {
    return open("system/success", config).then(() => {})
  }

  const error = (config: ErrorConfig): Promise<boolean> => {
    return open("system/error", config).then((res) => !!res)
  }

  const loading = (config: LoadingConfig) => {
    let currentMsg = config.message || config.description || "Loading..."
    let isClosed = false

    // Open loading dialog
    open("system/loading", { ...config, message: currentMsg })

    return {
      close: () => {
        if (isClosed) return
        isClosed = true
        close("system/loading")
      },
      update: (msg: string) => {
        if (isClosed) return
        currentMsg = msg
        setState((current) => {
          if (current.activeDialog && current.activeDialog.id === "system/loading") {
            return {
              ...current,
              activeDialog: {
                ...current.activeDialog,
                payload: { ...current.activeDialog.payload, message: msg }
              }
            }
          }
          return current
        })
      }
    }
  }

  const value: DialogService = {
    open,
    close,
    alert,
    confirm,
    success,
    error,
    loading,
    status: state.status,
    setStatus: (newStatus) => setState((prev) => ({ ...prev, status: newStatus })),
    activeDialog: state.activeDialog
  }

  return (
    <DialogContext.Provider value={value}>
      {children}
    </DialogContext.Provider>
  )
}

export function useDialog() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider")
  }
  return context
}

export function useAlert() {
  return useDialog().alert
}

export function useConfirm() {
  return useDialog().confirm
}

export function useLoading() {
  return useDialog().loading
}

export function useSuccess() {
  return useDialog().success
}

export function useError() {
  return useDialog().error
}
export { DialogContext }
