"use client"

import { useMemo } from "react"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"
import { cn } from "@/lib/utils"

interface OperationalChartsProps {
  heatmapData: Record<string, number>
  correlationData: any[]
}

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const SHIFTS = ["MORNING", "AFTERNOON", "NIGHT"]

export default function OperationalCharts({ heatmapData, correlationData }: OperationalChartsProps) {
  
  const maxErrors = useMemo(() => Math.max(...Object.values(heatmapData), 1), [heatmapData])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-700">
      {/* Shift Heatmap */}
      <div className="bg-surface border border-border p-8 rounded-3xl flex flex-col h-[400px]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-bold text-lg">Shift Risk Heatmap</h3>
            <p className="text-[10px] text-muted-foreground uppercase font-mono">Error Density by Day/Shift</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">LOW</span>
            <div className="w-24 h-2 bg-gradient-to-r from-success/20 to-danger rounded-full" />
            <span className="text-[10px] text-muted-foreground">HIGH</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-8 gap-2">
          <div className="col-span-1 flex flex-col gap-2 pt-8">
            {SHIFTS.map(s => (
              <div key={s} className="h-full flex items-center text-[9px] font-bold text-muted-foreground uppercase truncate pr-2">
                {s}
              </div>
            ))}
          </div>
          
          <div className="col-span-1 grid grid-cols-7 gap-2 flex-1 col-start-2 col-end-9">
             {DAYS.map((day, dIdx) => (
              <div key={day} className="space-y-2">
                <div className="text-[9px] font-bold text-center text-muted-foreground pb-2">{day}</div>
                {SHIFTS.map(shift => {
                  const val = heatmapData[`${dIdx}-${shift}`] || 0
                  const opacity = val / maxErrors
                  return (
                    <div 
                      key={shift}
                      style={{ backgroundColor: val > 0 ? `rgba(239, 68, 68, ${0.1 + opacity * 0.9})` : 'rgba(255,255,255,0.03)' }}
                      className={cn(
                        "h-20 rounded-lg border border-white/5 transition-all hover:border-white/20 relative group",
                        val > 0 ? "border-danger/30" : ""
                      )}
                    >
                      {val > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-1 rounded">
                             {val} Problems
                           </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
             ))}
          </div>
        </div>
      </div>

      {/* Volume Correlation */}
      <div className="bg-surface border border-border p-8 rounded-3xl flex flex-col h-[400px]">
        <div className="mb-8">
          <h3 className="font-bold text-lg">Volume Threshold Analysis</h3>
          <p className="text-[10px] text-muted-foreground uppercase font-mono">Admissions Vol vs Error Rate</p>
        </div>
        
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={correlationData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="date" 
                tick={{fontSize: 9, fill: '#6b7280'}} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
              />
              <YAxis 
                tick={{fontSize: 9, fill: '#6b7280'}} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
                name="Total Admissions"
              />
              <Area 
                type="monotone" 
                dataKey="errors" 
                stroke="#ef4444" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorErrors)" 
                name="Clinical Failures"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
