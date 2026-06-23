"use client"

import { cn } from "@/lib/utils"
import { AlertTriangle } from "lucide-react"

interface BadDebtRiskItem {
  episodeNo: string
  patientName: string
  scheme: string
  amount: number
  status: string
  agingDays: number
  riskScore: number
  riskLevel: "low" | "medium" | "high" | "critical"
}

interface BadDebtTableProps {
  items: BadDebtRiskItem[]
  summary: {
    totalAtRisk: number
    criticalCount: number
    highCount: number
    total: number
  }
}

export default function BadDebtTable({ items, summary }: BadDebtTableProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-red-400"
    if (score >= 50) return "text-orange-400"
    if (score >= 30) return "text-yellow-400"
    return "text-emerald-400"
  }

  const getScoreBg = (score: number) => {
    if (score >= 75) return "bg-red-500"
    if (score >= 50) return "bg-orange-500"
    if (score >= 30) return "bg-yellow-500"
    return "bg-emerald-500"
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-2xl">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Value at Risk</p>
          <p className="text-2xl font-black text-red-400 mt-1">
            ${(summary.totalAtRisk / 1000).toFixed(1)}k
          </p>
        </div>
        <div className="p-5 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Critical Episodes</p>
          <p className="text-2xl font-black text-orange-400 mt-1">{summary.criticalCount}</p>
        </div>
        <div className="p-5 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">High Risk</p>
          <p className="text-2xl font-black text-yellow-400 mt-1">{summary.highCount}</p>
        </div>
        <div className="p-5 bg-background border border-border rounded-2xl">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Tracked</p>
          <p className="text-2xl font-black text-foreground mt-1">{summary.total}</p>
        </div>
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground text-xs font-mono uppercase tracking-widest border border-dashed border-border rounded-2xl">
          No bad debt risk data — ingest authorization records to populate
        </div>
      ) : (
        <div className="border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-2/30 border-b border-border">
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Episode</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Scheme</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Aging</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Risk Score</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {items.slice(0, 15).map((item) => (
                <tr key={item.episodeNo} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-foreground">{item.patientName}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{item.episodeNo}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-foreground/80">{item.scheme}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold font-mono text-foreground">
                      ${item.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "text-xs font-bold",
                      item.agingDays > 60 ? "text-red-400" : item.agingDays > 30 ? "text-yellow-400" : "text-foreground"
                    )}>
                      {item.agingDays}d
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-2 bg-background rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", getScoreBg(item.riskScore))}
                          style={{ width: `${item.riskScore}%` }}
                        />
                      </div>
                      <span className={cn("text-xs font-black font-mono", getScoreColor(item.riskScore))}>
                        {item.riskScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
