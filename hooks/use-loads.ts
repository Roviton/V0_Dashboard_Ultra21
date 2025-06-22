"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

interface Load {
  id: string
  load_number?: string | null
  reference_number?: string | null
  customer?: any | null
  pickup_city?: string | null
  pickup_state?: string | null
  pickup_date?: string | null
  pickup_time?: string | null
  pickup_address?: string | null
  pickup_location?: string | null
  pickup_number?: string | null
  pickup_contact_name?: string | null
  pickup_contact_phone?: string | null
  delivery_city?: string | null
  delivery_state?: string | null
  delivery_date?: string | null
  delivery_time?: string | null
  delivery_address?: string | null
  delivery_location?: string | null
  delivery_number?: string | null
  delivery_contact_name?: string | null
  delivery_contact_phone?: string | null
  status: string
  rate?: number | string | null
  commodity?: string | null
  weight?: number | null
  miles?: number | null
  load_drivers?: any[] | null
  rate_confirmation_pdf_url?: string | null
  rate_confirmation_pdf_id?: string | null
  equipment_type?: string | null
  pieces?: number | null
  special_instructions?: string | null
  created_at?: string | null
  updated_at?: string | null
  appointment_number?: string | null
  notes?: string | null
  comments?: string | null
  pickup_zip?: string | null
  delivery_zip?: string | null
  assigned_by?: string | null
  company_id?: string | null
}

export default function useLoads({ viewMode = "active" }: { viewMode?: "active" | "history" | "all" } = {}) {
  const [loads, setLoads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchLoads = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Use demo company ID if no user company ID is available
      const companyId = user?.companyId

      console.log("🔍 Fetching loads for company:", companyId)

      // Start with a simple query to avoid RLS issues
      let query = supabase
        .from("loads")
        .select(`
          *
        `)
        .eq("company_id", companyId)

      // Apply view mode filter
      if (viewMode === "active") {
        query = query.in("status", ["new", "assigned", "accepted", "in_progress"])
      } else if (viewMode === "history") {
        query = query.in("status", ["completed", "cancelled", "archived"])
      }

      query = query.order("created_at", { ascending: false })

      const { data: loadsData, error: fetchError } = await query

      if (fetchError) {
        console.error("Error fetching loads:", fetchError)
        throw fetchError
      }

      console.log(`✅ Fetched ${loadsData?.length || 0} loads`)

      // If we have loads, try to fetch related data separately to avoid RLS issues
      if (loadsData && loadsData.length > 0) {
        try {
          // Fetch customers separately
          const { data: customersData } = await supabase.from("customers").select("*").eq("company_id", companyId)

          // Fetch drivers separately
          const { data: driversData } = await supabase.from("drivers").select("*").eq("company_id", companyId)

          // Fetch load_drivers separately
          const loadIds = loadsData.map((load) => load.id)
          const { data: loadDriversData } = await supabase.from("load_drivers").select("*").in("load_id", loadIds)

          // Manually join the data
          const enrichedLoads = loadsData.map((load) => {
            const customer = customersData?.find((c) => c.id === load.customer_id)
            const loadDrivers = loadDriversData?.filter((ld) => ld.load_id === load.id) || []
            const enrichedLoadDrivers = loadDrivers.map((ld) => ({
              ...ld,
              driver: driversData?.find((d) => d.id === ld.driver_id),
            }))

            return {
              ...load,
              customer,
              load_drivers: enrichedLoadDrivers,
            }
          })

          setLoads(enrichedLoads)
        } catch (relationError) {
          console.warn("Could not fetch related data, using basic loads:", relationError)
          setLoads(loadsData)
        }
      } else {
        setLoads([])
      }
    } catch (err: any) {
      console.error("Error fetching loads:", err)
      setError(err.message || "Failed to fetch loads")
      setLoads([])
    } finally {
      setLoading(false)
    }
  }, [user?.companyId, viewMode])

  const updateLoadStatus = useCallback(
    async (loadId: string, status: string) => {
      try {
        const companyId = user?.companyId || "550e8400-e29b-41d4-a716-446655440000"

        const { error: updateError } = await supabase
          .from("loads")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", loadId)
          .eq("company_id", companyId)

        if (updateError) {
          throw updateError
        }

        // Update local state
        setLoads((prevLoads) =>
          prevLoads.map((load) =>
            load.id === loadId ? { ...load, status, updated_at: new Date().toISOString() } : load,
          ),
        )

        return true
      } catch (err: any) {
        console.error("Error updating load status:", err)
        throw err
      }
    },
    [user?.companyId],
  )

  const assignDriver = async (loadId: string, driverId: string) => {
    try {
      const companyId = user?.companyId || "550e8400-e29b-41d4-a716-446655440000"

      console.log("Assigning driver:", { loadId, driverId, assignedBy: user?.id, companyId })

      // Check if the driver exists
      const { data: driverData, error: driverError } = await supabase
        .from("drivers")
        .select("id, name, status, is_active, company_id")
        .eq("id", driverId)
        .eq("company_id", companyId)
        .single()

      if (driverError) {
        console.error("Error fetching driver:", driverError)
        throw new Error(`Error fetching driver: ${driverError.message}`)
      }

      if (!driverData.is_active) {
        throw new Error("Driver is not active and cannot be assigned")
      }

      // Try the simplified assignment function
      const { error: assignError } = await supabase.rpc("assign_driver_to_load_simple", {
        p_load_id: loadId,
        p_driver_id: driverId,
        p_assigned_by: user?.id || null,
      })

      if (assignError) {
        console.error("Error in RPC call:", assignError)
        throw new Error(`Error assigning driver: ${assignError.message}`)
      }

      // Refresh the loads data
      await fetchLoads()

      return true
    } catch (error: any) {
      console.error("Error in assignDriver:", error)
      throw error
    }
  }

  useEffect(() => {
    fetchLoads()
  }, [fetchLoads])

  return {
    loads: loads || [],
    loading: loading || false,
    error: error || null,
    updateLoadStatus,
    assignDriver,
    refetch: fetchLoads,
  }
}
