"use client"

import ExportButton from "@/components/dashboard/export-button"

interface AnalyticsExportProps {
  scorecards: any[]
}

export default function AnalyticsExport({ scorecards }: AnalyticsExportProps) {
  const exportData = scorecards.map((card: any) => ({
    "Clerk Name": card.clerkName,
    "Tracked (HIS)": card.trackedCount,
    "Audited (QA)": card.auditedCount,
    "Compliant": card.compliantCount,
    "Issues Found": card.issuesCount,
    "Audit Rate %": card.auditRate.toFixed(1),
    "Compliance Rate %": card.complianceRate.toFixed(1),
  }))

  return (
    <ExportButton 
      data={exportData} 
      fileName="Clerk_Scorecards" 
      label="Export Scorecards" 
    />
  )
}
