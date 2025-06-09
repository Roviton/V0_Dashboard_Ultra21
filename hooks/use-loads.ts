"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface UseLoadsOptions {
  viewMode?: "active" | "history"
}

export function useLoads(options?: UseLoadsOptions) {
  const { viewMode = "active" } = options || {}
  const [loads, setLoads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user: authUser } = useAuth()

  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  const formatDateForDB = (dateString: string | null | undefined, isRequired = false): string | null => {
    if (!dateString || dateString.trim() === "") {
      if (isRequired) {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow.toISOString().split("T")[0]
      }
      return null
    }
    return dateString.trim()
  }

  const formatTimeForDB = (timeString: string | null | undefined): string | null => {
    if (!timeString || timeString.trim() === "") return null
    return timeString.trim()
  }

  const formatNumberForDB = (numberString: string | null | undefined): number | null => {
    if (!numberString || numberString.trim() === "") return null
    const parsed = Number.parseFloat(numberString.trim())
    return isNaN(parsed) ? null : parsed
  }

  const formatIntForDB = (numberString: string | null | undefined): number | null => {
    if (!numberString || numberString.trim() === "") return null
    const parsed = Number.parseInt(numberString.trim())
    return isNaN(parsed) ? null : parsed
  }

  const formatTextForDB = (text: string | null | undefined, isRequired = false, defaultValue = ""): string | null => {
    if (!text || text.trim() === "") {
      if (isRequired) return defaultValue || "Unknown"
      return null
    }
    return text.trim()
  }

  const checkPdfColumnExists = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.from("loads").select("rate_confirmation_pdf_id").limit(1)
      return !error
    } catch (err) {
      console.log("PDF column check error:", err)
      return false
    }
  }

  const fetchLoads = useCallback(async () => {
    setError(null)
    try {
      const pdfColumnExists = await checkPdfColumnExists()
      const selectFields = `
        id, load_number, reference_number, pickup_city, pickup_state, pickup_date,
        delivery_city, delivery_state, delivery_date, status, rate, manager_comments,
        dispatcher_notes, created_at, updated_at, completed_at, pickup_address, pickup_time,
        pickup_contact_name, pickup_contact_phone, delivery_address, delivery_time,
        delivery_contact_name, delivery_contact_phone, commodity, weight, pieces,
        dimensions, special_instructions, ${pdfColumnExists ? "rate_confirmation_pdf_id," : ""}
        customer:customers(id, name, email, contact_name),
        dispatcher:users!loads_dispatcher_id_fkey(id, name, email),
        equipment_type:equipment_types(id, name, description),
        load_drivers(id, is_primary, assigned_at,
          driver:drivers(id, name, phone, email, status, avatar_url,
            equipment_type:equipment_types(id, name, description)))`

      let query = supabase.from("loads").select(selectFields).order("created_at", { ascending: false })
      if (viewMode === "history") {
        query = query.in("status", ["completed", "cancelled", "other_archived", "refused"])
      } else {
        query = query.in("status", ["new", "assigned", "accepted", "in_progress"])
      }
      const { data, error: queryError } = await query
      if (queryError) throw queryError
      setLoads(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to fetch ${viewMode} loads`
      setError(errorMessage)
      console.error(`Error fetching ${viewMode} loads:`, err)
    } finally {
      setLoading(false)
    }
  }, [viewMode])

  const createLoad = async (loadData: any) => {
    try {
      const pdfColumnExists = await checkPdfColumnExists()
      const [companyResult, dispatcherResult, equipmentResult] = await Promise.all([
        supabase.from("companies").select("id").limit(1).single(),
        supabase.from("users").select("id").limit(1).single(),
        supabase.from("equipment_types").select("id").limit(1).single(),
      ])
      const companyId = companyResult.data?.id
      const dispatcherId = dispatcherResult.data?.id
      const equipmentTypeId = equipmentResult.data?.id
      if (!companyId || !dispatcherId) throw new Error("Required sample data (company/dispatcher) not found.")

      let customerId = null
      const customerName = formatTextForDB(loadData.customer, true, "Unknown Customer")
      if (customerName && customerName !== "Unknown Customer") {
        const { data: existingCustomer } = await supabase
          .from("customers")
          .select("id")
          .ilike("name", customerName)
          .limit(1)
          .maybeSingle()
        if (existingCustomer) customerId = existingCustomer.id
        else {
          const { data: newCustomer, error: customerCreateError } = await supabase
            .from("customers")
            .insert({
              name: customerName,
              email: formatTextForDB(loadData.brokerEmail),
              phone: formatTextForDB(loadData.brokerPhone),
              contact_name: customerName,
              company_id: companyId,
            })
            .select("id")
            .single()
          if (customerCreateError) throw customerCreateError
          customerId = newCustomer.id
        }
      } else {
        const { data: fallbackCustomer } = await supabase.from("customers").select("id").limit(1).single()
        customerId = fallbackCustomer?.id
      }
      if (!customerId) throw new Error("Could not find or create customer.")

      const pickupDate = formatDateForDB(loadData.pickupDate, true)
      const deliveryDate = formatDateForDB(loadData.deliveryDate, true)
      let rateConfirmationPdfId = null
      if (pdfColumnExists && loadData.tempPdfId) rateConfirmationPdfId = loadData.tempPdfId

      const loadInsert: any = {
        load_number: `L-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        reference_number: formatTextForDB(loadData.reference) || formatTextForDB(loadData.loadNumber),
        customer_id: customerId,
        dispatcher_id: dispatcherId,
        company_id: companyId,
        pickup_address: formatTextForDB(loadData.originAddress, true, "Unknown Address"),
        pickup_city: formatTextForDB(loadData.originCity, true, "Unknown City"),
        pickup_state: formatTextForDB(loadData.originState, true, "Unknown State"),
        pickup_zip: formatTextForDB(loadData.originZip),
        pickup_date: pickupDate,
        pickup_time: formatTimeForDB(loadData.pickupTime),
        pickup_contact_name: formatTextForDB(loadData.pickupContactName),
        pickup_contact_phone: formatTextForDB(loadData.pickupPhone),
        delivery_address: formatTextForDB(loadData.destinationAddress, true, "Unknown Address"),
        delivery_city: formatTextForDB(loadData.destinationCity, true, "Unknown City"),
        delivery_state: formatTextForDB(loadData.destinationState, true, "Unknown State"),
        delivery_zip: formatTextForDB(loadData.destinationZip),
        delivery_date: deliveryDate,
        delivery_time: formatTimeForDB(loadData.deliveryTime),
        delivery_contact_name: formatTextForDB(loadData.deliveryContactName),
        delivery_contact_phone: formatTextForDB(loadData.deliveryPhone),
        commodity: formatTextForDB(loadData.commodity, true, "General Freight"),
        weight: formatIntForDB(loadData.weight),
        pieces: formatIntForDB(loadData.pieces),
        dimensions: formatTextForDB(loadData.dimensions),
        equipment_type_id: equipmentTypeId,
        rate: formatNumberForDB(loadData.rate) || 0,
        distance: formatIntForDB(loadData.mileage),
        vin: formatTextForDB(loadData.vin),
        special_instructions: formatTextForDB(loadData.specialInstructions),
        dispatcher_notes: formatTextForDB(loadData.notes),
        manager_comments: formatTextForDB(loadData.managerComments),
        status: "new",
        is_hazmat: loadData.hazmat || false,
        temperature_controlled: !!formatTextForDB(loadData.temperature),
        temperature_range: formatTextForDB(loadData.temperature),
      }
      if (pdfColumnExists) loadInsert.rate_confirmation_pdf_id = rateConfirmationPdfId
      const { data, error } = await supabase.from("loads").insert(loadInsert).select().single()
      if (error) throw error
      if (
        pdfColumnExists &&
        rateConfirmationPdfId &&
        data?.id &&
        typeof window !== "undefined" &&
        window.tempDocumentStorage
      ) {
        window.tempDocumentStorage.updateLoadId(rateConfirmationPdfId, data.id)
      }
      toast({ title: "Load created successfully", description: `Load ${data.load_number} has been created` })
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create load"
      console.error("Error creating load:", err)
      toast({ title: "Error creating load", description: errorMessage, variant: "destructive" })
      throw err
    }
  }

  const updateLoadStatus = async (loadId: string, status: string, comments?: string) => {
    try {
      const pdfColumnExists = await checkPdfColumnExists()
      let currentLoad = null
      const selectString = `status ${pdfColumnExists ? ", rate_confirmation_pdf_id" : ""}`
      const { data: loadData, error: loadError } = await supabase
        .from("loads")
        .select(selectString)
        .eq("id", loadId)
        .single()
      if (loadError) {
        console.error("Error fetching current load status:", JSON.stringify(loadError, null, 2))
        throw loadError
      }
      currentLoad = loadData

      const isBecomingInactive =
        ["completed", "cancelled", "other_archived"].includes(status) &&
        !["completed", "cancelled", "other_archived"].includes(currentLoad.status)
      if (
        pdfColumnExists &&
        isBecomingInactive &&
        currentLoad.rate_confirmation_pdf_id &&
        typeof window !== "undefined" &&
        window.tempDocumentStorage
      ) {
        window.tempDocumentStorage.remove(currentLoad.rate_confirmation_pdf_id)
      }

      const updatePayload: { status: string; manager_comments?: string; completed_at?: string } = { status }
      if (status === "other_archived" && comments) updatePayload.manager_comments = comments
      if (status === "completed" || status === "cancelled" || status === "other_archived") {
        updatePayload.completed_at = new Date().toISOString()
      }

      // Attempt to update and select the result to get more detailed error info
      const { data: updatedData, error: updateError } = await supabase
        .from("loads")
        .update(updatePayload)
        .eq("id", loadId)
        .select() // Request the updated row back

      if (updateError) {
        console.error("Supabase update error details:", JSON.stringify(updateError, null, 2))
        throw updateError
      }

      console.log("Load status updated successfully in DB:", updatedData)
      toast({ title: "Load updated", description: `Load status changed to ${status}` })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update load"
      // The detailed error should have been logged by the console.error above
      toast({ title: "Error updating load", description: errorMessage, variant: "destructive" })
      // Re-throw the error if you want calling functions to also handle it
      // throw err;
    }
  }

  const assignDriver = async (loadId: string, driverId: string) => {
    try {
      if (!loadId || !driverId || !isValidUUID(loadId) || !isValidUUID(driverId))
        throw new Error("Invalid Load ID or Driver ID format")
      const { data: loadExists, error: loadCheckError } = await supabase
        .from("loads")
        .select("id, status, load_number")
        .eq("id", loadId)
        .single()
      if (loadCheckError || !loadExists) throw new Error("Load not found")
      const { data: driverExists, error: driverCheckError } = await supabase
        .from("drivers")
        .select("id, name, status")
        .eq("id", driverId)
        .single()
      if (driverCheckError || !driverExists) throw new Error("Driver not found")
      const { data: existingAssignment, error: checkError } = await supabase
        .from("load_drivers")
        .select("*")
        .eq("load_id", loadId)
        .eq("driver_id", driverId)
        .maybeSingle()
      if (checkError) throw checkError
      if (existingAssignment) throw new Error("Driver is already assigned to this load")

      let assignedById: string | null = null
      if (authUser?.id && isValidUUID(authUser.id)) assignedById = authUser.id
      else {
        const { data: fallbackUser } = await supabase.from("users").select("id").limit(1).single()
        if (fallbackUser?.id && isValidUUID(fallbackUser.id)) assignedById = fallbackUser.id
      }
      await supabase.from("load_drivers").update({ is_primary: false }).eq("load_id", loadId).eq("is_primary", true)
      const assignmentData: any = {
        load_id: loadId,
        driver_id: driverId,
        is_primary: true,
        assigned_at: new Date().toISOString(),
      }
      if (assignedById) assignmentData.assigned_by = assignedById
      const { data: newAssignment, error: assignError } = await supabase
        .from("load_drivers")
        .insert(assignmentData)
        .select()
        .single()
      if (assignError) throw assignError
      await supabase.from("loads").update({ status: "assigned", updated_at: new Date().toISOString() }).eq("id", loadId)
      toast({
        title: "Driver assigned successfully",
        description: `${driverExists.name} has been assigned to load ${loadExists.load_number}`,
      })
      return newAssignment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to assign driver"
      toast({ title: "Error assigning driver", description: errorMessage, variant: "destructive" })
      throw err
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchLoads()
    const channelId = `loads-changes-${viewMode}`
    const loadsChannel = supabase
      .channel(channelId)
      .on("postgres_changes", { event: "*", schema: "public", table: "loads" }, (payload) => {
        console.log(`Real-time update on 'loads' table for ${viewMode} view:`, payload)
        fetchLoads()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "load_drivers" }, (payload) => {
        console.log(`Real-time update on 'load_drivers' table for ${viewMode} view:`, payload)
        fetchLoads()
      })
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") console.log(`Successfully subscribed to ${channelId}`)
        if (status === "CHANNEL_ERROR") console.error(`Failed to subscribe to ${channelId}:`, err)
      })
    return () => {
      console.log(`Unsubscribing from ${channelId}`)
      supabase.removeChannel(loadsChannel)
    }
  }, [fetchLoads, viewMode])

  return { loads, loading, error, createLoad, updateLoadStatus, assignDriver, refetch: fetchLoads }
}
