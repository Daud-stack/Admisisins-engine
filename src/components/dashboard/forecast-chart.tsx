"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts"

interface ForecastPoint {
  date: string
  actual?: number
  forecast: number
  upper: number
  lower: number
}

interface ForecastChartProps {
  data: ForecastPoint[]
}

export default function ForecastChart({ data }: ForecastChartProps) {
  // Find the boundary between historical and forecast
  const boundaryIndex = data.findIndex(d => d.actual === undefined)
  const boundaryDate = boundaryIndex > 0 ? data[boundaryIndex].date : null

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00c9a7" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#00c9a7" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.08} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => {
              const d = new Date(val)
              return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
            }}
          />
          <YAxis
            tick={{ fontSize: 9, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              fontSize: '11px'
            }}
            formatter={(value: any, name: any) => {
              const labels: Record<string, string> = {
                actual: "Actual",
                forecast: "Forecast",
                upper: "Upper CI",
                lower: "Lower CI"
              }
              return [value, labels[name] || name]
            }}
            labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          />
          {boundaryDate && (
            <ReferenceLine
              x={boundaryDate}
              stroke="#3b82f6"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{ value: "Forecast →", position: "top", fontSize: 9, fill: "#3b82f6" }}
            />
          )}
          {/* Confidence Band */}
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fillOpacity={1}
            fill="url(#colorBand)"
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fillOpacity={0}
            fill="transparent"
          />
          {/* Historical */}
          <Area
            type="monotone"
            dataKey="actual"
            stroke="#00c9a7"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorActual)"
            name="actual"
            connectNulls={false}
          />
          {/* Forecast */}
          <Area
            type="monotone"
            dataKey="forecast"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="6 3"
            fillOpacity={1}
            fill="url(#colorForecast)"
            name="forecast"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
