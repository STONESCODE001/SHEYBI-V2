"use client"

import * as React from "react"
import { AdminLayout } from "@/components/layouts"
import { SectionHeader, AdminTable } from "@/components/parent"

export default function AdminCategoriesPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="Category Management"
          actionLabel="Add Category"
          onAction={() => console.log("Add category")}
        />
        <AdminTable
          title="Categories"
          description="Manage top-level and sub-categories for markets."
        />
      </div>
    </AdminLayout>
  )
}
