import {
  Building2,
  Users,
  ShieldCheck,
  AlertCircle,
  DollarSign,
  Clock,
  Activity,
  TrendingUp,
  CheckCircle2,
  ArrowUpRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getManagementKPIs, getStaffPerformanceSummary, getOperationalTimeline } from "@/lib/actions/management-actions"

export default async function ManagementPage() {
  const [kpiRes, staffRes, timelineRes] = await Promise.all([
    getManagementKPIs(),
    getStaffPerformanceSummary(),
    getOperationalTimeline()
  ])

  const kpis = kpiRes.data || { totalAdmissions: 0, complianceRate: 100, totalRevenue: 0, openIssues: 0, totalIssues: 0, activeStaff: 0, totalSignoffs: 0, slaHealth: 100 }
  const staff = staffRes.data || []
  const timeline = timelineRes.data || []

  const formatCurrency = (val: number) => {
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`
    if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}k`
    return `$${val.toFixed(0)}`
  }

  const kpiCards = [
    { label: "Total Admissions", value: kpis.totalAdmissions.toLocaleString(), icon: Activity, color: "text-primary", gradient: "from-primary/10" },
    { label: "Compliance Rate", value: `${kpis.complianceRate}%`, icon: ShieldCheck, color: "text-success", gradient: "from-success/10" },
    { label: "Revenue Pipeline", value: formatCurrency(kpis.totalRevenue), icon: DollarSign, color: "text-blue-400", gradient: "from-blue-500/10" },
    { label: "Open Issues", value: kpis.openIssues.toString(), icon: AlertCircle, color: "text-danger", gradient: "from-danger/10" },
    { label: "Active Staff", value: kpis.activeStaff.toString(), icon: Users, color: "text-purple-400", gradient: "from-purple-500/10" },
    { label: "SLA Health", value: `${kpis.slaHealth}%`, icon: Clock, color: "text-warn", gradient: "from-warn/10" },
  ]

  const getEventLabel = (event: string) => {
    switch (event) {
      case "AUDIT_CREATED": return { label: "Audit Created", color: "bg-primary" }
      case "ISSUE_RESOLVED": return { label: "Issue Resolved", color: "bg-success" }
      case "PEER_AUDIT_COMPLETED": return { label: "Peer Review", color: "bg-blue-500" }
      case "DATA_INGESTED": return { label: "Data Ingested", color: "bg-purple-500" }
      case "SIGNOFF_COMPLETED": return { label: "Shift Signed Off", color: "bg-warn" }
      default: return { label: event.replace(/_/g, " "), color: "bg-muted-foreground" }
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground drop-shadow-sm">Management Command</h1>
          <p className="text-muted-foreground mt-2 font-mono uppercase text-[10px] tracking-[0.2em] opacity-60">
            Executive Overview · Cross-Department Intelligence
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-border flex items-center gap-4">
            <Building2 className="h-5 w-5 text-primary opacity-40" />
            <div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase">Operational Status</p>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] font-black text-success uppercase tracking-tighter">All Systems Nominal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Executive KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className={cn(
            "bg-surface border border-border p-8 rounded-[2rem] relative overflow-hidden group hover:shadow-2xl transition-all duration-500",
            "bg-gradient-to-br", kpi.gradient, "to-transparent"
          )}>
            <div className="absolute -right-4 -top-4 h-20 w-20 opacity-[0.03] group-hover:opacity-[0.1] transition-all duration-700 group-hover:scale-125">
              <kpi.icon className={cn("h-full w-full", kpi.color)} />
            </div>
            <div className="space-y-4 relative z-10">
              <div className={cn("p-2.5 rounded-xl bg-white/5 border border-white/10 w-fit", kpi.color)}>
                <kpi.icon className="h-4 w-4" />
              </div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">{kpi.label}</p>
              <h3 className="text-2xl font-black text-foreground tracking-tighter tabular-nums">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Staff Performance */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-[2.5rem] shadow-xl overflow-hidden">
          <div className="p-8 border-b border-border bg-white/[0.02] flex items-center justify-between">
            <div>
              <h3 className="font-black text-xl tracking-tight text-foreground">Staff Performance Summary</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 opacity-50">Clerk Workload & Precision Overview</p>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase bg-background px-3 py-1 rounded-full border border-border">
              {staff.length} Active
            </span>
          </div>
          
          {staff.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground text-xs font-mono uppercase tracking-widest">
              No clerk data available
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-2/30 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <th className="px-8 py-4">Operative</th>
                    <th className="px-8 py-4 text-center">Audits</th>
                    <th className="px-8 py-4 text-center">Issues</th>
                    <th className="px-8 py-4 text-center">Precision</th>
                    <th className="px-8 py-4 text-center">Peer Score</th>
                    <th className="px-8 py-4 text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {staff.map((member: any) => (
                    <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-5">
                        <div>
                          <p className="text-sm font-bold text-foreground">{member.name}</p>
                          <p className="text-[10px] text-muted-foreground">{member.dept}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center font-mono text-sm">{member.totalAudits}</td>
                      <td className="px-8 py-5 text-center">
                        <span className={cn("font-mono text-sm", member.issueAudits > 0 ? "text-warn" : "text-muted-foreground")}>
                          {member.issueAudits}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border">
                          <div className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            member.precisionRate >= 95 ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" :
                            member.precisionRate >= 85 ? "bg-primary" : "bg-warn"
                          )} />
                          <span className="text-[10px] font-bold">{member.precisionRate}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center font-mono text-sm">{member.avgPeerScore > 0 ? member.avgPeerScore : "—"}</td>
                      <td className="px-8 py-5 text-right">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black border",
                          member.status === "Excellent" ? "bg-success/10 text-success border-success/20" :
                          member.status === "Good" ? "bg-primary/10 text-primary border-primary/20" :
                          "bg-warn/10 text-warn border-warn/20"
                        )}>
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Operational Timeline */}
        <div className="bg-surface border border-border p-8 rounded-[2.5rem] shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-black text-lg tracking-tight text-foreground">Activity Feed</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 opacity-50">Real-Time Operations</p>
            </div>
            <TrendingUp className="h-5 w-5 text-primary opacity-40" />
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-2 max-h-[500px]">
            {timeline.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-mono uppercase tracking-widest opacity-30">
                <div className="text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 mx-auto" />
                  <p>No Recent Events</p>
                </div>
              </div>
            ) : timeline.map((event: any) => {
              const meta = getEventLabel(event.event)
              return (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-background/50 transition-all group">
                  <div className={cn("h-2 w-2 rounded-full mt-1.5 shrink-0", meta.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground">{meta.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {event.shift && <span className="text-primary">[{event.shift}] </span>}
                      {new Date(event.createdAt).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 p-6 rounded-2xl flex items-center gap-4">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Signoffs</p>
            <p className="text-xl font-black text-foreground">{kpis.totalSignoffs}</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/20 p-6 rounded-2xl flex items-center gap-4">
          <Activity className="h-5 w-5 text-blue-400" />
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Issues</p>
            <p className="text-xl font-black text-foreground">{kpis.totalIssues}</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-success/5 to-transparent border border-success/20 p-6 rounded-2xl flex items-center gap-4">
          <ArrowUpRight className="h-5 w-5 text-success" />
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Resolved</p>
            <p className="text-xl font-black text-foreground">{kpis.totalIssues - kpis.openIssues}</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-warn/5 to-transparent border border-warn/20 p-6 rounded-2xl flex items-center gap-4">
          <Clock className="h-5 w-5 text-warn" />
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">SLA On-Time</p>
            <p className="text-xl font-black text-foreground">{kpis.slaHealth}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
