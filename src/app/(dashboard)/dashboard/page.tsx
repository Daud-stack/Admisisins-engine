import { 
  Users, 
  TrendingUp, 
  Activity,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import OperationalCharts from "@/components/dashboard/operational-charts"
import { 
  getShiftHeatmapData, 
  getVolumeErrorCorrelation,
  getKPIMetrics 
} from "@/lib/actions/analytics"
import { getIssues } from "@/lib/actions/issues"

export default async function DashboardPage() {
  const { data: heatmapData = {} } = await getShiftHeatmapData()
  const { data: correlationData = [] } = await getVolumeErrorCorrelation()
  const { data: issues = [] } = await getIssues()
  const { data: kpiData } = await getKPIMetrics()
  
  const openIssues = issues.filter((i: any) => i.status === "Open")

  const kpis = [
    { 
      label: "Station Precision", 
      value: kpiData?.precision || "98.2%", 
      change: kpiData?.precisionTrend || "+1.2%", 
      trend: "up", 
      icon: CheckCircle2, 
      color: "text-primary" 
    },
    { 
      label: "Audit Volume", 
      value: kpiData?.volume || 0, 
      change: kpiData?.volumeTrend || "+5%", 
      trend: "up", 
      icon: Activity, 
      color: "text-blue-500" 
    },
    { 
      label: "Active Protocol Flags", 
      value: kpiData?.flags || 0, 
      change: kpiData?.flagsTrend || "-2", 
      trend: "down", 
      icon: AlertCircle, 
      color: "text-danger" 
    },
    { 
      label: "Shift Risk Index", 
      value: kpiData?.risk || "Low", 
      change: "Nominal", 
      trend: "neutral", 
      icon: Zap, 
      color: "text-warn" 
    },
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Operational Intelligence Command</h1>
          <p className="text-muted-foreground mt-1 font-mono uppercase text-[10px] tracking-widest">Global Station Controller · Real-time Operational Stream</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface px-4 py-2 rounded-lg border border-border flex items-center gap-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">System Status</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-bold text-success font-mono uppercase">Fully Operational</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-surface border border-border p-6 rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
            <div className={cn("absolute -right-2 -top-2 h-16 w-16 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity", kpi.color)}>
              <kpi.icon className="h-full w-full" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className={cn("p-2 rounded-lg bg-white/5 border border-white/10", kpi.color)}>
                  <kpi.icon className="h-4 w-4" />
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full",
                  kpi.trend === "up" ? "bg-success/10 text-success" : 
                  kpi.trend === "down" ? "bg-danger/10 text-danger" : 
                  "bg-warn/10 text-warn"
                )}>
                  {kpi.change}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{kpi.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <OperationalCharts 
             heatmapData={heatmapData} 
             correlationData={correlationData} 
           />
        </div>

        <div className="bg-surface border border-border p-8 rounded-3xl flex flex-col space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Intelligent Flags</h3>
            <Sparkles className="h-5 w-5 text-primary opacity-40" />
          </div>
          
          <div className="space-y-4 flex-1">
            {openIssues.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-40 mt-10">
                 <CheckCircle2 className="h-10 w-10 text-primary" />
                 <p className="text-[10px] font-bold uppercase tracking-widest">All Clear</p>
               </div>
            ) : openIssues.slice(0, 5).map((issue: any) => (
              <div key={issue.id} className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border/50 hover:border-border transition-colors group cursor-pointer">
                <div className={cn(
                  "h-2 w-2 rounded-full mt-1.5",
                  issue.priority === 'High' ? "bg-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-primary"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{issue.patientName}</p>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">{issue.category}</p>
                  <p className="text-[9px] text-primary font-bold uppercase mt-1 italic leading-tight">
                    {issue.rootCause || "Analyzing..."}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full py-4 border border-dashed border-border rounded-2xl text-[10px] font-bold text-muted-foreground uppercase hover:border-primary/50 hover:text-primary transition-all mt-auto flex items-center justify-center gap-2">
            <TrendingUp className="h-3 w-3" />
            Launch Full Analysis Command
          </button>
        </div>
      </div>
    </div>
  )
}
