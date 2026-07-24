"use client"

import * as React from "react"
import { MaintenanceLayout } from "@/components/layouts"

export default function MaintenancePage() {
  return (
    <MaintenanceLayout
      statusMessage="We're currently upgrading Sheybi to serve you better. We'll be back online shortly."
      countdown={<span className="text-sm font-medium text-text-secondary">Estimated downtime: 1 hour</span>}
    />
  )
}
