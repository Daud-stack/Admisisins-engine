import { getPendingSignoffs } from "@/lib/actions/signoffs"
import { getAuditTrail, getSignoffHistory } from "@/lib/actions/audit-actions"
import SignoffButton from "@/components/dashboard/signoff-button"
import { 
  ShieldCheck, 
  History, 
  UserCheck, 
  Lock, 
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User
} from "lucide-react"
import { cn } from "@/lib/utils"

const eventIcons: Record<string, any> = {
  AUDIT_CREATED: { icon: FileText, color: "text-primary", bg: "bg-primary/10" },
  ISSUE_RESOLVED: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  SIGNOFF_COMPLETED: { icon: Lock, color: "text-warn", bg: "bg-warn/10" },
  DEFAULT: { icon: AlertCircle, color: "text-muted-foreground", bg: "bg-surface-2" }
}

export default async function SignoffsPage() {
  const { data: pending = [] } = await getPendingSignoffs()
  const { data: auditLogs = [] } = await getAuditTrail(20)
  const { data: signoffHistory = [] } = await getSignoffHistory(10)

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Operational Authorization</h1>
          <p className="text-muted-foreground mt-1 font-mono uppercase text-[10px] tracking-widest">Supervisor Station · Shift Finalization & Audit Governance</p>
        </div>
        <UserCheck className="h-8 w-8 text-primary opacity-20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1: Pending Sign-offs */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg">Pending Authentication</h3>
          </div>
          
          <div className="space-y-4">
            {pending.length === 0 ? (
              <div className="bg-surface border border-dashed border-border rounded-3xl p-12 text-center text-muted text-xs font-mono uppercase tracking-widest">
                All Station Logs Secure
              </div>
            ) : pending.map((item: any, idx: number) => (
              <div key={idx} className="bg-surface border border-border p-6 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">
                    {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-background border border-border text-primary">{item.shift}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{item._count.id} Records</span>
                  </div>
                </div>
                <SignoffButton date={item.date.toISOString()} shift={item.shift} />
              </div>
            ))}
          </div>

          {/* Sign-off History */}
          <div className="pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Secured Shifts</span>
            </div>
            <div className="space-y-2">
              {signoffHistory.length === 0 ? (
                <p className="text-[10px] text-muted-foreground italic">No sign-offs recorded yet</p>
              ) : signoffHistory.map((s: any) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border/50 group hover:border-success/20 transition-all">
                  <div className="p-1.5 rounded-lg bg-success/10">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-foreground truncate">
                      {new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {s.shift}
                    </p>
                    <p className="text-[9px] text-muted-foreground">{s.supervisorName} · {s.recordCount} records</p>
                  </div>
                  <Lock className="h-3 w-3 text-success/40" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Column 2-3: Live Audit Trail */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-bold text-lg">Live Audit Trail</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">Tamper-Proof System Event Log</p>
              </div>
            </div>
            <span className="text-[9px] font-bold text-muted-foreground bg-surface px-3 py-1 rounded-full border border-border">
              {auditLogs.length} EVENTS
            </span>
          </div>

          <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-xl">
            {auditLogs.length === 0 ? (
              <div className="p-16 text-center text-muted-foreground text-xs font-mono uppercase tracking-widest">
                No System Events Recorded
              </div>
            ) : (
              <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto">
                {auditLogs.map((log: any) => {
                  const config = eventIcons[log.event] || eventIcons.DEFAULT
                  const IconComp = config.icon
                  const logData = log.data || {}
                  
                  return (
                    <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-white/2 transition-colors group">
                      <div className={cn("p-2 rounded-xl mt-0.5 shrink-0", config.bg)}>
                        <IconComp className={cn("h-3.5 w-3.5", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-xs font-bold text-foreground">{log.event.replace(/_/g, ' ')}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            {log.shift && (
                              <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground">
                                {log.shift}
                              </span>
                            )}
                            <span className="text-[9px] text-muted-foreground font-mono">
                              {new Date(log.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="h-3 w-3 text-muted-foreground/50" />
                          <span className="text-[10px] text-muted-foreground">{log.userName}</span>
                          <span className="text-[8px] font-black px-1 py-0.5 rounded bg-primary/5 text-primary/60">{log.userRole}</span>
                        </div>
                        {logData.issueCount !== undefined && (
                          <p className="text-[10px] text-muted-foreground/60 mt-1 italic">
                            {logData.issueCount > 0 ? `${logData.issueCount} compliance gap(s) detected` : 'Clean audit — no issues'}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Immutable Record Notice */}
          <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-4">
            <Lock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-foreground uppercase">Immutable Record Protocol</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                All events are write-once entries in the SystemLog table. Signed-off shifts lock associated DQC records from further modification, ensuring a tamper-proof audit trail for regulatory compliance.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
