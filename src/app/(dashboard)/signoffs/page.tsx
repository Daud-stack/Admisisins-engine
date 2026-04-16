import { getPendingSignoffs } from "@/lib/actions/signoffs"
import SignoffButton from "@/components/dashboard/signoff-button"
import { ShieldCheck, History, UserCheck, Lock } from "lucide-react"

export default async function SignoffsPage() {
  const { data: pending = [] } = await getPendingSignoffs()

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Operational Authorization</h1>
          <p className="text-muted-foreground mt-1 font-mono uppercase text-[10px] tracking-widest">Supervisor Station · Shift Finalization</p>
        </div>
        <UserCheck className="h-8 w-8 text-primary opacity-20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg">Pending Authentication</h3>
          </div>
          
          <div className="space-y-4">
            {pending.length === 0 ? (
              <div className="bg-surface border border-dashed border-border rounded-3xl p-12 text-center text-muted text-xs font-mono uppercase tracking-widest">
                All Station Logs Secure
              </div>
            ) : pending.map((item: any, idx: number) => (
              <div key={idx} className="bg-surface border border-border p-6 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">
                    {new Date(item.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-background border border-border text-primary">{item.shift}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{item._count.id} Records PENDING</span>
                  </div>
                </div>
                <SignoffButton date={item.date.toISOString()} shift={item.shift} />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6 opacity-60">
          <div className="flex items-center gap-3">
            <History className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-bold text-lg">Secure Audit Trail</h3>
          </div>
          <div className="bg-surface border border-border p-8 rounded-3xl space-y-6">
            <div className="flex items-start gap-4">
              <Lock className="h-5 w-5 text-muted-foreground mt-1" />
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Immutable Record Protocol</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Signing off a shift locks all associated records. Once authenticated by a supervisor, DQC logs cannot be modified by clerks, ensuring an immutable audit trail for regulatory compliance.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
