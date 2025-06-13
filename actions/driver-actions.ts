"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export interface DriverUpdateInput {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  date_of_birth?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  zip_code?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  hire_date?: string
  driver_type?: "company" | "owner_operator" | "lease_operator"
  license_number?: string
  license_state?: string
  license_expiry?: string
  license_type?: string
  truck_number?: string
  trailer_number?: string
  fuel_card_number?: string
  equipment_preferences?: string[]
  notes?: string
}

export async function getDrivers() {
  try {
    const { data, error } = await supabase
      .from("drivers")
      .select(`
        *
      `)
      .order("name")

    if (error) {
      console.error("Error fetching drivers:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [], error: null }
  } catch (error: any) {
    console.error("Unexpected error fetching drivers:", error)
    return { success: false, error: error.message, data: [] }
  }
}

export async function getDriverById(id: string) {
  try {
    // First, get the basic driver information
    const { data: driverData, error: driverError } = await supabase.from("drivers").select("*").eq("id", id).single()

    if (driverError) {
      console.error("Error fetching driver by ID:", driverError)
      throw new Error(driverError.message)
    }

    if (!driverData) {
      throw new Error("Driver not found")
    }

    // Transform the data to match the expected interface
    const transformedData = {
      id: driverData.id,
      first_name: driverData.name?.split(" ")[0] || "",
      last_name: driverData.name?.split(" ").slice(1).join(" ") || "",
      email: driverData.email,
      phone: driverData.phone,
      date_of_birth: null,
      address_line_1: null,
      address_line_2: null,
      city: null,
      state: null,
      zip_code: null,
      emergency_contact_name: null,
      emergency_contact_phone: null,
      hire_date: null,
      driver_type: "company",
      license_number: driverData.license_number,
      license_state: null,
      license_expiration: null,
      equipment_preferences: [], // Remove equipment_type reference
      fuel_card_number: null,
      truck_number: null,
      trailer_number: null,
      notes: driverData.notes,
      status: driverData.status,
      avatar_url: null,
      driver_performance: [
        {
          total_miles: 0,
          total_revenue: 0,
          total_loads: 0,
          on_time_delivery_rate: 95,
          load_acceptance_rate: 90,
          average_rpm: 2.5,
        },
      ],
      driver_messaging: [
        {
          telegram_enabled: false,
          whatsapp_enabled: false,
          sms_enabled: true,
          email_enabled: true,
        },
      ],
      driver_documents: [],
      co_driver: null,
      license_type: "Class A CDL",
      license_expiry: null,
    }

    return transformedData
  } catch (error: any) {
    console.error("Unexpected error fetching driver by ID:", error)
    throw error
  }
}

export async function updateDriver(updates: DriverUpdateInput) {
  try {
    const { id, first_name, last_name, ...otherUpdates } = updates

    // Combine first and last name into a single name field
    const name = `${first_name || ""} ${last_name || ""}`.trim()

    // Only update fields that exist in the database
    const updateData: any = {}

    if (name) {
      updateData.name = name
    }

    if (otherUpdates.email !== undefined) {
      updateData.email = otherUpdates.email
    }

    if (otherUpdates.phone !== undefined) {
      updateData.phone = otherUpdates.phone
    }

    if (otherUpdates.license_number !== undefined) {
      updateData.license_number = otherUpdates.license_number
    }

    if (otherUpdates.notes !== undefined) {
      updateData.notes = otherUpdates.notes
    }

    // Remove any undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    console.log("Updating driver with data:", updateData)

    const { data, error } = await supabase.from("drivers").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("Error updating driver:", error)
      throw new Error(error.message)
    }

    revalidatePath("/dashboard/drivers")
    return data
  } catch (error: any) {
    console.error("Unexpected error updating driver:", error)
    throw error
  }
}

export async function updateDriverStatus(driverId: string, status: string) {
  try {
    const { data, error } = await supabase.from("drivers").update({ status }).eq("id", driverId).select().single()

    if (error) {
      console.error("Error updating driver status:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/drivers")
    return { success: true, data }
  } catch (error: any) {
    console.error("Unexpected error updating driver status:", error)
    return { success: false, error: error.message }
  }
}

export async function updateDriverMessaging(driverId: string, messagingSettings: Record<string, boolean>) {
  try {
    // For now, just return success since we don't have a messaging table in the simplified schema
    revalidatePath("/dashboard/drivers")
    return { success: true, data: messagingSettings }
  } catch (error: any) {
    console.error("Unexpected error updating driver messaging:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteDriver(driverId: string) {
  try {
    const { error } = await supabase.from("drivers").delete().eq("id", driverId)

    if (error) {
      console.error("Error deleting driver:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/drivers")
    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error deleting driver:", error)
    return { success: false, error: error.message }
  }
}

export async function createDriver(driverData: any) {
  try {
    const { data, error } = await supabase.from("drivers").insert(driverData).select().single()

    if (error) {
      console.error("Error creating driver:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/drivers")
    return { success: true, data }
  } catch (error: any) {
    console.error("Unexpected error creating driver:", error)
    return { success: false, error: error.message }
  }
}
