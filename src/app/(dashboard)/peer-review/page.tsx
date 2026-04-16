import { getChecksForReview } from "@/lib/actions/peer-review"
import PeerReviewForm from "@/components/dashboard/peer-review-form"
import { ShieldCheck, UserCheck, AlertCircle } from "lucide-react"

export default async function PeerReviewPage() {
  const { data: checks = [] } = await getChecksForReview()

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Secondary Audit Control</h1>
          <p className="text-muted-foreground mt-1 font-mono uppercase text-[10px] tracking-widest">Supervisor Intelligence · Chain of Command Verification</p>
        </div>
        <ShieldCheck className="h-8 w-8 text-primary opacity-20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <UserCheck className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg">Queue: Pending Verification</h3>
          </div>
          
          <div className="space-y-4">
            {checks.length === 0 ? (
              <div className="bg-surface border border-dashed border-border rounded-3xl p-16 text-center text-muted text-xs font-mono uppercase tracking-widest">
                No Independent Audits Required · Verification Queue Clear
              </div>
            ) : (
              checks.map((check: any) => (
                <PeerReviewForm key={check.id} check={check} />
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-bold text-lg">Review Protocol</h3>
          </div>
          <div className="bg-surface border border-border p-8 rounded-3xl space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-background/50 border border-border rounded-xl">
                <p className="text-[10px] font-bold text-primary uppercase mb-1">Objective</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Verify the accuracy of the original clerk audit. High scores (90-100) indicate perfect alignment between HIS data and QA log.
                </p>
              </div>
              <div className="p-4 bg-background/50 border border-border rounded-xl">
                <p className="text-[10px] font-bold text-danger uppercase mb-1">Discrepancy</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  If an audit is marked as "Disputed", an automatic feedback loop is triggered to the original clerk for correction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
