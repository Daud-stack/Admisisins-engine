import {
  Landmark,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  PiggyBank,
  Receipt,
  FileWarning
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getTreasuryOverview, getBadDebtRiskReport, getSchemeProfitability, getRevenueLeakage } from "@/lib/actions/financial-actions"
import SchemeProfitabilityChart from "@/components/dashboard/scheme-profitability-chart"
import BadDebtTable from "@/components/dashboard/bad-debt-table"

export default async function FinancialPage() {
  const [treasuryRes, badDebtRes, schemeRes, leakageRes] = await Promise.all([
    getTreasuryOverview(),
    getBadDebtRiskReport(),
    getSchemeProfitability(),
    getRevenueLeakage()
  ])

  const treasury = treasuryRes.data || { totalRevenue: 0, totalCollected: 0, totalOutstanding: 0, rejectedValue: 0, badDebtRate: 0, collectionRate: 0, episodeCount: 0 }
  const badDebt = badDebtRes.data || { items: [], summary: { totalAtRisk: 0, criticalCount: 0, highCount: 0, total: 0 } }
  const schemes = schemeRes.data || []
  const leakage = leakageRes.data || { items: [], summary: { count: 0, totalEstimated: 0 } }

  const formatCurrency = (val: number) => {
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`
    if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}k`
    return `$${val.toFixed(0)}`
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground drop-shadow-sm">Financial Intelligence</h1>
          <p className="text-muted-foreground mt-2 font-mono uppercase text-[10px] tracking-[0.2em] opacity-60">
            Treasury Analytics · Revenue Protection Command
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-border flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Collection Rate</span>
              <span className={cn("text-lg font-bold", treasury.collectionRate > 80 ? "text-success" : "text-warn")}>
                {treasury.collectionRate.toFixed(1)}%
              </span>
            </div>
            <div className="h-8 w-px bg-border/50" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Bad Debt Risk</span>
              <span className={cn("text-lg font-bold", treasury.badDebtRate > 10 ? "text-danger" : "text-primary")}>
                {treasury.badDebtRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Treasury KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Revenue", value: formatCurrency(treasury.totalRevenue), icon: DollarSign, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
          { label: "Collected", value: formatCurrency(treasury.totalCollected), icon: ShieldCheck, color: "text-success", bg: "bg-success/10 border-success/20" },
          { label: "Outstanding", value: formatCurrency(treasury.totalOutstanding), icon: Receipt, color: "text-warn", bg: "bg-warn/10 border-warn/20" },
          { label: "Rejected Claims", value: formatCurrency(treasury.rejectedValue), icon: TrendingDown, color: "text-danger", bg: "bg-danger/10 border-danger/20" },
          { label: "Episodes Tracked", value: treasury.episodeCount.toString(), icon: PiggyBank, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "Revenue Leakage", value: formatCurrency(leakage.summary.totalEstimated), icon: FileWarning, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-surface border border-border p-6 rounded-[1.5rem] relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
            <div className="space-y-3">
              <div className={cn("p-2 rounded-xl border w-fit", kpi.bg, kpi.color)}>
                <kpi.icon className="h-4 w-4" />
              </div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.15em] opacity-50">{kpi.label}</p>
              <h3 className="text-xl font-black text-foreground tracking-tighter">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Scheme Profitability + Scheme Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface border border-border p-10 rounded-[2.5rem] shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-xl tracking-tight text-foreground">Scheme Profitability</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 opacity-50">Medical Aid Revenue Distribution</p>
            </div>
            <Landmark className="h-5 w-5 text-primary opacity-40" />
          </div>
          <div className="h-[350px]">
            {schemes.length > 0 ? (
              <SchemeProfitabilityChart data={schemes} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-mono uppercase tracking-widest">
                Awaiting authorization data ingestion
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface border border-border p-10 rounded-[2.5rem] shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-black text-xl tracking-tight text-foreground">Scheme Risk Matrix</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 opacity-50">Payment Performance by Funder</p>
            </div>
          </div>
          {schemes.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-xs font-mono uppercase tracking-widest border border-dashed border-border rounded-2xl">
              No scheme data available
            </div>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
              {schemes.slice(0, 10).map((scheme: any) => (
                <div key={scheme.scheme} className="flex items-center justify-between p-4 bg-background rounded-xl border border-border hover:border-primary/20 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{scheme.scheme}</p>
                    <p className="text-[10px] text-muted-foreground">{scheme.episodeCount} episodes · Avg {formatCurrency(scheme.avgClaimValue)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold font-mono">{formatCurrency(scheme.totalBilled)}</p>
                      <p className={cn("text-[10px] font-bold", scheme.paymentRate > 80 ? "text-success" : scheme.paymentRate > 50 ? "text-warn" : "text-danger")}>
                        {scheme.paymentRate.toFixed(0)}% collected
                      </p>
                    </div>
                    <div className={cn(
                      "px-2 py-1 rounded-lg text-[9px] font-black border",
                      scheme.riskIndex > 50 ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      scheme.riskIndex > 30 ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    )}>
                      R:{scheme.riskIndex}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bad Debt Risk */}
      <div className="bg-surface border border-border p-10 rounded-[2.5rem] shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-black text-xl tracking-tight text-foreground">Bad Debt Risk Assessment</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 opacity-50">Multi-Factor Risk Scoring · Status + Aging + Amount + Funder</p>
          </div>
          <div className="p-2 rounded-xl bg-danger/10 border border-danger/20">
            <AlertTriangle className="h-5 w-5 text-danger" />
          </div>
        </div>
        <BadDebtTable items={badDebt.items} summary={badDebt.summary} />
      </div>

      {/* Revenue Leakage */}
      <div className="bg-surface border border-border p-10 rounded-[2.5rem] shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-black text-xl tracking-tight text-foreground">Revenue Leakage Detection</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 opacity-50">Admissions Without Matching Authorization Records</p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-xl">
            <span className="text-xs font-black text-orange-400">{leakage.summary.count} Unmatched · Est. {formatCurrency(leakage.summary.totalEstimated)}</span>
          </div>
        </div>

        {leakage.items.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs font-mono uppercase tracking-widest border border-dashed border-border rounded-2xl">
            No leakage detected — all admissions have matching authorization records
          </div>
        ) : (
          <div className="border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-2/30 border-b border-border">
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Patient</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ADM Code</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Est. Value</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {leakage.items.slice(0, 15).map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-foreground">{item.patientName}</td>
                    <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{item.admNo}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-background border border-border">{item.ptype}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-warn font-mono">{formatCurrency(item.estimatedValue)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[10px] font-bold text-orange-400 uppercase">{item.leakCategory}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
