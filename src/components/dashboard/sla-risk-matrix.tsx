"use client"

import { cn } from "@/lib/utils"
import { AlertTriangle, Clock, Shield, Flame } from "lucide-react"

interface SLARiskItem {
  issueId: string
  patientName: string
  admNo: string
  category: string
  priority: string
  hoursRemaining: number
  breachProbability: number
  riskLevel: "low" | "medium" | "high" | "critical"
}

interface SLARiskMatrixProps {
  items: SLARiskItem[]
  summary: {
    criticalCount: number
    highCount: number
    total: number
    avgProbability: number
  }
}

export default function SLARiskMatrix({ items, summary }: SLARiskMatrixProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default: return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    }
  }

  const getBarColor = (probability: number) => {
    if (probability > 0.9) return "bg-red-500"
    if (probability > 0.7) return "bg-orange-500"
    if (probability > 0.4) return "bg-yellow-500"
    return "bg-emerald-500"
  }

  return (
    <div className="space-y-6">
      {/* Summary Strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
          <Flame className="h-5 w-5 text-red-400" />
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Critical</p>
            <p className="text-xl font-black text-red-400">{summary.criticalCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
          <AlertTriangle className="h-5 w-5 text-orange-400" />
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">High Risk</p>
            <p className="text-xl font-black text-orange-400">{summary.highCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-background border border-border rounded-2xl">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Tracked</p>
            <p className="text-xl font-black text-foreground">{summary.total}</p>
          </div>
        </div>
      </div>

      {/* Risk Table */}
      {items.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground text-xs font-mono uppercase tracking-widest border border-dashed border-border rounded-2xl">
          No active SLA risks detected
        </div>
      ) : (
        <div className="border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-2/30 border-b border-border">
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Patient</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Hours Left</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Breach Risk</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {items.slice(0, 10).map((item) => (
                <tr key={item.issueId} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-foreground">{item.patientName}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{item.admNo}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      {item.category.split(',')[0]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Clock className={cn("h-3 w-3", item.hoursRemaining <= 2 ? "text-red-400 animate-pulse" : "text-muted-foreground")} />
                      <span className={cn("text-xs font-bold font-mono", item.hoursRemaining <= 2 ? "text-red-400" : "text-foreground")}>
                        {item.hoursRemaining <= 0 ? "BREACHED" : `${item.hoursRemaining}h`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-background rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", getBarColor(item.breachProbability))}
                          style={{ width: `${item.breachProbability * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold font-mono text-foreground">
                        {(item.breachProbability * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black tracking-tight border",
                      getRiskColor(item.riskLevel)
                    )}>
                      {item.riskLevel.toUpperCase()}
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
