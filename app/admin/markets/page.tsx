"use client"

import * as React from "react"
import { AdminLayout } from "@/components/layouts"
import { SectionHeader, AdminTable } from "@/components/parent"

export default function AdminMarketsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="Market Management"
          actionLabel="Create Market"
          onAction={() => console.log("Create market")}
        />
        <AdminTable
          title="All Markets"
          description="Manage active, resolved, and draft markets."
        />
      </div>
    </AdminLayout>
  )
}
