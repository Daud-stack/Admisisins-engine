"use client"

import { useState } from "react"
import { submitPeerAudit } from "@/lib/actions/peer-review"
import { useRouter } from "next/navigation"
import { 
  CheckCircle2, 
  XCircle, 
  User, 
  Calendar, 
  Clock, 
  Check, 
  Loader2,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PeerReviewFormProps {
  check: any
}

export default function PeerReviewForm({ check }: PeerReviewFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("Validated")
  const [score, setScore] = useState(100)
  const [comments, setComments] = useState("")

  const handleSubmit = async () => {
    setLoading(true)
    const res = await submitPeerAudit(check.id, status, score, comments)
    setLoading(false)

    if (res.success) {
      router.refresh()
    } else {
      alert("Verification failed: " + res.error)
    }
  }

  const failures = [
    check.prenote === 'N' ? 'Prenote' : null,
    check.medaid === 'N' ? 'MedAid' : null,
    check.diag === 'N' ? 'Diag' : null,
    check.receipt === 'N' ? 'Receipt' : null,
    check.bio === 'N' ? 'Bio' : null,
    check.gop === 'N' ? 'GOP' : null,
  ].filter(Boolean)

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden animate-in slide-in-from-right-4 duration-500">
      <div className="p-6 border-b border-border bg-white/2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-surface-2 border border-border flex items-center justify-center font-bold text-xs uppercase">
            {check.user.name.substring(0, 2)}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{check.patientName}</p>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Audited By: {check.user.name} · {check.admNo}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">{check.shift} SHIFT</p>
          <p className="text-[10px] text-muted-foreground">{new Date(check.date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Info className="h-3 w-3" /> Audit Findings Summary
          </label>
          <div className="flex flex-wrap gap-2">
            {['prenote', 'medaid', 'diag', 'receipt', 'bio', 'gop'].map((f) => (
              <div key={f} className={cn(
                "px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase flex items-center gap-2",
                check[f] === 'Y' ? "bg-success/5 border-success/20 text-success" :
                check[f] === 'N' ? "bg-danger/5 border-danger/20 text-danger" :
                "bg-muted/5 border-border text-muted-foreground opacity-50"
              )}>
                {check[f] === 'Y' ? <Check className="h-3 w-3" /> : check[f] === 'N' ? <XCircle className="h-3 w-3" /> : null}
                {f}
              </div>
            ))}
          </div>
          {check.comment && (
            <div className="p-3 bg-background/50 border border-dashed border-border rounded-xl">
              <p className="text-[10px] text-muted-foreground uppercase font-mono mb-1">Clerk Notes</p>
              <p className="text-xs text-foreground/80 italic">"{check.comment}"</p>
            </div>
          )}
        </div>

        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Verdict</label>
              <div className="flex gap-2">
                {['Validated', 'Disputed'].map(v => (
                  <button
                    key={v}
                    onClick={() => setStatus(v)}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-[10px] font-bold uppercase border transition-all",
                      status === v 
                        ? (v === 'Validated' ? "bg-success/10 border-success/30 text-success" : "bg-danger/10 border-danger/30 text-danger")
                        : "bg-background border-border text-muted-foreground hover:bg-white/5"
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Accuracy Score</label>
              <input 
                type="range" min="0" max="100" step="10"
                value={score}
                onChange={(e) => setScore(parseInt(e.target.value))}
                className="w-full accent-primary h-1.5 bg-background rounded-full appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
                <span>0%</span>
                <span className="text-primary">{score}% Precision</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Supervisor Intelligence Feedback</label>
            <textarea 
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Coaching notes or discrepancy details..."
              className="w-full bg-background border border-border rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Commit Secondary Verification"}
          </button>
        </div>
      </div>
    </div>
  )
}
