"use client"

import * as React from "react"
import { useState } from "react"
import { PublicLayout } from "@/components/layouts"
import { Button } from "@/components/ui/button"
import { useDialog } from "@/components/dialog"
import { useRouter } from "next/navigation"

export default function TestDialogPage() {
  const dialog = useDialog()
  const router = useRouter()
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev])
  }

  const handleAlert = async () => {
    addLog("Triggering alert...")
    await dialog.alert({
      title: "Test System Alert",
      description: "This is a standard system alert notifying the user of something important."
    })
    addLog("Alert resolved.")
  }

  const handleConfirm = async () => {
    addLog("Triggering confirm...")
    const res = await dialog.confirm({
      title: "Confirm Action",
      description: "Are you sure you want to proceed with this request? This action cannot be undone."
    })
    addLog(`Confirm resolved with: ${res}`)
  }

  const handleSuccess = async () => {
    addLog("Triggering success...")
    await dialog.success({
      title: "Transaction Successful",
      description: "Your prediction has been logged. Wallet updated by ₦2,500."
    })
    addLog("Success resolved.")
  }

  const handleError = async () => {
    addLog("Triggering error...")
    const retry = await dialog.error({
      title: "Failed to Connect",
      description: "We couldn't connect to the prediction server. Please try again.",
      actionLabel: "Retry Now",
      cancelLabel: "Dismiss"
    })
    addLog(`Error resolved (Retry clicked): ${retry}`)
  }

  const handleLoadingLifecycle = () => {
    addLog("Triggering async loading lifecycle...")
    const loader = dialog.loading({
      title: "Submitting Transaction",
      description: "Connecting to prediction engine..."
    })

    // Simulate step 1
    setTimeout(() => {
      addLog("Updating loading message to 'Executing trade details...'")
      loader.update("Executing trade details...")
    }, 1500)

    // Simulate step 2 (success resolution)
    setTimeout(() => {
      addLog("Completing loading and opening success modal...")
      loader.close()
      dialog.success({
        title: "Trade Executed",
        description: "Your order for 100 Yes shares has been filled."
      })
    }, 3000)
  }

  const handleFinancialLock = async () => {
    addLog("Triggering financial lock confirm...")
    const res = await dialog.confirm({
      title: "Execute Real-Money Trade",
      description: "Are you sure you want to commit ₦1,000 to this trade? Esc/Backdrop clicks will be blocked.",
      isFinancial: true
    })
    addLog(`Financial confirm resolved with: ${res}`)
  }

  const handleSessionExpired = async () => {
    addLog("Triggering Session Expired...")
    await dialog.open("system/session-expired")
    addLog("Session Expired resolved.")
  }

  const handleMaintenance = async () => {
    addLog("Triggering Maintenance...")
    await dialog.open("system/maintenance")
    addLog("Maintenance resolved.")
  }

  const handleOffline = async () => {
    addLog("Triggering Offline...")
    await dialog.open("system/offline")
    addLog("Offline resolved.")
  }

  const handleMarketResolved = async () => {
    addLog("Triggering Market Resolved...")
    await dialog.open("system/market-resolved", {
      title: "Will Nigeria win the next AFCON tournament?",
      resolution: "YES",
      payout: "₦5,000.00"
    })
    addLog("Market Resolved resolved.")
  }

  const handleMarketSuspended = async () => {
    addLog("Triggering Market Suspended...")
    await dialog.open("system/market-suspended", {
      title: "Will BBNaija Season 11 launch before September?",
      reason: "Under administrative review due to early leakage."
    })
    addLog("Market Suspended resolved.")
  }

  const handleComingSoon = async () => {
    addLog("Triggering Coming Soon...")
    await dialog.open("system/coming-soon", {
      featureName: "Web3 Wallet Connect"
    })
    addLog("Coming Soon resolved.")
  }

  const handleRateLimit = async () => {
    addLog("Triggering Rate Limit...")
    await dialog.open("system/rate-limit")
    addLog("Rate Limit resolved.")
  }

  const handleKYCRequired = async () => {
    addLog("Triggering KYC Required...")
    const res = await dialog.open("system/kyc-required")
    addLog(`KYC Required resolved with: ${res}`)
  }

  const handleStackingInterrupt = async () => {
    addLog("Opening first regular dialog...")
    
    // Non-blocking background open of regular dialog
    dialog.confirm({
      title: "Regular Dialog",
      description: "This is a feature dialog that will be suspended by a system event."
    }).then((res) => {
      addLog(`Regular Dialog finished with: ${res}`)
    })

    // Timeout to simulate system interruption
    setTimeout(() => {
      addLog("System interruption! Opening system-level alert...")
      dialog.alert({
        title: "Session Expiring (System)",
        description: "Your session is about to expire. We suspended other windows to notify you."
      }).then(() => {
        addLog("System Alert resolved. Regular dialog should restore.")
      })
    }, 1500)
  }

  const handleRouteNavigationTest = () => {
    addLog("Opening regular dialog and navigating in 2 seconds...")
    dialog.confirm({
      title: "Will be closed by route change",
      description: "This dialog should automatically close when we navigate away."
    })

    setTimeout(() => {
      addLog("Navigating to settings...")
      router.push("/settings")
    }, 2000)
  }

  return (
    <PublicLayout>
      <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Dialog Framework Verification Console</h1>
          <p className="text-sm text-muted-foreground">
            Test all dialog types, transition behaviors, queuing rules, and interaction locks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Action Buttons Panel */}
          <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card">
            <h2 className="text-lg font-semibold">Test Scenarios</h2>
            <div className="grid grid-cols-2 gap-3">
              <Button id="btn-alert" onClick={handleAlert} variant="outline">
                Simple Alert
              </Button>
              <Button id="btn-confirm" onClick={handleConfirm} variant="outline">
                Simple Confirm
              </Button>
              <Button id="btn-success" onClick={handleSuccess} variant="outline">
                Success Modal
              </Button>
              <Button id="btn-error" onClick={handleError} variant="outline">
                Error Modal
              </Button>
              <Button id="btn-loading" onClick={handleLoadingLifecycle} variant="outline">
                Async Loading
              </Button>
              <Button id="btn-lock" onClick={handleFinancialLock} variant="outline">
                Financial Lock
              </Button>
            </div>
            
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
              <h3 className="text-sm font-medium">New Status Dialogs</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleSessionExpired} variant="outline">
                  Session Expired
                </Button>
                <Button onClick={handleMaintenance} variant="outline">
                  Maintenance
                </Button>
                <Button onClick={handleOffline} variant="outline">
                  Offline
                </Button>
                <Button onClick={handleMarketResolved} variant="outline">
                  Market Resolved
                </Button>
                <Button onClick={handleMarketSuspended} variant="outline">
                  Market Suspended
                </Button>
                <Button onClick={handleComingSoon} variant="outline">
                  Coming Soon
                </Button>
                <Button onClick={handleRateLimit} variant="outline">
                  Rate Limit
                </Button>
                <Button onClick={handleKYCRequired} variant="outline">
                  KYC Required
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
              <h3 className="text-sm font-medium">Advanced Workflows</h3>
              <div className="flex flex-col gap-2">
                <Button id="btn-stack" onClick={handleStackingInterrupt} className="w-full bg-primary text-white">
                  System Interrupt Stacking
                </Button>
                <Button id="btn-route" onClick={handleRouteNavigationTest} variant="secondary" className="w-full">
                  Route Auto-Dismissal
                </Button>
              </div>
            </div>
          </div>

          {/* Execution Logs Panel */}
          <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Execution Logs</h2>
              <Button onClick={() => setLogs([])} variant="ghost" size="sm">
                Clear
              </Button>
            </div>
            <div className="flex-1 min-h-[300px] max-h-[300px] overflow-y-auto border border-border rounded-xl bg-muted/30 p-3 font-mono text-xs flex flex-col gap-1.5">
              {logs.length === 0 ? (
                <div className="text-muted-foreground italic text-center py-12">No events logged yet. Click buttons to test.</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-foreground border-b border-border/10 pb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
