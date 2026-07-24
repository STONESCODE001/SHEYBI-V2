"use client"

import * as React from "react"
import { AdminLayout } from "@/components/layouts"
import { SectionHeader, AdminTable } from "@/components/parent"

export default function AdminAuditLogsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="System Audit Logs"
        />
        <AdminTable
          title="Logs"
          description="Review system-level events and administrative actions."
        />
      </div>
    </AdminLayout>
  )
}
