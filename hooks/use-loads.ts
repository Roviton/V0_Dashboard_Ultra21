"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import type { Load as LoadType, Customer as CustomerType, Driver as DriverType } from "@/types" // Assuming types are defined

// Define a more specific type for the load object returned by Supabase, including nested objects
interface SupabaseLoad extends Omit<LoadType, "customer" | "load_drivers"> {
  customer: CustomerType | null // Customer can be an object or null
  load_drivers: Array<{
    is_primary: boolean
    driver: DriverType | null // Driver can be an object or null
    // ... other load_driver fields
  }>
  // ... other fields from your 'loads' table
}

interface UseLoadsOptions {
  viewMode?: "active" | "history" | "all"
  customerId?: string
  driverId?: string
  // Add other potential filters like dateRange, searchTerm if your hook supports them
}

const useLoads = (options: UseLoadsOptions = {}) => {
  const { viewMode = "active", customerId, driverId } = options
  const [loads, setLoads] = useState<SupabaseLoad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchLoads = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase.from("loads").select(`
        *,
        customer:customers(*),
        load_drivers:load_drivers(
          *,
          driver:drivers(*)
        )
      `)

      if (viewMode === "active") {
        query = query.in("status", [
          "new",
          "assigned",
          "accepted",
          "in_progress",
          "pending_pickup",
          "at_pickup",
          "in_transit",
          "at_delivery",
          "pending_docs",
        ])
      } else if (viewMode === "history") {
        query = query.in("status", ["completed", "cancelled", "refused", "other_archived", "archived"])
      }
      // 'all' viewMode implies no status filter here

      if (customerId) {
        query = query.eq("customer_id", customerId)
      }

      // Note: Filtering by driverId on a related table (load_drivers.driver_id)
      // directly in a single Supabase query like this can be complex.
      // This might require an RPC function or client-side filtering for accuracy.
      // The current query will fetch all loads and then you might need to filter them.
      if (driverId) {
        console.warn(
          "Filtering by driverId in useLoads might require an RPC or client-side filtering for precise results across related tables.",
        )
        // Example of how you might try to filter if 'load_drivers' was a direct column (which it's not)
        // query = query.eq('some_direct_driver_id_column', driverId);
      }

      query = query.order("created_at", { ascending: false })

      const { data, error: queryError } = await query

      if (queryError) throw queryError
      setLoads((data as SupabaseLoad[]) || [])
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch loads"
      setError(errorMessage)
      console.error("Error fetching loads:", err)
      // toast({ title: "Error fetching loads", description: errorMessage, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [viewMode, customerId, driverId, toast]) // Removed supabase from dependencies as it's stable

  const createLoad = async (loadData: Partial<LoadType>) => {
    // Use Partial for flexibility
    try {
      const { data, error } = await supabase.from("loads").insert(loadData).select().single()
      if (error) throw error
      toast({ title: "Load Created", description: `Load ${data.load_number} created.` })
      fetchLoads()
      return data
    } catch (err: any) {
      toast({ title: "Error Creating Load", description: err.message, variant: "destructive" })
      throw err
    }
  }

  const updateLoadStatus = async (loadId: string, status: string, comments?: string) => {
    try {
      const updatePayload: { status: string; manager_comments?: string; completed_at?: string | null } = { status }
      if (comments) updatePayload.manager_comments = comments
      if (["completed", "cancelled", "refused", "other_archived", "archived"].includes(status)) {
        updatePayload.completed_at = new Date().toISOString()
      } else {
        updatePayload.completed_at = null // Clear completed_at if moving to an active status
      }

      const { error } = await supabase.from("loads").update(updatePayload).eq("id", loadId)
      if (error) throw error
      toast({ title: "Load Updated", description: `Load status changed to ${status}.` })
      fetchLoads()
    } catch (err: any) {
      toast({ title: "Error Updating Load", description: err.message, variant: "destructive" })
      throw err
    }
  }

  const assignDriver = async (loadId: string, driverIdValue: string, assignedByUserId?: string) => {
    try {
      // 1. Check if driver is already assigned to this load to prevent duplicates
      const { data: existingAssignment, error: checkError } = await supabase
        .from("load_drivers")
        .select("id")
        .eq("load_id", loadId)
        .eq("driver_id", driverIdValue)
        .maybeSingle()

      if (checkError) throw checkError
      if (existingAssignment) {
        toast({
          title: "Driver Already Assigned",
          description: "This driver is already assigned to this load.",
          variant: "default",
        })
        return // Or throw new Error("Driver already assigned");
      }

      // 2. Set other drivers for this load to not be primary
      await supabase.from("load_drivers").update({ is_primary: false }).eq("load_id", loadId)

      // 3. Insert new primary driver assignment
      const assignmentData: any = {
        load_id: loadId,
        driver_id: driverIdValue,
        is_primary: true,
        assigned_at: new Date().toISOString(),
      }
      if (assignedByUserId) {
        assignmentData.assigned_by = assignedByUserId
      }

      const { error: insertError } = await supabase.from("load_drivers").insert(assignmentData)
      if (insertError) throw insertError

      // 4. Update load status to 'assigned'
      await supabase.from("loads").update({ status: "assigned" }).eq("id", loadId)

      toast({ title: "Driver Assigned", description: "Driver has been successfully assigned to the load." })
      fetchLoads()
    } catch (err: any) {
      console.error("Error assigning driver:", err)
      toast({ title: "Error Assigning Driver", description: err.message, variant: "destructive" })
      throw err
    }
  }

  useEffect(() => {
    fetchLoads()
  }, [fetchLoads])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("realtime-loads-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "loads" }, (payload) => {
        console.log("Realtime change on loads:", payload)
        fetchLoads()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "load_drivers" }, (payload) => {
        console.log("Realtime change on load_drivers:", payload)
        fetchLoads()
      })
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("Subscribed to realtime loads changes!")
        }
        if (status === "CHANNEL_ERROR") {
          console.error("Realtime subscription error:", err)
          setError(`Realtime connection failed: ${err?.message}`)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchLoads]) // Add supabase if its instance can change, though typically it's stable

  return { loads, loading, error, refetch: fetchLoads, createLoad, updateLoadStatus, assignDriver }
}

export default useLoads
