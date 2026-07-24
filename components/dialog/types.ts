import * as React from "react"

export type DialogType =
  | "modal"
  | "sheet"
  | "fullscreen"
  | "alert"
  | "confirm"
  | "loading"
  | "success"
  | "error"
  | "custom"

export type DialogSize = "xs" | "sm" | "md" | "lg" | "xl" | "full"

export type DialogStatus =
  | "idle"
  | "opening"
  | "open"
  | "pending"
  | "disabled"
  | "success"
  | "error"
  | "closing"

export interface BaseDialogConfig {
  title: string
  description?: string
  isFinancial?: boolean
  className?: string
  size?: DialogSize
  type?: DialogType
}

export interface AlertConfig extends BaseDialogConfig {
  actionLabel?: string
}

export interface ConfirmConfig extends BaseDialogConfig {
  actionLabel?: string
  cancelLabel?: string
}

export interface SuccessConfig extends BaseDialogConfig {
  actionLabel?: string
}

export interface ErrorConfig extends BaseDialogConfig {
  actionLabel?: string
  cancelLabel?: string
}

export interface LoadingConfig extends BaseDialogConfig {
  message?: string
}

export interface FormConfig extends BaseDialogConfig {
  children?: React.ReactNode
  onSubmit?: (e: React.FormEvent) => void | Promise<void>
}

export interface WizardConfig extends BaseDialogConfig {
  currentStep: number
  totalSteps: number
  onNext?: () => void
  onPrev?: () => void
  children?: React.ReactNode
}

export interface ActiveDialog {
  id: string
  payload: any
  resolve: (value: any) => void
  reject: (reason: any) => void
  priority: "system" | "regular"
}

export interface DialogService {
  alert(config: AlertConfig): Promise<void>
  confirm(config: ConfirmConfig): Promise<boolean>
  success(config: SuccessConfig): Promise<void>
  error(config: ErrorConfig): Promise<boolean>
  loading(config: LoadingConfig): { close: () => void; update: (msg: string) => void }
  open<TResult = any>(id: string, payload?: any): Promise<TResult | undefined>
  close(id: string, result?: any): void
  status: DialogStatus
  setStatus: (status: DialogStatus) => void
  activeDialog: ActiveDialog | null
}
