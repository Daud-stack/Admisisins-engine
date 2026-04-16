import IssuesTable from "@/components/dashboard/issues-table"
import { getIssues } from "@/lib/actions/issues"
import { AlertCircle, Target, CheckCircle2 } from "lucide-react"

export default async function TrackerPage() {
  const { data: issues = [] } = await getIssues()
  
  const openCount = issues.filter((i: any) => i.status === "Open").length
  const pendingCount = issues.filter((i: any) => i.status === "Pending").length

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Incident Command</h1>
          <p className="text-muted-foreground mt-1 font-mono uppercase text-[10px] tracking-widest">Global Issue Tracker · Resolved: {issues.length - openCount - pendingCount}</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface px-6 py-3 rounded-2xl border border-border flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Critical Load</span>
              <span className="text-lg font-bold text-danger">{openCount}</span>
            </div>
            <div className="h-8 w-px bg-border/50" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Pending Action</span>
              <span className="text-lg font-bold text-warn">{pendingCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4 p-5 bg-surface-2/30 border border-border rounded-2xl">
          <div className="p-2 rounded-lg bg-danger/10">
            <AlertCircle className="h-5 w-5 text-danger" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Resolution Goal</p>
            <p className="text-sm font-semibold">Under 4h Protocol</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 bg-surface-2/30 border border-border rounded-2xl">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Global Precision</p>
            <p className="text-sm font-semibold">98.5% Target</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 bg-surface-2/30 border border-border rounded-2xl">
          <div className="p-2 rounded-lg bg-success/10">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Station Health</p>
            <p className="text-sm font-semibold font-mono tracking-tighter">NOMINAL STATUS</p>
          </div>
        </div>
      </div>

      <IssuesTable issues={issues} />
    </div>
  )
}
