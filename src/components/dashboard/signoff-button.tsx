"use client"

import { useState } from "react"
import { performSignoff } from "@/lib/actions/signoffs"
import { useRouter } from "next/navigation"
import { ShieldCheck, Loader2 } from "lucide-react"

interface SignoffButtonProps {
  date: string
  shift: string
}

export default function SignoffButton({ date, shift }: SignoffButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSignoff = async () => {
    if (!confirm(`Are you sure you want to sign off and lock the ${shift} shift for ${new Date(date).toLocaleDateString()}?`)) {
      return
    }

    setLoading(true)
    const res = await performSignoff(date, shift)
    setLoading(false)

    if (res.success) {
      router.refresh()
    } else {
      alert("Sign-off failed: " + res.error)
    }
  }

  return (
    <button
      onClick={handleSignoff}
      disabled={loading}
      className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <>
          <ShieldCheck className="h-3 w-3" />
          Authorize & Lock
        </>
      )}
    </button>
  )
}
