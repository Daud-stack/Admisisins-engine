import { 
  Users, 
  TrendingUp, 
  Activity,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Clock,
  ArrowUpRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import OperationalCharts from "@/components/dashboard/operational-charts"
import { 
  getShiftHeatmapData, 
  getVolumeErrorCorrelation,
  getKPIMetrics 
} from "@/lib/actions/analytics"
import { getIntelligentFlags } from "@/lib/actions/intelligence-actions"

export default async function DashboardPage() {
  const { data: heatmapData = {} } = await getShiftHeatmapData()
  const { data: correlationData = [] } = await getVolumeErrorCorrelation()
  const { data: kpiData } = await getKPIMetrics()
  const { data: flags = [] } = await getIntelligentFlags()
  
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
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex items-end justify-between px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground drop-shadow-sm">Operational Intelligence</h1>
          <p className="text-muted-foreground mt-2 font-mono uppercase text-[10px] tracking-[0.2em] opacity-60">Global Station Controller · v2.4 Active Oversight</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-border flex items-center gap-4 transition-all hover:border-primary/20">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">System Status</span>
            <div className="flex items-center gap-2 bg-success/5 px-2 py-1 rounded-lg">
              <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-black text-success font-mono uppercase tracking-tighter">Fully Operational</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-surface border border-border p-10 h-64 rounded-[2.5rem] relative overflow-hidden group hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer flex flex-col justify-between">
            <div className={cn("absolute -right-4 -top-4 h-24 w-24 opacity-[0.03] group-hover:opacity-[0.1] transition-all duration-700 group-hover:scale-125", kpi.color)}>
              <kpi.icon className="h-full w-full" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className={cn("p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner", kpi.color)}>
                  <kpi.icon className="h-5 w-5" />
                </div>
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-tight",
                  kpi.trend === "up" ? "bg-success/10 text-success border border-success/20" : 
                  kpi.trend === "down" ? "bg-danger/10 text-danger border border-danger/20" : 
                  "bg-warn/10 text-warn border border-warn/20"
                )}>
                  {kpi.trend === "up" && <ArrowUpRight className="h-3 w-3" />}
                  {kpi.change}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">{kpi.label}</p>
                <h3 className="text-4xl font-black text-foreground tracking-tighter tabular-nums leading-none">{kpi.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8 min-h-[500px]">
           <OperationalCharts 
             heatmapData={heatmapData} 
             correlationData={correlationData} 
           />
        </div>

        <div className="bg-surface border border-border p-10 rounded-[2.5rem] flex flex-col space-y-10 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className="font-black text-xl tracking-tight text-foreground">Intelligent Flags</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 opacity-50">Contextual Anomaly Stream</p>
            </div>
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-4 flex-1 relative z-10">
            {flags.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-30 mt-10">
                 <CheckCircle2 className="h-12 w-12 text-primary" />
                 <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Active Gaps</p>
               </div>
            ) : flags.map((flag: any) => (
              <div key={flag.id} className="flex items-start gap-5 p-5 rounded-[1.25rem] bg-background/50 border border-border/50 hover:border-primary/20 hover:bg-background transition-all group cursor-pointer shadow-sm hover:shadow-md">
                <div className={cn(
                  "h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 shadow-lg",
                  flag.severity === 'high' ? "bg-danger shadow-danger/40 animate-pulse" : 
                  flag.severity === 'medium' ? "bg-warn shadow-warn/40" : 
                  "bg-primary shadow-primary/40"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-foreground truncate">{flag.title}</p>
                    {flag.type === 'breach' && <Clock className="h-3 w-3 text-danger opacity-60" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium mt-1 leading-relaxed opacity-80">{flag.description}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded bg-surface border border-border text-primary/80 uppercase">
                      {flag.category?.split(',')[0]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full py-5 border border-dashed border-border rounded-[1.5rem] text-[11px] font-black text-muted-foreground uppercase hover:border-primary/40 hover:text-primary transition-all mt-auto flex items-center justify-center gap-3 group/btn hover:bg-primary/5">
            <TrendingUp className="h-4 w-4 transition-transform group-hover/btn:-translate-y-0.5" />
            Operational Deep-Dive Command
          </button>
        </div>
      </div>
    </div>
  )
}
