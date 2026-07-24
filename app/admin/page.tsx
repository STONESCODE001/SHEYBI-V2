"use client"

import * as React from "react"
import { AdminLayout } from "@/components/layouts"
import { SectionHeader, StatisticCard } from "@/components/parent"

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <SectionHeader title="Admin Dashboard" />
        
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <StatisticCard label="Total Users" value="24,501" />
          <StatisticCard label="Active Markets" value="142" />
          <StatisticCard label="Total Volume" value="$12.4M" />
          <StatisticCard label="Revenue (30d)" value="$45.2K" />
          <StatisticCard label="Pending Withdrawals" value="12" />
          <StatisticCard label="Reported Users" value="3" />
        </div>
      </div>
    </AdminLayout>
  )
}
