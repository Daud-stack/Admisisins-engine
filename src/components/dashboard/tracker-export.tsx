"use client"

import ExportButton from "@/components/dashboard/export-button"

interface TrackerExportProps {
  issues: any[]
}

export default function TrackerExport({ issues }: TrackerExportProps) {
  const exportData = issues.map((issue: any) => ({
    "Patient Name": issue.patientName,
    "ADM No": issue.admNo,
    "Category": issue.category,
    "Priority": issue.priority,
    "Status": issue.status,
    "Root Cause": issue.rootCause || "N/A",
    "Date Identified": new Date(issue.dateIdentified || issue.createdAt).toLocaleDateString(),
    "SLA Deadline": issue.deadline ? new Date(issue.deadline).toLocaleString() : "N/A",
    "Date Resolved": issue.dateResolved ? new Date(issue.dateResolved).toLocaleDateString() : "-",
    "Action Plans": issue.actionPlans?.length || 0,
  }))

  return (
    <ExportButton 
      data={exportData} 
      fileName="Incident_Report" 
      label="Export Incidents" 
    />
  )
}
