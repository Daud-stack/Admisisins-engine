"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts"

interface SchemeMetrics {
  scheme: string
  episodeCount: number
  totalBilled: number
  totalPaid: number
  totalOutstanding: number
  paymentRate: number
  riskIndex: number
}

interface SchemeProfitabilityChartProps {
  data: SchemeMetrics[]
}

const COLORS = ['#00c9a7', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316']

export default function SchemeProfitabilityChart({ data }: SchemeProfitabilityChartProps) {
  const chartData = data.slice(0, 8).map(s => ({
    ...s,
    name: s.scheme.length > 15 ? s.scheme.substring(0, 15) + '...' : s.scheme,
    billedK: Math.round(s.totalBilled / 1000),
    paidK: Math.round(s.totalPaid / 1000),
    outstandingK: Math.round(s.totalOutstanding / 1000)
  }))

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis
            type="number"
            tick={{ fontSize: 9, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => `$${val}k`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            width={120}
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
                billedK: 'Billed',
                paidK: 'Collected',
                outstandingK: 'Outstanding'
              }
              return [`$${value}k`, labels[name] || name]
            }}
          />
          <Bar dataKey="billedK" name="billedK" radius={[0, 4, 4, 0]} barSize={12}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.6} />
            ))}
          </Bar>
          <Bar dataKey="paidK" name="paidK" fill="#22c55e" fillOpacity={0.4} radius={[0, 4, 4, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
