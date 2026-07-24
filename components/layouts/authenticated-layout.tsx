import * as React from "react"
import { ApplicationShell } from "@/components/shell/application-shell"

export interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <ApplicationShell variant="authenticated">
      {children}
    </ApplicationShell>
  )
}
