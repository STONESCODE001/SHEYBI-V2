"use client"

import * as React from "react"
import { AdminLayout } from "@/components/layouts"
import { SectionHeader, AdminTable } from "@/components/parent"

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="User Management"
        />
        <AdminTable
          title="All Users"
          description="View and manage user accounts, suspensions, and verifications."
        />
      </div>
    </AdminLayout>
  )
}
