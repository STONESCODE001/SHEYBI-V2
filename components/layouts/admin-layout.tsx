import * as React from "react"
import { ApplicationShell } from "@/components/shell/application-shell"

export interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ApplicationShell variant="admin">
      {children}
    </ApplicationShell>
  )
}
