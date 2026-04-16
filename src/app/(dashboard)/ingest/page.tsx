"use client"

import { useState } from "react"
import * as XLSX from "xlsx"
import { ingestDataset, clearDataset } from "@/lib/actions/ingest"
import { 
  Upload, 
  FileSpreadsheet, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Database
} from "lucide-react"
import { cn } from "@/lib/utils"

const DATASETS = [
  { id: 'THROUGHPUT', name: 'HIS Throughput', description: 'Daily patient volumes and clerk assignments', color: 'text-blue-500' },
  { id: 'AUTH', name: 'Authorizations', description: 'Real-time billing and scheme status data', color: 'text-primary' },
  { id: 'CPT', name: 'CPT Analytics', description: 'Detailed procedure and billing intelligence', color: 'text-pink-500' },
]

export default function IngestPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [status, setStatus] = useState<Record<string, string>>({})

  const handleFileUpload = async (type: string, file: File) => {
    setLoading(type)
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
        
        // Ensure only plain objects are passed to Server Action (fixes serialization errors)
        const sanitizedJson = JSON.parse(JSON.stringify(json))
        
        const res = await ingestDataset(type, sanitizedJson, file.name)
        
        if (res.success) {
          setStatus(prev => ({ ...prev, [type]: `Successfully loaded ${res.count} records` }))
        } else {
          setStatus(prev => ({ ...prev, [type]: `Error: ${res.error}` }))
        }
      } catch (err) {
        setStatus(prev => ({ ...prev, [type]: "Critical parsing error" }))
      } finally {
        setLoading(null)
      }
    }
    
    reader.readAsArrayBuffer(file)
  }

  const handleClear = async (type: string) => {
    if (!confirm(`Clear all ${type} records?`)) return
    setLoading(type)
    await clearDataset(type)
    setStatus(prev => ({ ...prev, [type]: "Dataset cleared" }))
    setLoading(null)
  }

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dataset Command</h1>
        <p className="text-muted-foreground mt-1 font-mono uppercase text-[10px] tracking-widest">Global Ingestion · Multi-stream Uplink</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {DATASETS.map((ds) => (
          <div key={ds.id} className="bg-surface border border-border p-8 rounded-3xl flex flex-col space-y-6 relative overflow-hidden group">
            <div className={cn("absolute -right-4 -top-4 h-24 w-24 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity", ds.color)}>
              <Database className="h-full w-full" />
            </div>

            <div className="space-y-2 relative z-10">
              <h3 className="font-bold text-lg">{ds.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{ds.description}</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50 relative z-10">
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(ds.id, e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  disabled={!!loading}
                />
                <div className="bg-background border border-dashed border-border rounded-xl py-8 flex flex-col items-center justify-center gap-3 group-hover:border-primary/50 transition-all">
                  {loading === ds.id ? (
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  ) : (
                    <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Upload SpreadSheet</span>
                </div>
              </div>

              {status[ds.id] && (
                <div className={cn(
                  "p-3 rounded-lg flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight",
                  status[ds.id].startsWith("Error") ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                )}>
                  {status[ds.id].startsWith("Error") ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  {status[ds.id]}
                </div>
              )}

              <button
                onClick={() => handleClear(ds.id)}
                disabled={!!loading}
                className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-muted-foreground hover:text-danger transition-colors uppercase"
              >
                <Trash2 className="h-3 w-3" />
                Flush Storage
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 bg-surface-2/30 border border-border rounded-3xl">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 mt-1">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-sm">Processing Architecture</h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
              Our ingestion engine matches records across streams using polymorphic key identification (Episode No, ADM Code). 
              Ensure your source files maintain standard HIS export headings for maximum precision.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
