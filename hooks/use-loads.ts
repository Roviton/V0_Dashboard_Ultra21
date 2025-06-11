"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"

interface UseLoadsOptions {
  viewMode?: "all" | "active" | "completed" | "archived"
  limit?: number
  customerId?: string
  driverId?: string
}

export default function useLoads(options: UseLoadsOptions = {}) {
  const [loads, setLoads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const isMounted = useRef(true)

  const { viewMode = "all", limit, customerId, driverId } = options

  // Helper function to safely extract error message
  const getErrorMessage = (error: any): string => {
    if (typeof error === "string") return error
    if (error?.message) return error.message
    if (error?.code) return `Database error: ${error.code}`
    return "An unknown error occurred"
  }

  const fetchLoads = useCallback(async () => {
    if (!isMounted.current) return

    setLoading(true)
    setError(null)

    try {
      console.log("Fetching loads with options:", options)

      // Simplified query - only select columns that exist
      let query = supabase.from("loads").select(`
          *,
          customer:customers(name),
          load_drivers(
            is_primary,
            driver:drivers(name)
          )
        `)

      // Apply filters based on viewMode
      if (viewMode === "active") {
        query = query.in("status", ["new", "assigned", "accepted", "in_progress"])
      } else if (viewMode === "completed") {
        query = query.eq("status", "completed")
      } else if (viewMode === "archived") {
        // Include both completed and cancelled loads for archive view
        query = query.in("status", ["completed", "cancelled", "other_archived"])
      }

      // Apply customer filter if provided
      if (customerId) {
        query = query.eq("customer_id", customerId)
      }

      // Apply driver filter if provided
      if (driverId) {
        // Filter by driver through the load_drivers junction table
        query = query.eq("load_drivers.driver_id", driverId)
      }

      // Apply limit if provided
      if (limit) {
        query = query.limit(limit)
      }

      // Order by completed_at for archived loads, otherwise by created_at
      if (viewMode === "archived") {
        query = query
          .order("completed_at", { ascending: false, nullsLast: true })
          .order("updated_at", { ascending: false })
      } else {
        query = query.order("created_at", { ascending: false })
      }

      const { data, error: queryError } = await query

      if (queryError) {
        throw new Error(getErrorMessage(queryError))
      }

      console.log(`Fetched ${data?.length || 0} loads`)

      if (isMounted.current) {
        setLoads(data || [])
        setLoading(false)
      }
    } catch (err: any) {
      console.error("Error fetching loads:", err)
      const errorMessage = getErrorMessage(err)

      if (isMounted.current) {
        setError(errorMessage)
        setLoading(false)
        toast({
          title: "Error",
          description: `Failed to fetch loads: ${errorMessage}`,
          variant: "destructive",
        })
      }
    }
  }, [viewMode, limit, customerId, driverId, toast])

  // Update load status function
  const updateLoadStatus = useCallback(
    async (loadId: string, status: string) => {
      try {
        console.log(`Updating load ${loadId} status to ${status}`)

        const updateData: Record<string, any> = {
          status,
          updated_at: new Date().toISOString(),
        }

        // If marking as completed or cancelled, add completed_at timestamp
        if (status === "completed" || status === "cancelled") {
          updateData.completed_at = new Date().toISOString()
        }

        const { data, error: updateError } = await supabase
          .from("loads")
          .update(updateData)
          .eq("id", loadId)
          .select()
          .single()

        if (updateError) {
          throw new Error(getErrorMessage(updateError))
        }

        console.log("Load status updated successfully:", data)

        // Show success toast
        toast({
          title: "Status Updated",
          description: `Load has been marked as ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        })

        // Refresh loads data
        fetchLoads()

        return data
      } catch (err: any) {
        console.error("Error updating load status:", err)
        const errorMessage = getErrorMessage(err)

        toast({
          title: "Error",
          description: `Failed to update load status: ${errorMessage}`,
          variant: "destructive",
        })

        throw new Error(errorMessage)
      }
    },
    [fetchLoads, toast],
  )

  // FIXED: Improved driver assignment function without updated_at field
  const assignDriver = useCallback(
    async (loadId: string, driverId: string) => {
      try {
        console.log("Starting driver assignment:", { loadId, driverId })

        // Validate inputs
        if (!loadId || !driverId) {
          throw new Error("Load ID and Driver ID are required")
        }

        // Check if load exists and get current status
        const { data: loadData, error: loadError } = await supabase
          .from("loads")
          .select("id, status, load_number")
          .eq("id", loadId)
          .single()

        if (loadError) {
          throw new Error(`Load not found: ${getErrorMessage(loadError)}`)
        }

        // Check if driver exists
        const { data: driverData, error: driverError } = await supabase
          .from("drivers")
          .select("id, name")
          .eq("id", driverId)
          .single()

        if (driverError) {
          throw new Error(`Driver not found: ${getErrorMessage(driverError)}`)
        }

        console.log("Load and driver validated:", { load: loadData, driver: driverData })

        // Step 1: Remove any existing primary assignments for this load
        console.log("Removing existing primary assignments...")
        const { error: removeError } = await supabase
          .from("load_drivers")
          .update({ is_primary: false })
          .eq("load_id", loadId)
          .eq("is_primary", true)

        if (removeError) {
          console.error("Error removing existing assignments:", removeError)
          // Don't throw here - this might be expected if no assignments exist
        }

        // Step 2: Check if this specific driver is already assigned to this load
        const { data: existingAssignment, error: checkError } = await supabase
          .from("load_drivers")
          .select("id, is_primary")
          .eq("load_id", loadId)
          .eq("driver_id", driverId)
          .maybeSingle()

        if (checkError) {
          throw new Error(`Error checking existing assignment: ${getErrorMessage(checkError)}`)
        }

        let assignmentResult

        if (existingAssignment) {
          // Update existing assignment to be primary
          console.log("Updating existing assignment to primary:", existingAssignment.id)
          const { data: updateData, error: updateError } = await supabase
            .from("load_drivers")
            .update({
              is_primary: true,
              assigned_at: new Date().toISOString(),
            })
            .eq("id", existingAssignment.id)
            .select()
            .single()

          if (updateError) {
            throw new Error(`Failed to update assignment: ${getErrorMessage(updateError)}`)
          }

          assignmentResult = updateData
        } else {
          // Create new assignment
          console.log("Creating new driver assignment...")
          const { data: insertData, error: insertError } = await supabase
            .from("load_drivers")
            .insert({
              load_id: loadId,
              driver_id: driverId,
              is_primary: true,
              assigned_at: new Date().toISOString(),
            })
            .select()
            .single()

          if (insertError) {
            // Handle specific constraint violations
            if (insertError.code === "23505") {
              // Unique constraint violation
              throw new Error("This driver is already assigned to this load as primary driver")
            }
            throw new Error(`Failed to create assignment: ${getErrorMessage(insertError)}`)
          }

          assignmentResult = insertData
        }

        // Step 3: Update the load status to assigned (only if it's not already in progress or completed)
        if (loadData.status === "new" || loadData.status === "unassigned") {
          console.log("Updating load status to assigned...")
          const { error: loadUpdateError } = await supabase
            .from("loads")
            .update({
              status: "assigned",
              updated_at: new Date().toISOString(),
            })
            .eq("id", loadId)

          if (loadUpdateError) {
            console.error("Error updating load status:", loadUpdateError)
            // Don't throw here - the assignment was successful
          }
        }

        console.log("Driver assignment completed successfully:", assignmentResult)

        // Show success toast
        toast({
          title: "Driver Assigned",
          description: `${driverData.name} has been assigned to load ${loadData.load_number}`,
        })

        // Refresh loads data
        fetchLoads()

        return assignmentResult
      } catch (err: any) {
        console.error("Error in assignDriver:", err)
        const errorMessage = getErrorMessage(err)

        // Show user-friendly error messages
        let userMessage = errorMessage
        if (errorMessage.includes("constraint")) {
          userMessage = "Unable to assign driver due to a conflict. Please try again."
        } else if (errorMessage.includes("not found")) {
          userMessage = "The selected load or driver could not be found. Please refresh and try again."
        }

        toast({
          title: "Assignment Failed",
          description: userMessage,
          variant: "destructive",
        })

        throw new Error(errorMessage)
      }
    },
    [fetchLoads, toast],
  )

  useEffect(() => {
    isMounted.current = true
    fetchLoads()

    return () => {
      isMounted.current = false
    }
  }, [fetchLoads])

  return {
    loads,
    loading,
    error,
    refetch: fetchLoads,
    assignDriver,
    updateLoadStatus,
  }
}
