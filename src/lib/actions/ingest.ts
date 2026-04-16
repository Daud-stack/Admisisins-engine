"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function ingestDataset(type: string, data: any[], fileName: string) {
  try {
    // In a real app we might want to clear or append. 
    // Here we'll append, but many users prefer to clear current month or similar.
    // For simplicity, we just add new records.
    
    const records = data.map(item => ({
      type,
      sourceFile: fileName,
      data: item,
      episodeNo: String(item.Episode || item['Episode No'] || item.AdmNo || item.Admission || "").trim()
    }))

    // Batch create
    await prisma.ingestedData.createMany({
      data: records
    })

    revalidatePath("/analytics")
    revalidatePath("/dashboard")
    
    return { success: true, count: records.length }
  } catch (error: any) {
    console.error("Ingest Error:", error)
    return { success: false, error: error.message }
  }
}

export async function clearDataset(type: string) {
  try {
    await prisma.ingestedData.deleteMany({
      where: { type }
    })
    revalidatePath("/analytics")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
