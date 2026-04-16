import { PrismaClient } from '@prisma/client'
import { getRootCauseSuggestion, calculateSLADeadline } from './src/lib/intelligence'

const prisma = new PrismaClient()

async function testSystem() {
  console.log("🚀 Starting Admissions QA Engine Verification...")

  // 1. Test Intelligence Logic
  console.log("\n--- [1] Intelligence Engine Logic ---")
  const failures = ["GOP", "MedAid"]
  const suggestion = getRootCauseSuggestion(failures)
  console.log("Failures:", failures)
  console.log("AI Suggestion:", suggestion)
  
  if (suggestion.includes("Front-Office Oversight")) {
    console.log("✅ Root-cause pattern detection: PASSED")
  } else {
    console.log("❌ Root-cause pattern detection: FAILED")
  }

  const deadline = calculateSLADeadline('HIGH')
  console.log("SLA Deadline (High):", deadline)
  if (deadline > new Date()) {
    console.log("✅ SLA calculation: PASSED")
  }

  // 2. Test DB Integrity
  console.log("\n--- [2] Database Model Integrity ---")
  try {
    const userCount = await prisma.user.count()
    console.log(`Users in DB: ${userCount}`)
    
    const dqcCount = await prisma.admissionCheck.count()
    console.log(`Audits in DB: ${dqcCount}`)
    
    const issueCount = await prisma.issue.count()
    console.log(`Issues in DB: ${issueCount}`)
    
    // Check new models
    await prisma.peerAudit.count()
    await prisma.actionPlan.count()
    await prisma.achievement.count()
    await prisma.systemLog.count()
    
    console.log("✅ Advanced Models (PeerAudit, CAPA, Achievements): FOUND")
  } catch (e) {
    console.error("❌ Database Integrity Check: FAILED", e)
  }

  // 3. Test Ingestion Logic Visibility
  console.log("\n--- [3] Analytics Stream ---")
  try {
    const logs = await prisma.systemLog.findMany({ take: 5 })
    console.log(`Recent System Events: ${logs.length}`)
    console.log("✅ System Logging: OPERATIONAL")
  } catch (e) {
    console.log("❌ Analytics Stream: INACTIVE")
  }

  console.log("\n--- Verification Complete ---")
}

testSystem()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
