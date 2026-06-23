"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * Compute a simple hash from stringified JSON data.
 * Uses a fast FNV-1a inspired hash — sufficient for deduplication.
 */
function computeHash(data: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < data.length; i++) {
    hash ^= data.charCodeAt(i)
    hash = (hash * 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

export async function ingestDataset(type: string, data: any[], fileName: string) {
  try {
    const session = await getServerSession(authOptions)

    // 1. Compute file hash from content for deduplication
    const contentString = JSON.stringify(data)
    const fileHash = `${type}-${computeHash(contentString)}-${data.length}`

    // 2. Check if this exact file was already ingested
    const existingFile = await prisma.fileIngestion.findUnique({
      where: { fileHash }
    })

    if (existingFile) {
      return {
        success: false,
        error: `Duplicate detected: "${existingFile.fileName}" was already uploaded on ${existingFile.uploadedAt.toLocaleDateString()}. ${existingFile.recordCount} records already loaded.`,
        duplicate: true
      }
    }

    // 3. If same source file name exists, clear old records from that file (snapshot merge)
    const previousUpload = await prisma.fileIngestion.findFirst({
      where: { fileName, type }
    })

    if (previousUpload) {
      // Remove old records from this specific file before re-inserting
      await prisma.ingestedData.deleteMany({
        where: { sourceFile: fileName, type }
      })
      // Remove old file ingestion record
      await prisma.fileIngestion.delete({
        where: { id: previousUpload.id }
      })
    }

    // 4. Prepare records
    const records = data.map(item => ({
      type,
      sourceFile: fileName,
      data: item,
      episodeNo: String(item.Episode || item['Episode No'] || item.AdmNo || item.Admission || "").trim()
    }))

    // 5. Batch create
    await prisma.ingestedData.createMany({
      data: records
    })

    // 6. Record file ingestion for dedup tracking
    await prisma.fileIngestion.create({
      data: {
        fileName,
        fileHash,
        type,
        recordCount: records.length,
        uploadedBy: session?.user?.name || null
      }
    })

    // 7. Log the event
    await prisma.systemLog.create({
      data: {
        event: "DATA_INGESTED",
        userId: (session?.user as any)?.id || null,
        data: { type, fileName, recordCount: records.length }
      }
    })

    revalidatePath("/analytics")
    revalidatePath("/dashboard")
    revalidatePath("/management")
    revalidatePath("/financial")

    return { success: true, count: records.length }
  } catch (error: any) {
    console.error("Ingest Error:", error)
    return { success: false, error: error.message }
  }
}

export async function clearDataset(type: string) {
  try {
    const session = await getServerSession(authOptions)
    const userRole = (session?.user as any)?.role
    if (!session || !["SUPERVISOR", "ADMIN"].includes(userRole)) {
      return { success: false, error: 'Unauthorized' }
    }

    await prisma.$transaction(async (tx) => {
      await tx.ingestedData.deleteMany({ where: { type } })
      await tx.fileIngestion.deleteMany({ where: { type } })
    })

    revalidatePath("/analytics")
    revalidatePath("/financial")
    revalidatePath("/management")
    return { success: true }
  } catch (error: any) {
    console.error("Clear Dataset Error:", error)
    return { success: false, error: 'An internal error occurred' }
  }
}
