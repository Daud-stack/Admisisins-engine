/**
 * Financial Intelligence Engine
 * Treasury-level analytics for revenue protection, bad debt risk,
 * scheme profitability, and cash flow forecasting.
 */

export interface BadDebtRiskItem {
  episodeNo: string
  patientName: string
  scheme: string
  amount: number
  status: string
  agingDays: number
  riskScore: number  // 0-100
  riskLevel: "low" | "medium" | "high" | "critical"
}

export interface SchemeMetrics {
  scheme: string
  episodeCount: number
  totalBilled: number
  totalPaid: number
  totalOutstanding: number
  avgClaimValue: number
  paymentRate: number  // % paid vs billed
  riskIndex: number    // 0-100
}

export interface CashFlowPoint {
  date: string
  projected: number
  collected: number
  cumulative: number
}

export interface RevenueLeakItem {
  admNo: string
  patientName: string
  ptype: string
  admissionDate: string
  hasAuth: boolean
  estimatedValue: number
  leakCategory: string
}

/**
 * Calculate bad debt risk score for each episode.
 * Factors: auth status, aging, amount, scheme history.
 */
export function calculateBadDebtRisk(
  authRecords: Array<{ data: any; loadedAt: Date | string }>
): BadDebtRiskItem[] {
  const now = new Date()
  
  return authRecords.map(record => {
    const data = record.data as any
    const amount = parseFloat(String(data.Amount || data.Total || 0).replace(/[$,]/g, ''))
    const status = String(data.Status || "").toUpperCase()
    const scheme = String(data.Scheme || data['Medical Aid'] || data.Funder || "Unknown")
    const patientName = String(data.Patient || data['Patient Name'] || "Unknown")
    const episodeNo = String(data.Episode || data['Episode No'] || data.AdmNo || "N/A")
    const loadedDate = new Date(record.loadedAt)
    const agingDays = Math.floor((now.getTime() - loadedDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Risk scoring algorithm
    let riskScore = 0
    
    // Status factor (0-40 points)
    if (status.includes("REJECTED") || status.includes("DECLINED")) riskScore += 40
    else if (status.includes("PENDING") || status.includes("TBA")) riskScore += 25
    else if (status.includes("PARTIAL")) riskScore += 15
    else if (status.includes("APPROVED") || status.includes("PAID") || status.includes("INBENEFIT") || status.includes("IN BENEFIT") || status.includes("IN-BENEFIT")) riskScore += 0
    else riskScore += 20  // Unknown status
    
    // Aging factor (0-30 points)
    if (agingDays > 90) riskScore += 30
    else if (agingDays > 60) riskScore += 22
    else if (agingDays > 30) riskScore += 15
    else if (agingDays > 14) riskScore += 8
    
    // Amount factor (0-20 points) — higher amounts = higher risk impact
    if (amount > 50000) riskScore += 20
    else if (amount > 20000) riskScore += 15
    else if (amount > 10000) riskScore += 10
    else if (amount > 5000) riskScore += 5
    
    // Cash patient factor (0-10 points)
    if (scheme.toUpperCase().includes("CASH") || scheme.toUpperCase() === "SELF") riskScore += 10
    
    riskScore = Math.min(100, riskScore)
    
    let riskLevel: BadDebtRiskItem["riskLevel"] = "low"
    if (riskScore >= 75) riskLevel = "critical"
    else if (riskScore >= 50) riskLevel = "high"
    else if (riskScore >= 30) riskLevel = "medium"
    
    return {
      episodeNo,
      patientName,
      scheme,
      amount,
      status: data.Status || "Unknown",
      agingDays,
      riskScore,
      riskLevel
    }
  }).sort((a, b) => b.riskScore - a.riskScore)
}

/**
 * Group authorization data by medical aid scheme and calculate profitability metrics.
 */
export function getSchemeBreakdown(
  authRecords: Array<{ data: any }>
): SchemeMetrics[] {
  const schemeMap: Record<string, {
    episodes: Set<string>
    totalBilled: number
    totalPaid: number
    totalOutstanding: number
    riskScores: number[]
  }> = {}
  
  authRecords.forEach(record => {
    const data = record.data as any
    const scheme = String(data.Scheme || data['Medical Aid'] || data.Funder || "Other")
    const billed = parseFloat(String(data.Amount || data.Total || data.Billed || 0).replace(/[$,]/g, ''))
    const paid = parseFloat(String(data.Paid || data.Collected || 0).replace(/[$,]/g, ''))
    const status = String(data.Status || "").toUpperCase()
    const episode = String(data.Episode || data['Episode No'] || Math.random())
    
    if (!schemeMap[scheme]) {
      schemeMap[scheme] = { episodes: new Set(), totalBilled: 0, totalPaid: 0, totalOutstanding: 0, riskScores: [] }
    }
    
    schemeMap[scheme].episodes.add(episode)
    schemeMap[scheme].totalBilled += billed
    schemeMap[scheme].totalPaid += paid
    schemeMap[scheme].totalOutstanding += Math.max(0, billed - paid)
    
    // Simple risk score per record
    let risk = 0
    if (status.includes("REJECTED")) risk = 90
    else if (status.includes("PENDING") || status.includes("TBA")) risk = 50
    else if (status.includes("PARTIAL")) risk = 30
    else if (status.includes("APPROVED") || status.includes("PAID") || status.includes("INBENEFIT") || status.includes("IN BENEFIT") || status.includes("IN-BENEFIT")) risk = 10
    else risk = 10
    schemeMap[scheme].riskScores.push(risk)
  })
  
  return Object.entries(schemeMap).map(([scheme, data]) => ({
    scheme,
    episodeCount: data.episodes.size,
    totalBilled: data.totalBilled,
    totalPaid: data.totalPaid,
    totalOutstanding: data.totalOutstanding,
    avgClaimValue: data.totalBilled / data.episodes.size || 0,
    paymentRate: data.totalBilled > 0 ? (data.totalPaid / data.totalBilled) * 100 : 0,
    riskIndex: data.riskScores.length > 0
      ? Math.round(data.riskScores.reduce((a, b) => a + b, 0) / data.riskScores.length)
      : 0
  })).sort((a, b) => b.totalBilled - a.totalBilled)
}

/**
 * Project 30-day cash flow based on historical collection patterns.
 */
export function getCashFlowForecast(
  dailyCollections: { date: string; amount: number }[],
  horizon: number = 30
): CashFlowPoint[] {
  if (dailyCollections.length === 0) return []
  
  const amounts = dailyCollections.map(d => d.amount)
  const avgDaily = amounts.reduce((a, b) => a + b, 0) / amounts.length
  
  // Simple trend from last 7 days vs previous 7
  const recent = amounts.slice(-7)
  const prior = amounts.slice(-14, -7)
  const recentAvg = recent.length > 0 ? recent.reduce((a, b) => a + b, 0) / recent.length : avgDaily
  const priorAvg = prior.length > 0 ? prior.reduce((a, b) => a + b, 0) / prior.length : avgDaily
  const growthRate = priorAvg > 0 ? (recentAvg - priorAvg) / priorAvg : 0
  
  const result: CashFlowPoint[] = []
  let cumulative = 0
  
  // Historical
  dailyCollections.forEach(d => {
    cumulative += d.amount
    result.push({
      date: d.date,
      projected: d.amount,
      collected: d.amount,
      cumulative
    })
  })
  
  // Forecast
  const lastDate = new Date(dailyCollections[dailyCollections.length - 1].date)
  for (let i = 1; i <= horizon; i++) {
    const futureDate = new Date(lastDate)
    futureDate.setDate(futureDate.getDate() + i)
    const projected = Math.max(0, recentAvg * (1 + growthRate * (i / horizon)))
    cumulative += projected
    
    result.push({
      date: futureDate.toISOString().split('T')[0],
      projected: Math.round(projected),
      collected: 0,
      cumulative: Math.round(cumulative)
    })
  }
  
  return result
}
