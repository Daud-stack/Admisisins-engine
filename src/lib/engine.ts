import prisma from "@/lib/prisma"

export async function buildClerkScorecards() {
  // 1. Fetch DQC Records
  const dqcRecords = await prisma.admissionCheck.findMany({
    include: { user: true }
  })

  // 2. Fetch Throughput Records
  const throughputData = await prisma.ingestedData.findMany({
    where: { type: 'THROUGHPUT' }
  })

  // 3. Group Throughput by Clerk (captured from HIS data)
  const throughputByClerk: Record<string, any[]> = {}
  throughputData.forEach(record => {
    const data = record.data as any
    const clerk = data['Captured By'] || data['User'] || 'UNKNOWN'
    if (!throughputByClerk[clerk]) throughputByClerk[clerk] = []
    throughputByClerk[clerk].push(data)
  })

  // 4. Map DQC Records by ADM No for joining
  const dqcMap: Record<string, any> = {}
  dqcRecords.forEach(record => {
    dqcMap[record.admNo.trim()] = record
  })

  // 5. Build Scorecards
  const scorecards = Object.entries(throughputByClerk).map(([clerkName, records]) => {
    const trackedCount = records.length
    let auditedCount = 0
    let compliantCount = 0
    
    records.forEach(record => {
      const episode = (record.Episode || record['Episode No'] || record.AdmNo || "").trim()
      const audit = dqcMap[episode]
      
      if (audit) {
        auditedCount++
        // Check if fully compliant (no Ns)
        const isNotCompliant = [
          audit.prenote, audit.medaid, audit.diag, 
          audit.receipt, audit.bio, audit.gop
        ].includes("N")
        
        if (!isNotCompliant) compliantCount++
      }
    })

    const auditRate = trackedCount > 0 ? (auditedCount / trackedCount) * 100 : 0
    const complianceRate = auditedCount > 0 ? (compliantCount / auditedCount) * 100 : 0
    const issuesCount = auditedCount - compliantCount

    return {
      clerkName,
      trackedCount,
      auditedCount,
      compliantCount,
      issuesCount,
      auditRate,
      complianceRate
    }
  })

  // Sort by tracked count descending
  return scorecards.sort((a,b) => b.trackedCount - a.trackedCount)
}

export async function getRevenueIntelligence() {
  const authData = await prisma.ingestedData.findMany({
    where: { type: 'AUTH' }
  })

  // Total Expected Revenue vs Pending Auth
  let totalAuthValue = 0
  let pendingAuthValue = 0
  let pendingCount = 0

  authData.forEach(record => {
    const data = record.data as any
    const amount = parseFloat(String(data.Amount || 0).replace(/[$,]/g, ''))
    const status = (data.Status || "").toUpperCase()

    totalAuthValue += amount
    if (status.includes("PENDING") || status.includes("TBA")) {
      pendingAuthValue += amount
      pendingCount++
    }
  })

  return {
    totalAuthValue,
    pendingAuthValue,
    pendingCount,
    atRiskPercentage: totalAuthValue > 0 ? (pendingAuthValue / totalAuthValue) * 100 : 0
  }
}
