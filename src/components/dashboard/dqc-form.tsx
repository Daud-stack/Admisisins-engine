"use client"

import { useState } from "react"
import { createDQCRecord } from "@/lib/actions/dqc"
import { useRouter } from "next/navigation"
import { 
  ClipboardCheck, 
  User, 
  Fingerprint, 
  CreditCard, 
  Stethoscope, 
  Receipt,
  Check,
  X,
  Minus,
  Loader2,
  AlertCircle,
  Sparkles,
  Lightbulb
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getRootCauseSuggestion } from "@/lib/intelligence"

const FIELD_OPTIONS = [
  { id: 'prenote', label: 'Prenote', icon: Fingerprint },
  { id: 'medaid', label: 'MedAid', icon: Stethoscope },
  { id: 'diag', label: 'Diag', icon: AlertCircle },
  { id: 'receipt', label: 'Receipt', icon: Receipt },
  { id: 'bio', label: 'Bio', icon: User },
  { id: 'gop', label: 'GOP', icon: CreditCard },
]

export default function DQCForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: 'MORNING',
    patientName: '',
    admNo: '',
    ptype: 'MEDICAL AID',
    prenote: 'Y',
    medaid: 'Y',
    diag: 'Y',
    receipt: 'Y',
    bio: 'Y',
    gop: 'Y',
    comment: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await createDQCRecord(formData)
    setLoading(false)

    if (res.success) {
      // Show success, maybe reset or redirect
      router.push("/dashboard")
      router.refresh()
    } else {
      alert("Error saving record: " + res.error)
    }
  }

  const getActiveFailures = () => {
    return FIELD_OPTIONS
      .filter(f => (formData as any)[f.id] === 'N')
      .map(f => f.label)
  }

  const rootCauseSuggestion = getRootCauseSuggestion(getActiveFailures())

  const toggleField = (field: string) => {
    const sequence = ['Y', 'N', 'NA']
    const current = (formData as any)[field]
    const next = sequence[(sequence.indexOf(current) + 1) % sequence.length]
    setFormData({ ...formData, [field]: next })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <ClipboardCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">New Admission Audit</h2>
            <p className="text-xs text-muted-foreground font-mono uppercase">System Entry Protocol</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Entry Date</label>
            <input 
              type="date" 
              required
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Station Shift</label>
            <select 
              value={formData.shift}
              onChange={e => setFormData({ ...formData, shift: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
            >
              <option value="MORNING">MORNING</option>
              <option value="AFTERNOON">AFTERNOON</option>
              <option value="NIGHT">NIGHT</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Patient Class</label>
            <select 
              value={formData.ptype}
              onChange={e => setFormData({ ...formData, ptype: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
            >
              <option value="MEDICAL AID">MEDICAL AID</option>
              <option value="CASH">CASH</option>
              <option value="GUARANTEED">GUARANTEED</option>
              <option value="INTERNATIONAL MEDICAL INSURANCE">INTERNATIONAL MEDICAL INSURANCE</option>
            </select>
          </div>
          <div className="space-y-2 lg:col-span-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Patient Primary Name</label>
            <input 
              required
              value={formData.patientName}
              onChange={e => setFormData({ ...formData, patientName: e.target.value.toUpperCase() })}
              placeholder="SURNAME, FIRSTNAME"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Admission Code (ADM)</label>
            <input 
              required
              value={formData.admNo}
              onChange={e => setFormData({ ...formData, admNo: e.target.value.toUpperCase() })}
              placeholder="AD-0000"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-mono focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Compliance Checklist · Toggle Status</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {FIELD_OPTIONS.map((field) => {
              const val = (formData as any)[field.id]
              return (
                <button
                  key={field.id}
                  type="button"
                  onClick={() => toggleField(field.id)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300",
                    val === 'Y' ? "bg-success/10 border-success/30 text-success" :
                    val === 'N' ? "bg-danger/10 border-danger/30 text-danger" :
                    "bg-muted/10 border-border text-muted-foreground"
                  )}
                >
                  <field.icon className="h-5 w-5" />
                  <span className="text-[10px] font-bold uppercase">{field.label}</span>
                  <div className="mt-1 h-6 w-12 rounded-full bg-black/20 flex items-center justify-center font-bold text-[10px]">
                    {val}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {getActiveFailures().length > 0 && (
          <div className="mb-8 p-6 bg-primary/5 border border-primary/20 rounded-2xl flex gap-4 animate-in zoom-in-95 duration-300">
            <div className="p-2 h-fit rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest">Intelligence Insight</h4>
              <p className="text-sm text-foreground/80 leading-relaxed italic">
                "{rootCauseSuggestion}"
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2 mb-8">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Station Observations / Comments</label>
          <textarea 
            rows={3}
            value={formData.comment}
            onChange={e => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Additional context if required..."
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-border/50">
          <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase font-mono">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-primary" /> Validating
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-success" /> Auto-Sync
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 py-3 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Commit Record"}
          </button>
        </div>
      </div>
    </form>
  )
}
