"use client"

import * as React from "react"
import { AdminLayout } from "@/components/layouts"
import { SectionHeader, AdminTable } from "@/components/parent"

export default function AdminTransactionsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="Financial Activity"
        />
        <AdminTable
          title="Transactions"
          description="Review user deposits, trades, and manage withdrawal requests."
        />
      </div>
    </AdminLayout>
  )
}
