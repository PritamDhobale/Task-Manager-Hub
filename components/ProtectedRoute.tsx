"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifySession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace("/") // ⛔ Redirect to login page
      } else {
        setLoading(false)
      }
    }

    verifySession()
  }, [router])

  if (loading) return <div className="p-4">Checking authentication...</div>

  return <>{children}</>
}
