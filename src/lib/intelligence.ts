/**
 * Admissions QA Intelligence Engine
 * Provides statistical anomaly detection, predictive forecasting,
 * process drift detection, and automated root-cause insights.
 */

export interface AIInsight {
  id: string
  type: 'anomaly' | 'trend' | 'suggestion'
  severity: 'low' | 'medium' | 'high'
  title: string
  description: string
  metric?: string
  value?: string | number
}

/**
 * Detects statistical outliers in audit frequencies using the Z-Score method.
 */
export function detectAuditAnomalies(data: number[], labels: string[]): AIInsight[] {
  if (data.length < 5) return []

  const n = data.length
  const mean = data.reduce((a, b) => a + b, 0) / n
  const std = Math.sqrt(data.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n) || 1

  const insights: AIInsight[] = []

  data.forEach((val, i) => {
    const z = (val - mean) / std
    if (Math.abs(z) > 2.0) {
      insights.push({
        id: `anomaly-audit-${i}`,
        type: 'anomaly',
        severity: Math.abs(z) > 3.0 ? 'high' : 'medium',
        title: `Audit Volume Surge`,
        description: `Shift ${labels[i]} shows a statistical outlier in audit volume (Z-score: ${z.toFixed(2)}).`,
        metric: 'Audit Count',
        value: val
      })
    }
  })

  return insights
}

/**
 * Provides automated root-cause suggestions based on audit failure patterns.
 */
export function getRootCauseSuggestion(failures: string[]): string {
  if (failures.length === 0) return "N/A - Fully Compliant"

  const fSet = new Set(failures.map(f => f.toLowerCase()))

  // Pattern 1: Missing GOP + Missing MedAid
  if (fSet.has('gop') && fSet.has('medaid')) {
    return "Potential Front-Office Oversight: Patient admitted before medical aid authorization or GOP was secured."
  }

  // Pattern 2: Missing Biometric + Missing Prenote
  if (fSet.has('bio') && fSet.has('prenote')) {
    return "Check-in Protocol Violation: Biometric verification and pre-notification skipped at source."
  }

  // Pattern 3: Missing Diagnosis
  if (fSet.has('diag')) {
    return "Clinical Documentation Gap: ICD-10 or clinical diagnosis missing from HIS record."
  }

  return "Incomplete data entry during shift. Follow-up required for missing components: " + failures.join(", ")
}

/**
 * Calculates current SLA deadline based on priority.
 */
export function calculateSLADeadline(priority: string): Date {
  const now = new Date()
  switch (priority.toUpperCase()) {
    case 'CRITICAL':
      return new Date(now.getTime() + 4 * 60 * 60 * 1000) // 4 hours
    case 'HIGH':
      return new Date(now.getTime() + 12 * 60 * 60 * 1000) // 12 hours
    case 'MEDIUM':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours
    case 'LOW':
      return new Date(now.getTime() + 72 * 60 * 60 * 1000) // 72 hours
    default:
      return new Date(now.getTime() + 48 * 60 * 60 * 1000) // 48 hours
  }
}

/**
 * Forecasts future audit volumes using simple linear regression.
 * Returns predicted values for the next `horizon` days.
 */
export function forecastTrend(
  data: number[],
  horizon: number = 7
): { predictions: number[]; slope: number; direction: 'rising' | 'falling' | 'stable' } {
  if (data.length < 3) {
    return { predictions: [], slope: 0, direction: 'stable' }
  }

  const n = data.length
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0

  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += data[i]
    sumXY += i * data[i]
    sumX2 += i * i
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const predictions: number[] = []
  for (let i = 0; i < horizon; i++) {
    const predicted = Math.max(0, Math.round(slope * (n + i) + intercept))
    predictions.push(predicted)
  }

  const direction = slope > 0.5 ? 'rising' : slope < -0.5 ? 'falling' : 'stable'

  return { predictions, slope, direction }
}

/**
 * Detects process drift by comparing current-window distribution
 * against a historical baseline using the Coefficient of Variation (CV).
 */
export function detectDriftPattern(
  current: number[],
  baseline: number[]
): AIInsight | null {
  if (current.length < 3 || baseline.length < 3) return null

  const calcCV = (arr: number[]) => {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length
    if (mean === 0) return 0
    const std = Math.sqrt(arr.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / arr.length)
    return std / mean
  }

  const currentCV = calcCV(current)
  const baselineCV = calcCV(baseline)
  const currentMean = current.reduce((a, b) => a + b, 0) / current.length
  const baselineMean = baseline.reduce((a, b) => a + b, 0) / baseline.length

  // Drift detection: significant change in CV or mean shift > 30%
  const cvDrift = Math.abs(currentCV - baselineCV) > 0.3
  const meanShift = baselineMean > 0 ? Math.abs(currentMean - baselineMean) / baselineMean : 0
  const hasMeanDrift = meanShift > 0.3

  if (!cvDrift && !hasMeanDrift) return null

  const severity = (cvDrift && hasMeanDrift) ? 'high' : 'medium'
  const shiftDirection = currentMean > baselineMean ? 'increase' : 'decrease'
  const shiftPct = (meanShift * 100).toFixed(0)

  return {
    id: 'drift-process',
    type: 'trend',
    severity,
    title: 'Process Drift Detected',
    description: `Current week shows a ${shiftPct}% ${shiftDirection} in volume vs. baseline. ${
      cvDrift ? 'Variability pattern has also shifted significantly.' : 'Consistency is within bounds but volume has shifted.'
    }`,
    metric: 'Volume Drift',
    value: `${shiftPct}% ${shiftDirection}`
  }
}
