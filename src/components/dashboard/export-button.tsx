"use client"

import { useState } from "react"
import { Download, Loader2, CheckCircle2 } from "lucide-react"
import { exportToExcel } from "@/lib/export"
import { cn } from "@/lib/utils"

interface ExportButtonProps {
  data: any[]
  fileName: string
  label?: string
  className?: string
}

export default function ExportButton({ data, fileName, label = "Export", className }: ExportButtonProps) {
  const [state, setState] = useState<'idle' | 'exporting' | 'done'>('idle')

  const handleExport = () => {
    if (data.length === 0) return
    setState('exporting')
    
    // Slight delay for animation
    setTimeout(() => {
      try {
        exportToExcel(data, fileName)
        setState('done')
        setTimeout(() => setState('idle'), 2000)
      } catch {
        setState('idle')
      }
    }, 400)
  }

  return (
    <button
      onClick={handleExport}
      disabled={state === 'exporting' || data.length === 0}
      className={cn(
        "flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all duration-300",
        state === 'done' 
          ? "bg-success/10 border-success/30 text-success" 
          : "bg-surface border-border text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5",
        data.length === 0 && "opacity-30 cursor-not-allowed",
        className
      )}
    >
      {state === 'exporting' ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : state === 'done' ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      {state === 'done' ? "Downloaded" : label}
    </button>
  )
}
