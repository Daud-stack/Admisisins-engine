/**
 * Admissions QA Intelligence Engine
 * Provides statistical anomaly detection and automated root-cause insights.
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
