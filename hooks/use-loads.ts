"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export function useLoads(isDashboard = false) {
  const [loads, setLoads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user: authUser } = useAuth()

  // Helper function to validate UUID format
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  // Helper function to convert empty strings to null for dates, with required field handling
  const formatDateForDB = (dateString: string | null | undefined, isRequired = false): string | null => {
    if (!dateString || dateString.trim() === "") {
      if (isRequired) {
        // Return tomorrow's date as default for required date fields
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow.toISOString().split("T")[0]
      }
      return null
    }
    return dateString.trim()
  }

  // Helper function to convert empty strings to null for times
  const formatTimeForDB = (timeString: string | null | undefined): string | null => {
    if (!timeString || timeString.trim() === "") {
      return null
    }
    return timeString.trim()
  }

  // Helper function to convert empty strings to null for numbers
  const formatNumberForDB = (numberString: string | null | undefined): number | null => {
    if (!numberString || numberString.trim() === "") {
      return null
    }
    const parsed = Number.parseFloat(numberString.trim())
    return isNaN(parsed) ? null : parsed
  }

  // Helper function to convert empty strings to null for integers
  const formatIntForDB = (numberString: string | null | undefined): number | null => {
    if (!numberString || numberString.trim() === "") {
      return null
    }
    const parsed = Number.parseInt(numberString.trim())
    return isNaN(parsed) ? null : parsed
  }

  // Helper function to convert empty strings to null for text, with required field handling
  const formatTextForDB = (text: string | null | undefined, isRequired = false, defaultValue = ""): string | null => {
    if (!text || text.trim() === "") {
      if (isRequired) {
        return defaultValue || "Unknown"
      }
      return null
    }
    return text.trim()
  }

  // Check if the rate_confirmation_pdf_id column exists
  const checkPdfColumnExists = async (): Promise<boolean> => {
    try {
      // Try to query the column to see if it exists
      const { error } = await supabase.from("loads").select("rate_confirmation_pdf_id").limit(1)

      return !error
    } catch (err) {
      console.log("PDF column doesn't exist yet:", err)
      return false
    }
  }

  // Fetch loads from Supabase
  const fetchLoads = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if PDF column exists
      const pdfColumnExists = await checkPdfColumnExists()

      const selectFields = `
      *,
      customer:customers(
        id,
        name,
        email,
        contact_name
      ),
      dispatcher:users!loads_dispatcher_id_fkey(
        id,
        name,
        email
      ),
      equipment_type:equipment_types(
        id,
        name,
        description
      ),
      load_drivers(
        id,
        is_primary,
        assigned_at,
        driver:drivers(
          id,
          name,
          phone,
          email,
          status,
          equipment_type:equipment_types(
            id,
            name,
            description
          )
        )
      )
    `

      let query = supabase.from("loads").select(selectFields).order("created_at", { ascending: false })

      // Filter for dashboard view (active loads only)
      if (isDashboard) {
        query = query.in("status", ["new", "assigned", "accepted", "in_progress"])
      }

      const { data, error } = await query

      console.log("Fetched loads from DB:", data)
      console.log("isDashboard:", isDashboard)
      console.log("PDF column exists:", pdfColumnExists)

      if (data) {
        console.log(
          "Load statuses from DB:",
          data.map((load) => ({ id: load.id, status: load.status, load_number: load.load_number })),
        )
      }

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      console.log("Fetched loads:", data)
      setLoads(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch loads"
      setError(errorMessage)
      console.error("Error fetching loads:", err)

      toast({
        title: "Error loading data",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Create a new load in Supabase
  const createLoad = async (loadData: any) => {
    try {
      console.log("Creating load with data:", loadData)

      // Check if PDF column exists
      const pdfColumnExists = await checkPdfColumnExists()
      console.log("PDF column exists during creation:", pdfColumnExists)

      // Get existing data from the database instead of using hardcoded IDs
      const [companyResult, dispatcherResult, equipmentResult] = await Promise.all([
        supabase.from("companies").select("id").limit(1).single(),
        supabase.from("users").select("id").limit(1).single(),
        supabase.from("equipment_types").select("id").limit(1).single(),
      ])

      const companyId = companyResult.data?.id
      const dispatcherId = dispatcherResult.data?.id
      const equipmentTypeId = equipmentResult.data?.id

      if (!companyId) {
        throw new Error("No company found. Please run the sample data script to create a company first.")
      }

      if (!dispatcherId) {
        throw new Error("Required sample data not found. Please run the sample data script first.")
      }

      // Handle customer - either find existing or create new
      let customerId = null
      const customerName = formatTextForDB(loadData.customer, true, "Unknown Customer")

      if (customerName && customerName !== "Unknown Customer") {
        // Try to find existing customer by name
        const { data: existingCustomer, error: customerSearchError } = await supabase
          .from("customers")
          .select("id")
          .ilike("name", customerName)
          .limit(1)
          .maybeSingle()

        if (customerSearchError) {
          console.error("Error searching for customer:", customerSearchError)
        }

        if (existingCustomer) {
          customerId = existingCustomer.id
          console.log("Found existing customer:", customerId)
        } else {
          // Create new customer
          const newCustomerData = {
            name: customerName,
            email: formatTextForDB(loadData.brokerEmail),
            phone: formatTextForDB(loadData.brokerPhone),
            contact_name: customerName,
            company_id: companyId,
          }

          const { data: newCustomer, error: customerCreateError } = await supabase
            .from("customers")
            .insert(newCustomerData)
            .select("id")
            .single()

          if (customerCreateError) {
            console.error("Error creating customer:", customerCreateError)
            // Fall back to first available customer
            const { data: fallbackCustomer } = await supabase.from("customers").select("id").limit(1).single()
            customerId = fallbackCustomer?.id
          } else {
            customerId = newCustomer.id
            console.log("Created new customer:", customerId)
          }
        }
      } else {
        // Fall back to first available customer if no customer name provided
        const { data: fallbackCustomer } = await supabase.from("customers").select("id").limit(1).single()
        customerId = fallbackCustomer?.id
      }

      if (!customerId) {
        throw new Error("Could not find or create customer. Please run the sample data script first.")
      }

      // Validate required fields and provide defaults
      const pickupDate = formatDateForDB(loadData.pickupDate, true) // Required
      const deliveryDate = formatDateForDB(loadData.deliveryDate, true) // Required

      // Use the tempPdfId passed from the modal if available
      let rateConfirmationPdfId = null
      if (pdfColumnExists && loadData.tempPdfId) {
        rateConfirmationPdfId = loadData.tempPdfId
        console.log(`Using provided tempPdfId: ${rateConfirmationPdfId}`)
        // The document in tempDocumentStorage will be updated with the actual load ID
        // after successful insertion of the load record.
      }

      // Transform the form data to match our database schema with proper null handling
      const loadInsert: any = {
        load_number: `L-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        reference_number: formatTextForDB(loadData.reference) || formatTextForDB(loadData.loadNumber),
        customer_id: customerId,
        dispatcher_id: dispatcherId,
        company_id: companyId,

        // Pickup information (pickup_date is required)
        pickup_address: formatTextForDB(loadData.originAddress, true, "Unknown Address"),
        pickup_city: formatTextForDB(loadData.originCity, true, "Unknown City"),
        pickup_state: formatTextForDB(loadData.originState, true, "Unknown State"),
        pickup_zip: formatTextForDB(loadData.originZip),
        pickup_date: pickupDate,
        pickup_time: formatTimeForDB(loadData.pickupTime),
        pickup_contact_name: formatTextForDB(loadData.pickupContact),
        pickup_contact_phone: formatTextForDB(loadData.pickupPhone),

        // Delivery information (delivery_date is required)
        delivery_address: formatTextForDB(loadData.destinationAddress, true, "Unknown Address"),
        delivery_city: formatTextForDB(loadData.destinationCity, true, "Unknown City"),
        delivery_state: formatTextForDB(loadData.destinationState, true, "Unknown State"),
        delivery_zip: formatTextForDB(loadData.destinationZip),
        delivery_date: deliveryDate,
        delivery_time: formatTimeForDB(loadData.deliveryTime),
        delivery_contact_name: formatTextForDB(loadData.deliveryContact),
        delivery_contact_phone: formatTextForDB(loadData.deliveryPhone),

        // Load details
        commodity: formatTextForDB(loadData.commodity, true, "General Freight"),
        weight: formatIntForDB(loadData.weight),
        pieces: formatIntForDB(loadData.pieces),
        dimensions: formatTextForDB(loadData.dimensions),
        equipment_type_id: equipmentTypeId,
        rate: formatNumberForDB(loadData.rate) || 0,
        distance: formatIntForDB(loadData.mileage),
        vin: formatTextForDB(loadData.vin),

        // Additional information
        special_instructions: formatTextForDB(loadData.specialInstructions),
        dispatcher_notes: formatTextForDB(loadData.notes),
        status: "new",
        is_hazmat: loadData.hazmat || false,
        temperature_controlled: !!formatTextForDB(loadData.temperature),
        temperature_range: formatTextForDB(loadData.temperature),
      }

      // Only add PDF reference if column exists
      if (pdfColumnExists) {
        loadInsert.rate_confirmation_pdf_id = rateConfirmationPdfId
      }

      console.log("Inserting load with cleaned data:", loadInsert)

      const { data, error } = await supabase.from("loads").insert(loadInsert).select().single()

      if (error) {
        console.error("Error creating load:", error)
        throw error
      }

      console.log("Load created successfully:", data)

      // Update the PDF with the actual load ID (only if column exists and PDF was stored)
      if (
        pdfColumnExists &&
        rateConfirmationPdfId &&
        data?.id &&
        typeof window !== "undefined" &&
        window.tempDocumentStorage
      ) {
        const success = window.tempDocumentStorage.updateLoadId(rateConfirmationPdfId, data.id)
        if (success) {
          console.log(`Updated temp document ${rateConfirmationPdfId} with actual load ID ${data.id}`)
        } else {
          console.warn(
            `Failed to update temp document ${rateConfirmationPdfId} with load ID ${data.id}. It might have been removed or ID is incorrect.`,
          )
        }
      }

      toast({
        title: "Load created successfully",
        description: `Load ${data.load_number} has been created`,
      })

      // Refresh the loads list
      await fetchLoads()

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create load"
      console.error("Error creating load:", err)

      toast({
        title: "Error creating load",
        description: errorMessage,
        variant: "destructive",
      })

      throw err
    }
  }

  // Update load status
  const updateLoadStatus = async (loadId: string, status: string) => {
    try {
      // Check if PDF column exists
      const pdfColumnExists = await checkPdfColumnExists()

      let load = null
      if (pdfColumnExists) {
        // First, get the current load to check if it has a PDF
        const { data: loadData, error: loadError } = await supabase
          .from("loads")
          .select("rate_confirmation_pdf_id, status")
          .eq("id", loadId)
          .single()

        if (loadError) throw loadError
        load = loadData
      } else {
        // Just get the status if PDF column doesn't exist
        const { data: loadData, error: loadError } = await supabase
          .from("loads")
          .select("status")
          .eq("id", loadId)
          .single()

        if (loadError) throw loadError
        load = loadData
      }

      // Check if status is changing to inactive (completed or cancelled)
      const isBecomingInactive =
        ["completed", "cancelled"].includes(status) && !["completed", "cancelled"].includes(load.status)

      // If becoming inactive and has a PDF, delete it (only if column exists)
      if (
        pdfColumnExists &&
        isBecomingInactive &&
        load.rate_confirmation_pdf_id &&
        typeof window !== "undefined" &&
        window.tempDocumentStorage
      ) {
        console.log(`Load ${loadId} becoming inactive, removing PDF ${load.rate_confirmation_pdf_id}`)
        window.tempDocumentStorage.remove(load.rate_confirmation_pdf_id)
      }

      // Update the load status
      const { error } = await supabase.from("loads").update({ status }).eq("id", loadId)

      if (error) throw error

      toast({
        title: "Load updated",
        description: `Load status changed to ${status}`,
      })

      await fetchLoads()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update load"
      toast({
        title: "Error updating load",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  // Assign driver to load - simplified reliable method with UUID validation
  const assignDriver = async (loadId: string, driverId: string) => {
    try {
      console.log("Assigning driver:", { loadId, driverId })

      // Validate inputs
      if (!loadId || !driverId) {
        throw new Error("Load ID and Driver ID are required")
      }

      // Validate UUID format
      if (!isValidUUID(loadId)) {
        throw new Error(`Invalid load ID format: ${loadId}`)
      }

      if (!isValidUUID(driverId)) {
        throw new Error(`Invalid driver ID format: ${driverId}`)
      }

      console.log("UUID validation passed")

      // Check if load exists
      const { data: loadExists, error: loadCheckError } = await supabase
        .from("loads")
        .select("id, status, load_number")
        .eq("id", loadId)
        .single()

      if (loadCheckError || !loadExists) {
        console.error("Load check error:", loadCheckError)
        throw new Error("Load not found")
      }

      // Check if driver exists
      const { data: driverExists, error: driverCheckError } = await supabase
        .from("drivers")
        .select("id, name, status")
        .eq("id", driverId)
        .single()

      if (driverCheckError || !driverExists) {
        console.error("Driver check error:", driverCheckError)
        throw new Error("Driver not found")
      }

      console.log("Load and driver validation passed:", { load: loadExists, driver: driverExists })

      // Check if assignment already exists
      const { data: existingAssignment, error: checkError } = await supabase
        .from("load_drivers")
        .select("*")
        .eq("load_id", loadId)
        .eq("driver_id", driverId)
        .maybeSingle()

      if (checkError) {
        console.error("Error checking existing assignment:", checkError)
        throw checkError
      }

      if (existingAssignment) {
        throw new Error("Driver is already assigned to this load")
      }

      console.log("No existing assignment found, proceeding with assignment")

      // Get the current user ID for assignment tracking
      let assignedById: string | null = null
      if (authUser?.id && isValidUUID(authUser.id)) {
        assignedById = authUser.id
        console.log("Using auth user ID:", assignedById)
      } else {
        // Get a fallback user
        const { data: fallbackUser } = await supabase.from("users").select("id").limit(1).single()
        if (fallbackUser && isValidUUID(fallbackUser.id)) {
          assignedById = fallbackUser.id
          console.log("Using fallback user ID:", assignedById)
        }
      }

      // Remove any existing primary driver assignments for this load
      const { error: removeError } = await supabase
        .from("load_drivers")
        .update({ is_primary: false })
        .eq("load_id", loadId)
        .eq("is_primary", true)

      if (removeError) {
        console.error("Error updating existing assignments:", removeError)
        // Don't throw here, just log the error and continue
      }

      // Insert new driver assignment
      const assignmentData: any = {
        load_id: loadId,
        driver_id: driverId,
        is_primary: true,
        assigned_at: new Date().toISOString(),
      }

      // Only add assigned_by if we have a valid UUID
      if (assignedById && isValidUUID(assignedById)) {
        assignmentData.assigned_by = assignedById
      }

      console.log("Creating assignment with data:", assignmentData)

      const { data: newAssignment, error: assignError } = await supabase
        .from("load_drivers")
        .insert(assignmentData)
        .select()
        .single()

      if (assignError) {
        console.error("Error creating assignment:", assignError)
        throw assignError
      }

      console.log("Assignment created successfully:", newAssignment)

      // Update the load status to assigned
      const { error: statusError } = await supabase
        .from("loads")
        .update({
          status: "assigned",
          updated_at: new Date().toISOString(),
        })
        .eq("id", loadId)

      if (statusError) {
        console.error("Error updating load status:", statusError)
        throw statusError
      }

      console.log("Load status updated to assigned")

      toast({
        title: "Driver assigned successfully",
        description: `${driverExists.name} has been assigned to load ${loadExists.load_number}`,
      })

      // Refresh the loads list to show the updated assignment
      await fetchLoads()

      return newAssignment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to assign driver"
      console.error("Error assigning driver:", err)

      // Provide more specific error messages
      let userFriendlyMessage = errorMessage
      if (errorMessage.includes("not found")) {
        userFriendlyMessage = "The selected driver or load no longer exists. Please refresh and try again."
      } else if (errorMessage.includes("already assigned")) {
        userFriendlyMessage = "This driver is already assigned to this load."
      } else if (errorMessage.includes("Invalid") && errorMessage.includes("format")) {
        userFriendlyMessage = "Invalid data format. Please refresh the page and try again."
      } else if (errorMessage.includes("uuid")) {
        userFriendlyMessage = "Data format error. Please run the sample data script to fix the database."
      }

      toast({
        title: "Error assigning driver",
        description: userFriendlyMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchLoads()

    // Set up real-time subscription
    const subscription = supabase
      .channel("loads_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "loads" }, () => {
        console.log("Load change detected, refreshing...")
        fetchLoads()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "load_drivers" }, () => {
        console.log("Load driver assignment change detected, refreshing...")
        fetchLoads()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [isDashboard])

  return {
    loads,
    loading,
    error,
    createLoad,
    updateLoadStatus,
    assignDriver,
    refetch: fetchLoads,
  }
}
