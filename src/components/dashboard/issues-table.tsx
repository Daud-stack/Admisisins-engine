"use client"

import { useState } from "react"
import { updateIssueStatus } from "@/lib/actions/issues"
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  MoreVertical,
  ArrowRightCircle,
  FileText,
  AlertTriangle,
  Zap,
  ShieldPlus,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import CapaModal from "@/components/dashboard/capa-modal"
import { cn } from "@/lib/utils"

interface IssuesTableProps {
  issues: any[]
}

export default function IssuesTable({ issues }: IssuesTableProps) {
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null)
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIssues)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpandedIssues(next)
  }

  const getSLAStatus = (deadline: string | null, status: string) => {
    if (status === "Closed" || !deadline) return { label: "COMPLIANT", color: "text-success" }
    
    const diff = new Date(deadline).getTime() - new Date().getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 0) return { label: "BREACHED", color: "text-danger animate-pulse" }
    if (hours < 4) return { label: `${hours}h URGENT`, color: "text-danger" }
    if (hours < 12) return { label: `${hours}h CAUTION`, color: "text-warn" }
    return { label: `${hours}h REMAINING`, color: "text-muted-foreground" }
  }

  const handleStatusChange = async (id: string, current: string) => {
    const next = current === "Open" ? "Pending" : current === "Pending" ? "Closed" : "Open"
    setUpdating(id)
    await updateIssueStatus(id, next, `Status changed to ${next}`)
    setUpdating(null)
  }

  return (
    <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-2/50 border-b border-border">
            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Incident Details</th>
            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Protocol Intel (Root Cause)</th>
            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Protocol SLA</th>
            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Authorize</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {issues.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-mono text-xs uppercase tracking-widest">
                Station Clear · No Active Incidents
              </td>
            </tr>
          ) : (
            issues.map((issue) => {
              const sla = getSLAStatus(issue.deadline, issue.status)
              const isExpanded = expandedIssues.has(issue.id)
              const hasPlans = issue.actionPlans && issue.actionPlans.length > 0
              
              return (
                <React.Fragment key={issue.id}>
                <tr className={cn("hover:bg-white/5 transition-colors group border-b border-border/30", isExpanded && "bg-white/2")}>
                  <td className="px-6 py-4 max-w-[200px]">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        {hasPlans && (
                          <button onClick={() => toggleExpand(issue.id)} className="text-muted-foreground hover:text-primary transition-colors">
                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>
                        )}
                        <span className="text-sm font-bold text-foreground truncate">{issue.patientName}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn(
                          "text-[9px] font-black px-1.5 py-0.5 rounded",
                          issue.priority === 'High' ? "bg-danger/20 text-danger" : "bg-primary/20 text-primary"
                        )}>{issue.priority?.toUpperCase()}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{issue.admNo}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-[300px]">
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {issue.category.split(',').map((cat: string) => (
                          <span key={cat} className="text-[9px] font-bold px-2 py-0.5 rounded bg-surface-2 border border-border text-foreground/70">
                            {cat.trim()}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground italic leading-tight line-clamp-2">
                        {issue.rootCause || "Analyzing..."}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className={cn("text-[9px] font-bold uppercase tracking-tight", sla.color)}>
                        {sla.label}
                      </span>
                      {issue.status !== "Closed" && (
                        <div className="w-20 h-1 bg-background rounded-full mt-1 overflow-hidden">
                          <div className={cn(
                            "h-full transition-all duration-500",
                            sla.label.includes("BREACHED") ? "bg-danger" : "bg-primary"
                          )} style={{ width: sla.label.includes("BREACHED") ? '100%' : '60%' }} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight",
                      issue.status === "Open" ? "bg-danger/10 text-danger" :
                      issue.status === "Pending" ? "bg-warn/10 text-warn" :
                      "bg-success/10 text-success"
                    )}>
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        issue.status === "Open" ? "bg-danger" :
                        issue.status === "Pending" ? "bg-warn" :
                        "bg-success"
                      )} />
                      {issue.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedIssue(issue)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all" 
                        title="Add Protocol Action Plan"
                      >
                        <ShieldPlus className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleStatusChange(issue.id, issue.status)}
                        disabled={updating === issue.id}
                        className="p-2 text-muted-foreground hover:text-success hover:bg-success/5 border border-transparent rounded-lg transition-all"
                      >
                        {updating === issue.id ? <Clock className="h-4 w-4 animate-spin" /> : <ArrowRightCircle className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
                {isExpanded && hasPlans && (
                  <tr className="bg-white/[0.03] animate-in slide-in-from-top-1 duration-200">
                    <td colSpan={5} className="px-12 py-6 border-b border-border/30">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <ShieldPlus className="h-3 w-3 text-primary" /> Active Corrective Actions
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {issue.actionPlans.map((plan: any) => (
                             <div key={plan.id} className="p-4 rounded-xl bg-surface border border-border/50 flex flex-col gap-2">
                               <div className="flex items-center justify-between">
                                 <span className={cn(
                                   "text-[8px] font-black px-1.5 py-0.5 rounded",
                                   plan.type === 'Corrective' ? "bg-primary/10 text-primary" : "bg-warn/10 text-warn"
                                 )}>{plan.type.toUpperCase()}</span>
                                 <span className="text-[8px] font-bold text-muted-foreground">{new Date(plan.createdAt).toLocaleDateString()}</span>
                               </div>
                               <p className="text-xs text-foreground/80 leading-relaxed">{plan.description}</p>
                             </div>
                           ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              )
            })
          )}
        </tbody>
      </table>
      {selectedIssue && (
        <CapaModal 
          issue={selectedIssue} 
          onClose={() => setSelectedIssue(null)} 
        />
      )}
    </div>
  )
}
