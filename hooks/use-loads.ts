"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import type { Load as LoadType, Customer as CustomerType, Driver as DriverType } from "@/types" // Assuming types are defined

// Define a more specific type for the load object returned by Supabase, including nested objects
interface SupabaseLoad extends Omit<LoadType, "customer" | "load_drivers"> {
  customer: CustomerType | null
  load_drivers: Array<{
    is_primary: boolean
    driver: DriverType | null
  }>
}

interface UseLoadsOptions {
  viewMode?: "active" | "history" | "all"
  customerId?: string
  driverId?: string
  useRealtime?: boolean // New option to control realtime usage
}

// Define the expected input type for createLoad
interface CreateLoadInput extends Omit<Partial<LoadType>, "customer_id"> {
  customer_name: string // Expect customer_name from the form
  company_id: string // Expect company_id for customer creation/lookup
  dispatcher_id?: string // Optional: if not provided, could be set by RLS/default or fetched
  // Add other fields that are directly from the form but not strictly in LoadType
  broker_email?: string
  broker_phone?: string
  pickup_datetime?: string | null
  delivery_datetime?: string | null
  special_instructions_pickup?: string
  special_instructions_delivery?: string
  special_instructions_general?: string
  equipment_type?: string
  vin_number?: string
}

const useLoads = (options: UseLoadsOptions = {}) => {
  const { viewMode = "active", customerId, driverId, useRealtime = true } = options
  const [loads, setLoads] = useState<SupabaseLoad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(false)
  const { toast } = useToast()

  // Use a ref to track if the component is mounted
  const isMounted = useRef(true)

  // Use a ref to store the polling interval
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchLoads = useCallback(async () => {
    if (!isMounted.current) return

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
          // "pending_pickup", // These seem too granular for a general "active" state
          // "at_pickup",
          // "in_transit",
          // "at_delivery",
          // "pending_docs",
        ])
      } else if (viewMode === "history") {
        query = query.in("status", ["completed", "cancelled", "refused", "other_archived", "archived"])
      }

      if (customerId) {
        query = query.eq("customer_id", customerId)
      }

      if (driverId) {
        // This is a simplified approach. For robust filtering by driver on a many-to-many,
        // an RPC function or more complex client-side filtering might be needed.
        query = query.overlaps("driver_ids_array_column", [driverId]) // Placeholder: requires a denormalized column or RPC
      }

      query = query.order("created_at", { ascending: false })

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      if (isMounted.current) {
        setLoads((data as SupabaseLoad[]) || [])
        setLoading(false)
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch loads"
      console.error("Error fetching loads:", err)

      if (isMounted.current) {
        setError(errorMessage)
        setLoading(false)
        // Only show toast for non-realtime errors to avoid spamming
        if (!err.message?.includes("Realtime")) {
          toast({
            title: "Error fetching loads",
            description: errorMessage,
            variant: "destructive",
          })
        }
      }
    }
  }, [viewMode, customerId, driverId, toast])

  const createLoad = async (loadInput: CreateLoadInput) => {
    const { customer_name, company_id, dispatcher_id: providedDispatcherId, ...restOfLoadData } = loadInput

    // Enhanced validation
    if (!company_id) {
      throw new Error("Company ID is required to create a load. Please ensure you are properly logged in.")
    }
    if (!customer_name?.trim()) {
      throw new Error("Customer name is required and cannot be empty.")
    }

    console.log("Creating load with company_id:", company_id) // Debug log

    try {
      let customerIdToUse: string

      // 1. Find or create customer
      const { data: existingCustomer, error: customerError } = await supabase
        .from("customers")
        .select("id")
        .eq("name", customer_name)
        .eq("company_id", company_id)
        .maybeSingle()

      if (customerError) {
        console.error("Error fetching customer:", customerError)
        throw new Error(`Failed to check for existing customer: ${customerError.message}`)
      }

      if (existingCustomer) {
        customerIdToUse = existingCustomer.id
      } else {
        // Create new customer
        // For now, only name and company_id are mandatory for a new customer.
        // Other details like email, phone can be added if collected by the modal.
        const newCustomerData: Partial<CustomerType> & { name: string; company_id: string } = {
          name: customer_name,
          company_id: company_id,
          // Add other customer fields if available from loadInput, e.g.,
          email: loadInput.broker_email || undefined,
          phone: loadInput.broker_phone || undefined,
        }
        const { data: newCustomer, error: newCustomerError } = await supabase
          .from("customers")
          .insert(newCustomerData)
          .select("id")
          .single()

        if (newCustomerError || !newCustomer) {
          console.error("Error creating new customer:", newCustomerError)
          throw new Error(`Failed to create new customer: ${newCustomerError?.message || "Unknown error"}`)
        }
        customerIdToUse = newCustomer.id
      }

      // 2. Prepare load data with customer_id
      const finalLoadData: Partial<LoadType> = {
        ...restOfLoadData,
        customer_id: customerIdToUse,
        company_id: company_id, // Ensure company_id is part of the final load data
        load_number: restOfLoadData.load_number || `TEMP-${Date.now()}`, // Temporary if not provided
        status: restOfLoadData.status || "new",
        // Map other fields from CreateLoadInput to LoadType if names differ
        pickup_datetime: loadInput.pickup_datetime,
        delivery_datetime: loadInput.delivery_datetime,
        special_instructions_pickup: loadInput.special_instructions_pickup,
        special_instructions_delivery: loadInput.special_instructions_delivery,
        special_instructions_general: loadInput.special_instructions_general,
        equipment_type: loadInput.equipment_type,
        vin_number: loadInput.vin_number,
      }

      // Remove undefined keys to avoid issues with Supabase insert
      Object.keys(finalLoadData).forEach((key) => {
        if ((finalLoadData as any)[key] === undefined) {
          delete (finalLoadData as any)[key]
        }
      })

      const { data: newLoad, error: loadInsertError } = await supabase
        .from("loads")
        .insert(finalLoadData as any) // Cast to any if type conflicts are complex
        .select()
        .single()

      if (loadInsertError || !newLoad) {
        console.error("Error inserting load:", loadInsertError)
        throw new Error(`Failed to create load: ${loadInsertError?.message || "Unknown error"}`)
      }

      toast({ title: "Load Created", description: `Load ${newLoad.load_number} created.` })
      fetchLoads() // Refetch loads to update the list
      return newLoad
    } catch (err: any) {
      console.error("Error in createLoad process:", err)
      throw err // Re-throw to be caught by the calling component's try/catch
    }
  }

  const updateLoadStatus = async (loadId: string, status: string, comments?: string) => {
    try {
      const updatePayload: { status: string; manager_comments?: string; completed_at?: string | null } = { status }
      if (comments) updatePayload.manager_comments = comments
      if (["completed", "cancelled", "refused", "other_archived", "archived"].includes(status)) {
        updatePayload.completed_at = new Date().toISOString()
      } else {
        updatePayload.completed_at = null
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
        return
      }

      await supabase.from("load_drivers").update({ is_primary: false }).eq("load_id", loadId)

      const assignmentData: any = {
        load_id: loadId,
        driver_id: driverIdValue,
        is_primary: true,
        assigned_at: new Date().toISOString(),
      }
      // Ensure assigned_by is only added if provided and valid UUID
      if (
        assignedByUserId &&
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(assignedByUserId)
      ) {
        assignmentData.assigned_by = assignedByUserId
      } else if (assignedByUserId) {
        console.warn("Invalid or missing assignedByUserId for driver assignment, omitting.")
      }

      const { error: insertError } = await supabase.from("load_drivers").insert(assignmentData)
      if (insertError) throw insertError

      await supabase.from("loads").update({ status: "assigned" }).eq("id", loadId)

      toast({ title: "Driver Assigned", description: "Driver has been successfully assigned to the load." })
      fetchLoads()
    } catch (err: any) {
      console.error("Error assigning driver:", err)
      toast({ title: "Error Assigning Driver", description: err.message, variant: "destructive" })
      throw err
    }
  }

  // Setup polling as a fallback when realtime is not working
  const setupPolling = useCallback(() => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    // Set up a new polling interval (every 30 seconds)
    pollingIntervalRef.current = setInterval(() => {
      if (isMounted.current) {
        fetchLoads()
      }
    }, 30000) // 30 seconds

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [fetchLoads])

  // Initial data fetch
  useEffect(() => {
    fetchLoads()
  }, [fetchLoads])

  // Setup realtime subscription or polling
  useEffect(() => {
    // Skip realtime if disabled
    if (!useRealtime) {
      return setupPolling()
    }

    let channel: any = null

    try {
      channel = supabase
        .channel("realtime-loads-dashboard")
        .on("postgres_changes", { event: "*", schema: "public", table: "loads" }, () => {
          fetchLoads()
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "load_drivers" }, () => {
          fetchLoads()
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "customers" }, () => {
          fetchLoads()
        })
        .subscribe((status, err) => {
          if (status === "SUBSCRIBED") {
            console.log("✅ Realtime subscription active")
            setRealtimeConnected(true)
          }
          if (status === "CHANNEL_ERROR") {
            console.error("❌ Realtime subscription error:", err)
            setRealtimeConnected(false)
            setError(`Realtime connection failed: ${err?.message || "Check Supabase URL/Key and RLS policies."}`)

            // Fall back to polling if realtime fails
            setupPolling()
          }
        })
    } catch (err) {
      console.error("Failed to set up realtime subscription:", err)
      setRealtimeConnected(false)

      // Fall back to polling if realtime setup fails
      setupPolling()
    }

    // Cleanup function
    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel)
        } catch (err) {
          console.error("Error removing channel:", err)
        }
      }

      // Also clear any polling interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [fetchLoads, setupPolling, useRealtime])

  // Set isMounted to false when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  return {
    loads,
    loading,
    error,
    refetch: fetchLoads,
    createLoad,
    updateLoadStatus,
    assignDriver,
    realtimeConnected,
  }
}

export default useLoads
