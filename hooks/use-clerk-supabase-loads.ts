"use client"

import { useState, useEffect } from "react"
import { useSupabaseClient } from "@/lib/supabase-clerk"
import { useAuth } from "@clerk/nextjs"

export function useClerkSupabaseLoads() {
  const [loads, setLoads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useSupabaseClient()
  const { isLoaded, userId } = useAuth()

  async function fetchLoads() {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("loads").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setLoads(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoaded || !userId) return

    fetchLoads()
  }, [isLoaded, userId, supabase])

  return { loads, loading, error, refetch: () => fetchLoads() }
}
