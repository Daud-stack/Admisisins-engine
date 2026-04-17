import { buildClerkScorecards, getRevenueIntelligence } from "@/lib/engine"
import { 
  TrendingUp, 
  ShieldCheck, 
  UserPlus, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Target
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getVolumeErrorCorrelation } from "@/lib/actions/analytics"
import RiskFluxChart from "@/components/dashboard/risk-flux-chart"
import AnalyticsExport from "@/components/dashboard/analytics-export"

export default async function AnalyticsPage() {
  const scorecards = await buildClerkScorecards()
  const revenue = await getRevenueIntelligence()
  const { data: trendData = [] } = await getVolumeErrorCorrelation()

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Revenue & Performance Intelligence</h1>
          <p className="text-muted-foreground mt-1 font-mono uppercase text-[10px] tracking-widest">Cross-Reference Engine · v2.0 Neural Bridge</p>
        </div>
        <div className="flex gap-4 items-center">
          <AnalyticsExport scorecards={scorecards} />
          <div className="bg-surface px-6 py-3 rounded-2xl border border-border flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Revenue At Risk</span>
              <span className="text-lg font-bold text-warn">${(revenue.pendingAuthValue / 1000).toFixed(1)}k</span>
            </div>
            <div className="h-8 w-px bg-border/50" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Risk index</span>
              <span className={cn(
                "text-lg font-bold",
                revenue.atRiskPercentage > 15 ? "text-danger" : "text-primary"
              )}>{revenue.atRiskPercentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-border bg-white/2 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Admission Clerk Scorecards</h3>
                <p className="text-xs text-muted-foreground uppercase font-mono tracking-tighter">Throughput vs Audit Reconciliation</p>
              </div>
              <Target className="h-5 w-5 text-primary opacity-40" />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-2/30">
                    <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Station Clerk</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Tracked</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Audited</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Audit %</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {scorecards.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-muted font-mono text-xs uppercase tracking-widest">
                        Awaiting Dataset Ingestion
                      </td>
                    </tr>
                  ) : scorecards.map((card) => (
                    <tr key={card.clerkName} className="hover:bg-white/2 transition-colors">
                      <td className="px-8 py-5">
                        <span className="text-sm font-bold text-foreground">{card.clerkName}</span>
                      </td>
                      <td className="px-8 py-5 text-center font-mono text-sm">{card.trackedCount}</td>
                      <td className="px-8 py-5 text-center font-mono text-sm">{card.auditedCount}</td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={cn(
                            "text-xs font-bold",
                            card.auditRate > 90 ? "text-success" : card.auditRate > 50 ? "text-primary" : "text-warn"
                          )}>{card.auditRate.toFixed(1)}%</span>
                          <div className="w-16 h-1 bg-background rounded-full overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: `${card.auditRate}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black tracking-tight",
                          card.complianceRate > 95 ? "bg-success/10 text-success" : "bg-warn/10 text-warn"
                        )}>
                          {card.complianceRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-surface border border-border p-8 rounded-3xl space-y-6">
            <h3 className="font-bold text-lg">Revenue Shield</h3>
            <div className="space-y-4">
              <div className="p-6 bg-background rounded-2xl border border-border relative overflow-hidden group">
                <ShieldCheck className="absolute -right-2 -bottom-2 h-12 w-12 text-primary opacity-[0.05]" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Auth Pipeline Capacity</p>
                <div className="flex items-center justify-between mt-2">
                  <h4 className="text-2xl font-bold">${(revenue.totalAuthValue / 1e6).toFixed(2)}M</h4>
                  <span className="flex items-center text-[10px] font-bold text-success">
                    <ArrowUpRight className="h-3 w-3 mr-1" /> ACTIVE
                  </span>
                </div>
              </div>
              
              <div className="p-6 bg-background rounded-2xl border border-border relative overflow-hidden group">
                <AlertTriangle className="absolute -right-2 -bottom-2 h-12 w-12 text-warn opacity-[0.05]" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Pending Auth (TBA)</p>
                <div className="flex items-center justify-between mt-2">
                  <h4 className="text-2xl font-bold">{revenue.pendingCount} <span className="text-xs text-muted-foreground font-medium">EPISODES</span></h4>
                  <span className="text-[10px] font-bold text-warn">
                    ACTION REQ
                  </span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span>Monthly Exposure Trend</span>
                <span className="text-danger">+4.2%</span>
              </div>
              <div className="h-48">
                <RiskFluxChart data={trendData} />
              </div>
            </div>
          </section>

          <section className="bg-primary/5 border border-primary/20 p-8 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-sm text-foreground uppercase tracking-tight">Intelligence Note</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Discrepancies identified in <b>{scorecards.reduce((acc,s) => acc + s.issuesCount, 0)}</b> admissions 
              this period. Revenue exposure is concentrated in <b>Medical Aid</b> schemes with pending pre-authorizations.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
