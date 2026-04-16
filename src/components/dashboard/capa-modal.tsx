"use client"

import { useState } from "react"
import { createActionPlan } from "@/lib/actions/capa"
import { 
  X, 
  ShieldCheck, 
  Target, 
  Zap, 
  Loader2,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CapaModalProps {
  issue: any
  onClose: () => void
}

export default function CapaModal({ issue, onClose }: CapaModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    description: "",
    type: "Corrective"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await createActionPlan(issue.id, formData.description, formData.type)
    setLoading(false)
    if (res.success) {
      onClose()
    } else {
      alert("Error saving: " + res.error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-surface border border-border w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-border flex items-center justify-between bg-white/2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Define Protocol Action Plan</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">Incident Root-Cause Mitigation · {issue.admNo}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="p-4 bg-danger/5 border border-danger/10 rounded-2xl flex gap-3">
            <AlertCircle className="h-4 w-4 text-danger mt-0.5" />
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-danger uppercase tracking-widest">Incident Context</p>
              <p className="text-sm text-foreground/80 leading-relaxed italic">
                "{issue.category} · {issue.rootCause || 'General failure pattern'}"
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Plan Category</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, type: 'Corrective' })}
                className={cn(
                  "p-4 rounded-2xl border transition-all flex flex-col items-center gap-2",
                  formData.type === 'Corrective' ? "bg-primary/10 border-primary/30 text-primary" : "bg-background border-border text-muted-foreground hover:border-border/80"
                )}
              >
                <Target className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase">Corrective</span>
              </button>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, type: 'Preventive' })}
                className={cn(
                  "p-4 rounded-2xl border transition-all flex flex-col items-center gap-2",
                  formData.type === 'Preventive' ? "bg-warn/10 border-warn/30 text-warn" : "bg-background border-border text-muted-foreground hover:border-border/80"
                )}
              >
                <Zap className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase">Preventive</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Proposed Strategy</label>
            <textarea 
              required
              rows={4}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="What specific actions will be taken to resolve this incident and prevent recurrence?"
              className="w-full bg-background border border-border rounded-2xl p-4 text-sm focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-[10px] font-bold uppercase text-muted-foreground hover:text-foreground transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-2xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Authorize Action Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
