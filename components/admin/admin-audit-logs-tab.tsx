"use client"

import * as React from "react"
import { ScrollText, Search, ShieldCheck } from "lucide-react"

/**
 * Explanatory Interface: AuditLogRecord
 * Represents an individual event record in the audit trail.
 */
export interface AuditLogRecord {
  id: string
  action: string
  performedBy: string
  targetId: string
  details: string
  timestamp: string
}

/**
 * Explanatory Interface: AdminAuditLogsTabProps
 * Props for rendering the Audit Logs workspace tab.
 */
export interface AdminAuditLogsTabProps {
  logs: AuditLogRecord[]
}

/**
 * Explanatory Component: AdminAuditLogsTab
 * Renders an immutable audit trail table recording administrative actions.
 * Provides transparency for market creations, resolutions, withdrawal approvals, and moderation.
 */
export function AdminAuditLogsTab({ logs }: AdminAuditLogsTabProps) {
  const [filterQuery, setFilterQuery] = React.useState("")

  // Filter logs by search term
  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(filterQuery.toLowerCase())
  )

  /** Helper for styling action badges */
  const getActionBadge = (action: string) => {
    if (action.includes("MARKET")) return "bg-primary/10 text-primary border-primary/20"
    if (action.includes("WITHDRAWAL")) return "bg-warning/10 text-warning border-warning/20"
    if (action.includes("SUGGESTION")) return "bg-info/10 text-info border-info/20"
    return "bg-surface-container text-text-secondary border-border"
  }

  return (
    <div className="space-y-4">
      {/* Top Search Filter */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full rounded-xl border border-[#1E2A3F] bg-[#0F1727] pl-9 pr-4 py-2 text-sm text-white placeholder:text-gray-400 focus:border-[#FFC107] focus:outline-none"
          />
        </div>

        <span className="text-xs text-gray-400">
          Immutable System Log ({filteredLogs.length} events)
        </span>
      </div>

      {/* Audit Logs Table */}
      <div className="overflow-hidden rounded-xl border border-[#1E2A3F] bg-[#0F1727] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white">
            <thead className="border-b border-[#1E2A3F] bg-[#141E30] text-xs uppercase text-gray-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Operator</th>
                <th className="px-4 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2A3F]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    No audit logs recorded matching search.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#141E30]/60 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-gray-400 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-mono font-semibold ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-xs text-white">
                      {log.performedBy}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-300">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
