import * as React from "react"
import { ApplicationShell } from "@/components/shell/application-shell"

export interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <ApplicationShell variant="guest">
      {children}
    </ApplicationShell>
  )
}
