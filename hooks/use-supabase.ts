"use client"

import { useState, useEffect } from "react"
import { supabase, type Database } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

type Tables = Database["public"]["Tables"]
type Load = Tables["loads"]["Row"]
type Driver = Tables["drivers"]["Row"]
type Customer = Tables["customers"]["Row"]

export function useLoads() {
  const [loads, setLoads] = useState<Load[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    async function fetchLoads() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("loads")
          .select(`
            *,
            customer:customers(name, email),
            load_drivers(
              driver:drivers(name, phone, equipment_type)
            )
          `)
          .eq("company_id", user.companyId || "1") // Fallback for demo
          .order("created_at", { ascending: false })

        if (error) throw error
        setLoads(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch loads")
      } finally {
        setLoading(false)
      }
    }

    fetchLoads()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel("loads_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "loads" }, () => fetchLoads())
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const createLoad = async (loadData: Partial<Load>) => {
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("loads")
      .insert({
        ...loadData,
        company_id: user.companyId || "1",
        created_by: user.id,
        load_number: `L-${Date.now()}`, // Generate load number
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const updateLoad = async (id: string, updates: Partial<Load>) => {
    const { data, error } = await supabase.from("loads").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  const deleteLoad = async (id: string) => {
    const { error } = await supabase.from("loads").delete().eq("id", id)

    if (error) throw error
  }

  return {
    loads,
    loading,
    error,
    createLoad,
    updateLoad,
    deleteLoad,
    refetch: () => {
      setLoading(true)
      // Trigger useEffect
    },
  }
}

export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    async function fetchDrivers() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("drivers")
          .select("*")
          .eq("company_id", user.companyId || "1")
          .eq("is_active", true)
          .order("name")

        if (error) throw error
        setDrivers(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch drivers")
      } finally {
        setLoading(false)
      }
    }

    fetchDrivers()
  }, [user])

  const createDriver = async (driverData: Partial<Driver>) => {
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("drivers")
      .insert({
        ...driverData,
        company_id: user.companyId || "1",
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const updateDriver = async (id: string, updates: Partial<Driver>) => {
    const { data, error } = await supabase.from("drivers").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  return {
    drivers,
    loading,
    error,
    createDriver,
    updateDriver,
  }
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    async function fetchCustomers() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .eq("company_id", user.companyId || "1")
          .eq("is_active", true)
          .order("name")

        if (error) throw error
        setCustomers(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch customers")
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [user])

  const createCustomer = async (customerData: Partial<Customer>) => {
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("customers")
      .insert({
        ...customerData,
        company_id: user.companyId || "1",
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  return {
    customers,
    loading,
    error,
    createCustomer,
  }
}
