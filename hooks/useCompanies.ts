// hooks/useCompanies.ts
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export interface Company {
  id: string
  name: string
}

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data, error } = await supabase.from("companies").select("*")
      if (!error && data) {
        setCompanies(data)
      }
      setLoading(false)
    }

    fetchCompanies()
  }, [])

  return { companies, loading }
}
