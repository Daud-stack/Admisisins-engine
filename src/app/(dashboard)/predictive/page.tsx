import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  Activity,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Target
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getAdmissionForecast, getErrorTrendForecast, getSLARiskMatrix } from "@/lib/actions/predictive-actions"
import ForecastChart from "@/components/dashboard/forecast-chart"
import SLARiskMatrix from "@/components/dashboard/sla-risk-matrix"

export default async function PredictivePage() {
  const [forecastRes, errorRes, slaRes] = await Promise.all([
    getAdmissionForecast(),
    getErrorTrendForecast(),
    getSLARiskMatrix()
  ])

  const forecast = forecastRes.data || []
  const errorTrend = errorRes.data || { predictedRate: 0, confidence: 0, trend: "stable", trendData: [], regression: { slope: 0, rSquared: 0, direction: "stable", intercept: 0, forecast: [] } }
  const slaRisk = slaRes.data || { items: [], summary: { criticalCount: 0, highCount: 0, total: 0, avgProbability: 0 } }

  const predictedErrorPct = (errorTrend.predictedRate * 100).toFixed(1)
  const rSquared = (errorTrend.regression?.rSquared * 100).toFixed(0)

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground drop-shadow-sm">Predictive Intelligence</h1>
          <p className="text-muted-foreground mt-2 font-mono uppercase text-[10px] tracking-[0.2em] opacity-60">
            Neural Forecasting Engine · Statistical Trend Analysis
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-border flex items-center gap-4 transition-all hover:border-primary/20">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Model Confidence</span>
            <div className="flex items-center gap-2 bg-primary/5 px-2 py-1 rounded-lg">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary font-mono uppercase tracking-tighter">R² {rSquared}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-border p-8 rounded-[2rem] relative overflow-hidden group hover:border-primary/40 transition-all duration-500">
          <div className="absolute -right-4 -top-4 h-20 w-20 opacity-[0.03] group-hover:opacity-[0.1] transition-all">
            <Activity className="h-full w-full text-primary" />
          </div>
          <div className="space-y-4">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary w-fit">
              <Activity className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">Predicted Error Rate</p>
            <h3 className="text-3xl font-black text-foreground tracking-tighter">{predictedErrorPct}%</h3>
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-black",
              errorTrend.trend === "falling" ? "text-success" : errorTrend.trend === "rising" ? "text-danger" : "text-muted-foreground"
            )}>
              {errorTrend.trend === "falling" ? <ArrowDownRight className="h-3 w-3" /> : errorTrend.trend === "rising" ? <ArrowUpRight className="h-3 w-3" /> : null}
              {errorTrend.trend.toUpperCase()} TREND
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border p-8 rounded-[2rem] relative overflow-hidden group hover:border-blue-500/40 transition-all duration-500">
          <div className="absolute -right-4 -top-4 h-20 w-20 opacity-[0.03] group-hover:opacity-[0.1] transition-all">
            <BrainCircuit className="h-full w-full text-blue-500" />
          </div>
          <div className="space-y-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 w-fit">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">Forecast Horizon</p>
            <h3 className="text-3xl font-black text-foreground tracking-tighter">7 Days</h3>
            <p className="text-[10px] font-bold text-blue-400">Holt Method · α=0.3</p>
          </div>
        </div>

        <div className="bg-surface border border-border p-8 rounded-[2rem] relative overflow-hidden group hover:border-warn/40 transition-all duration-500">
          <div className="absolute -right-4 -top-4 h-20 w-20 opacity-[0.03] group-hover:opacity-[0.1] transition-all">
            <AlertTriangle className="h-full w-full text-warn" />
          </div>
          <div className="space-y-4">
            <div className="p-2.5 rounded-xl bg-warn/10 border border-warn/20 text-warn w-fit">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">SLA Critical</p>
            <h3 className="text-3xl font-black text-foreground tracking-tighter">{slaRisk.summary.criticalCount}</h3>
            <p className="text-[10px] font-bold text-warn">Imminent Breach</p>
          </div>
        </div>

        <div className="bg-surface border border-border p-8 rounded-[2rem] relative overflow-hidden group hover:border-danger/40 transition-all duration-500">
          <div className="absolute -right-4 -top-4 h-20 w-20 opacity-[0.03] group-hover:opacity-[0.1] transition-all">
            <Gauge className="h-full w-full text-danger" />
          </div>
          <div className="space-y-4">
            <div className="p-2.5 rounded-xl bg-danger/10 border border-danger/20 text-danger w-fit">
              <Gauge className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">Avg Breach Risk</p>
            <h3 className="text-3xl font-black text-foreground tracking-tighter">{(slaRisk.summary.avgProbability * 100).toFixed(0)}%</h3>
            <p className="text-[10px] font-bold text-muted-foreground">Across {slaRisk.summary.total} issues</p>
          </div>
        </div>
      </div>

      {/* Volume Forecast Chart */}
      <div className="bg-surface border border-border p-10 rounded-[2.5rem] shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-black text-xl tracking-tight text-foreground">Volume Forecast</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 opacity-50">7-Day Admission Volume Prediction with 95% Confidence Interval</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-6 bg-primary rounded" />
              <span className="text-[10px] text-muted-foreground font-bold">Historical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-6 bg-blue-500 rounded" style={{ background: 'repeating-linear-gradient(90deg, #3b82f6 0, #3b82f6 4px, transparent 4px, transparent 8px)' }} />
              <span className="text-[10px] text-muted-foreground font-bold">Forecast</span>
            </div>
          </div>
        </div>
        <div className="h-[350px]">
          {forecast.length > 0 ? (
            <ForecastChart data={forecast} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-mono uppercase tracking-widest">
              Insufficient data for forecast — requires 3+ days of throughput
            </div>
          )}
        </div>
      </div>

      {/* SLA Risk Matrix */}
      <div className="bg-surface border border-border p-10 rounded-[2.5rem] shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-black text-xl tracking-tight text-foreground">SLA Breach Risk Matrix</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 opacity-50">Sigmoid Probability Model · Priority-Weighted</p>
          </div>
          <div className="p-2 rounded-xl bg-danger/10 border border-danger/20">
            <Target className="h-5 w-5 text-danger" />
          </div>
        </div>
        <SLARiskMatrix items={slaRisk.items} summary={slaRisk.summary} />
      </div>

      {/* Trend Analysis */}
      <div className="bg-surface border border-border p-10 rounded-[2.5rem] shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-black text-xl tracking-tight text-foreground">Statistical Trend Analysis</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 opacity-50">Linear Regression · Least Squares Fit</p>
          </div>
          <TrendingUp className="h-5 w-5 text-primary opacity-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-background rounded-2xl border border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Slope (β₁)</p>
            <p className="text-2xl font-black text-foreground mt-2 font-mono">{errorTrend.regression?.slope?.toFixed(3) || "0.000"}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Errors per day change</p>
          </div>
          <div className="p-6 bg-background rounded-2xl border border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">R² (Fit Quality)</p>
            <p className="text-2xl font-black text-foreground mt-2 font-mono">{rSquared}%</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {Number(rSquared) > 70 ? "Strong model fit" : Number(rSquared) > 40 ? "Moderate model fit" : "Weak — more data needed"}
            </p>
          </div>
          <div className="p-6 bg-background rounded-2xl border border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Direction</p>
            <p className={cn(
              "text-2xl font-black mt-2 uppercase tracking-tight",
              errorTrend.regression?.direction === "falling" ? "text-success" :
              errorTrend.regression?.direction === "rising" ? "text-danger" : "text-muted-foreground"
            )}>
              {errorTrend.regression?.direction || "Stable"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">Error trend trajectory</p>
          </div>
        </div>
      </div>
    </div>
  )
}
