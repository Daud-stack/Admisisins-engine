/**
 * Predictive Intelligence Engine
 * Client-side statistical forecasting with no external ML dependencies.
 * Uses exponential smoothing, linear regression, and moving averages.
 */

export interface ForecastPoint {
  date: string
  actual?: number
  forecast: number
  upper: number  // Upper confidence band
  lower: number  // Lower confidence band
}

export interface TrendResult {
  slope: number
  intercept: number
  rSquared: number
  direction: "rising" | "falling" | "stable"
  forecast: number[]
}

export interface SLARiskItem {
  issueId: string
  patientName: string
  admNo: string
  category: string
  priority: string
  hoursRemaining: number
  breachProbability: number  // 0-1
  riskLevel: "low" | "medium" | "high" | "critical"
}

/**
 * Simple Moving Average
 */
export function movingAverage(data: number[], window: number): number[] {
  if (data.length < window) return data
  
  const result: number[] = []
  for (let i = 0; i <= data.length - window; i++) {
    const slice = data.slice(i, i + window)
    result.push(slice.reduce((a, b) => a + b, 0) / window)
  }
  return result
}

/**
 * Exponential Smoothing (Single — Holt-Winters Level)
 * Good for data without strong trend or seasonality.
 * alpha: smoothing factor (0.0 – 1.0). Higher = more weight on recent.
 */
export function exponentialSmoothing(data: number[], alpha: number = 0.3): number[] {
  if (data.length === 0) return []
  
  const smoothed: number[] = [data[0]]
  for (let i = 1; i < data.length; i++) {
    smoothed.push(alpha * data[i] + (1 - alpha) * smoothed[i - 1])
  }
  return smoothed
}

/**
 * Double Exponential Smoothing (Holt's method)
 * Handles data with trend.
 */
export function doubleExponentialSmoothing(
  data: number[], 
  alpha: number = 0.3, 
  beta: number = 0.1, 
  horizon: number = 7
): number[] {
  if (data.length < 2) return Array(horizon).fill(data[0] || 0)
  
  let level = data[0]
  let trend = data[1] - data[0]
  
  const smoothed: number[] = [level]
  
  for (let i = 1; i < data.length; i++) {
    const prevLevel = level
    level = alpha * data[i] + (1 - alpha) * (prevLevel + trend)
    trend = beta * (level - prevLevel) + (1 - beta) * trend
    smoothed.push(level)
  }
  
  // Forecast future values
  const forecast: number[] = []
  for (let h = 1; h <= horizon; h++) {
    forecast.push(Math.max(0, level + h * trend))
  }
  
  return forecast
}

/**
 * Linear Regression (Least Squares)
 * Returns slope, intercept, R², and optional forecast.
 */
export function linearRegression(data: number[], forecastHorizon: number = 7): TrendResult {
  const n = data.length
  if (n < 2) {
    return { slope: 0, intercept: data[0] || 0, rSquared: 0, direction: "stable", forecast: Array(forecastHorizon).fill(data[0] || 0) }
  }
  
  // x = 0, 1, 2, ... n-1
  const sumX = (n * (n - 1)) / 2
  const sumY = data.reduce((a, b) => a + b, 0)
  const sumXY = data.reduce((sum, y, x) => sum + x * y, 0)
  const sumX2 = data.reduce((sum, _, x) => sum + x * x, 0)
  
  const meanX = sumX / n
  const meanY = sumY / n
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0
  const intercept = meanY - slope * meanX
  
  // R² (coefficient of determination)
  const ssRes = data.reduce((sum, y, x) => {
    const predicted = intercept + slope * x
    return sum + Math.pow(y - predicted, 2)
  }, 0)
  const ssTot = data.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0)
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0
  
  // Direction
  const direction = Math.abs(slope) < 0.5 ? "stable" : slope > 0 ? "rising" : "falling"
  
  // Forecast
  const forecast: number[] = []
  for (let h = 0; h < forecastHorizon; h++) {
    forecast.push(Math.max(0, intercept + slope * (n + h)))
  }
  
  return { slope, intercept, rSquared, direction, forecast }
}

/**
 * Forecast admission volume with confidence bands.
 */
export function forecastAdmissionVolume(
  historicalData: { date: string; count: number }[],
  horizon: number = 7
): ForecastPoint[] {
  if (historicalData.length < 3) return []
  
  const counts = historicalData.map(d => d.count)
  
  // Use double exponential smoothing for forecast
  const forecastValues = doubleExponentialSmoothing(counts, 0.3, 0.1, horizon)
  
  // Calculate standard deviation from smoothed residuals
  const smoothed = exponentialSmoothing(counts, 0.3)
  const residuals = counts.map((v, i) => v - smoothed[i])
  const stdDev = Math.sqrt(
    residuals.reduce((sum, r) => sum + r * r, 0) / residuals.length
  ) || 1
  
  // Build result — historical + forecast
  const result: ForecastPoint[] = []
  
  // Historical points
  historicalData.forEach(d => {
    result.push({
      date: d.date,
      actual: d.count,
      forecast: d.count,
      upper: d.count,
      lower: d.count,
    })
  })
  
  // Forecast points
  const lastDate = new Date(historicalData[historicalData.length - 1].date)
  forecastValues.forEach((val, i) => {
    const futureDate = new Date(lastDate)
    futureDate.setDate(futureDate.getDate() + i + 1)
    
    // Confidence widens with horizon
    const confidence = stdDev * 1.96 * Math.sqrt(i + 1)
    
    result.push({
      date: futureDate.toISOString().split('T')[0],
      forecast: Math.round(val),
      upper: Math.round(val + confidence),
      lower: Math.max(0, Math.round(val - confidence)),
    })
  })
  
  return result
}

/**
 * Predict error rate for the next shift based on historical patterns.
 */
export function predictErrorRate(
  historicalErrors: number[],
  historicalVolume: number[]
): { predictedRate: number; confidence: number; trend: string } {
  if (historicalErrors.length < 3 || historicalVolume.length < 3) {
    return { predictedRate: 0, confidence: 0, trend: "insufficient data" }
  }
  
  // Calculate historical error rates
  const rates = historicalErrors.map((e, i) => 
    historicalVolume[i] > 0 ? e / historicalVolume[i] : 0
  )
  
  // Use exponential smoothing on rates
  const smoothed = exponentialSmoothing(rates, 0.4)
  const predictedRate = smoothed[smoothed.length - 1]
  
  // Trend from linear regression
  const trend = linearRegression(rates, 1)
  
  return {
    predictedRate: Math.max(0, Math.min(1, predictedRate)),
    confidence: trend.rSquared,
    trend: trend.direction
  }
}

/**
 * Calculate SLA breach probability for each open issue.
 */
export function predictSLABreachRisk(
  openIssues: Array<{
    id: string
    patientName: string
    admNo: string
    category: string
    priority: string
    deadline: string | Date | null
    createdAt: string | Date
  }>
): SLARiskItem[] {
  const now = new Date()
  
  return openIssues.map(issue => {
    const deadline = issue.deadline ? new Date(issue.deadline) : null
    const created = new Date(issue.createdAt)
    
    let hoursRemaining = 0
    let breachProbability = 0.5  // Default for no deadline
    
    if (deadline) {
      hoursRemaining = Math.max(0, (deadline.getTime() - now.getTime()) / (1000 * 60 * 60))
      const totalHours = (deadline.getTime() - created.getTime()) / (1000 * 60 * 60)
      const elapsed = totalHours - hoursRemaining
      const elapsedRatio = totalHours > 0 ? elapsed / totalHours : 1
      
      // Sigmoid-like probability: rises sharply as deadline approaches
      // P(breach) = 1 / (1 + exp(-k*(x - 0.7)))  where x = elapsed ratio
      const k = 10
      breachProbability = 1 / (1 + Math.exp(-k * (elapsedRatio - 0.7)))
      
      // Already breached
      if (hoursRemaining <= 0) breachProbability = 1.0
    }
    
    // Priority multiplier
    const priorityMultiplier: Record<string, number> = {
      'Critical': 1.3,
      'High': 1.15,
      'Medium': 1.0,
      'Low': 0.8
    }
    breachProbability = Math.min(1, breachProbability * (priorityMultiplier[issue.priority] || 1))
    
    // Risk level
    let riskLevel: SLARiskItem["riskLevel"] = "low"
    if (breachProbability > 0.9) riskLevel = "critical"
    else if (breachProbability > 0.7) riskLevel = "high"
    else if (breachProbability > 0.4) riskLevel = "medium"
    
    return {
      issueId: issue.id,
      patientName: issue.patientName,
      admNo: issue.admNo,
      category: issue.category,
      priority: issue.priority,
      hoursRemaining: Math.round(hoursRemaining * 10) / 10,
      breachProbability: Math.round(breachProbability * 1000) / 1000,
      riskLevel
    }
  }).sort((a, b) => b.breachProbability - a.breachProbability)
}
