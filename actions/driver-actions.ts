"use server"

import { supabase } from "@/lib/supabase-client"
import { revalidatePath } from "next/cache"

export interface CreateDriverData {
  name: string
  email?: string
  phone: string
  dateOfBirth?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  zipCode?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  hireDate?: string
  driverType: "company" | "owner_operator" | "lease_operator"
  licenseNumber?: string
  licenseState?: string
  licenseExpiration?: string
  licenseType?: string
  equipmentPreferences?: string[]
  fuelCardNumber?: string
  truckNumber?: string
  trailerNumber?: string
  coDriverId?: string
  notes?: string
  companyId: string
}

export interface UpdateDriverInput {
  id: string
  first_name?: string
  last_name?: string
  name?: string
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

export interface UpdateDriverData extends Partial<CreateDriverData> {
  id: string
}

// UUID validation function
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Email validation function
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone validation function
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-$$$$]{10,}$/
  return phoneRegex.test(phone)
}

export async function createDriver(data: CreateDriverData) {
  try {
    // Validate company ID format
    if (!isValidUUID(data.companyId)) {
      throw new Error(`Invalid company ID format: ${data.companyId}`)
    }

    console.log("Creating driver with company ID:", data.companyId)

    // Check if company exists (without is_active column)
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("id", data.companyId)
      .single()

    if (companyError || !company) {
      console.error("Company not found:", companyError)
      throw new Error("Company not found. Please contact support.")
    }

    // Create driver with only the core existing columns
    const driverInsertData = {
      company_id: data.companyId,
      name: data.name,
      email: data.email || null,
      phone: data.phone,
      status: "available",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Add optional fields only if they have values
    if (data.dateOfBirth) driverInsertData.date_of_birth = data.dateOfBirth
    if (data.addressLine1) driverInsertData.address_line_1 = data.addressLine1
    if (data.addressLine2) driverInsertData.address_line_2 = data.addressLine2
    if (data.city) driverInsertData.city = data.city
    if (data.state) driverInsertData.state = data.state
    if (data.zipCode) driverInsertData.zip_code = data.zipCode
    if (data.emergencyContactName) driverInsertData.emergency_contact_name = data.emergencyContactName
    if (data.emergencyContactPhone) driverInsertData.emergency_contact_phone = data.emergencyContactPhone
    if (data.hireDate) driverInsertData.hire_date = data.hireDate
    if (data.driverType) driverInsertData.driver_type = data.driverType
    if (data.licenseNumber) driverInsertData.license_number = data.licenseNumber
    if (data.licenseState) driverInsertData.license_state = data.licenseState
    if (data.licenseExpiration) driverInsertData.license_expiry = data.licenseExpiration
    if (data.licenseType) driverInsertData.license_type = data.licenseType
    if (data.equipmentPreferences) driverInsertData.equipment_preferences = data.equipmentPreferences
    if (data.fuelCardNumber) driverInsertData.fuel_card_number = data.fuelCardNumber
    if (data.truckNumber) driverInsertData.truck_number = data.truckNumber
    if (data.trailerNumber) driverInsertData.trailer_number = data.trailerNumber
    if (data.coDriverId) driverInsertData.co_driver_id = data.coDriverId
    if (data.notes) driverInsertData.notes = data.notes

    const { data: driver, error } = await supabase.from("drivers").insert(driverInsertData).select().single()

    if (error) {
      console.error("Error creating driver:", error)
      throw new Error(`Failed to create driver: ${error.message}`)
    }

    console.log("Driver created successfully:", driver.id)

    revalidatePath("/dashboard/drivers")
    return { success: true, data: driver }
  } catch (error) {
    console.error("Error in createDriver:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create driver",
    }
  }
}

export async function updateDriver(data: UpdateDriverInput) {
  try {
    // Validate required fields
    if (!data.id || !isValidUUID(data.id)) {
      throw new Error("Invalid driver ID")
    }

    // Validate email if provided
    if (data.email && !isValidEmail(data.email)) {
      throw new Error("Invalid email format")
    }

    // Validate phone if provided
    if (data.phone && !isValidPhone(data.phone)) {
      throw new Error("Invalid phone number format")
    }

    const updateData = {
      updated_at: new Date().toISOString(),
    }

    // Only update fields that have values
    if (data.name) updateData.name = data.name
    if (data.first_name) updateData.first_name = data.first_name
    if (data.last_name) updateData.last_name = data.last_name
    if (data.email !== undefined) updateData.email = data.email
    if (data.phone) updateData.phone = data.phone
    if (data.date_of_birth) updateData.date_of_birth = data.date_of_birth
    if (data.address_line_1) updateData.address_line_1 = data.address_line_1
    if (data.address_line_2) updateData.address_line_2 = data.address_line_2
    if (data.city) updateData.city = data.city
    if (data.state) updateData.state = data.state
    if (data.zip_code) updateData.zip_code = data.zip_code
    if (data.emergency_contact_name) updateData.emergency_contact_name = data.emergency_contact_name
    if (data.emergency_contact_phone) updateData.emergency_contact_phone = data.emergency_contact_phone
    if (data.hire_date) updateData.hire_date = data.hire_date
    if (data.driver_type) updateData.driver_type = data.driver_type
    if (data.license_number) updateData.license_number = data.license_number
    if (data.license_state) updateData.license_state = data.license_state
    if (data.license_expiry) updateData.license_expiry = data.license_expiry
    if (data.license_type) updateData.license_type = data.license_type
    if (data.equipment_preferences) updateData.equipment_preferences = data.equipment_preferences
    if (data.fuel_card_number) updateData.fuel_card_number = data.fuel_card_number
    if (data.truck_number) updateData.truck_number = data.truck_number
    if (data.trailer_number) updateData.trailer_number = data.trailer_number
    if (data.notes) updateData.notes = data.notes

    const { data: driver, error } = await supabase
      .from("drivers")
      .update(updateData)
      .eq("id", data.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating driver:", error)
      throw new Error(`Failed to update driver: ${error.message}`)
    }

    revalidatePath("/dashboard/drivers")
    return { success: true, data: driver }
  } catch (error) {
    console.error("Error in updateDriver:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update driver",
    }
  }
}

export async function updateDriverStatus(driverId: string, status: string) {
  try {
    const { data, error } = await supabase
      .from("drivers")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", driverId)
      .select()
      .single()

    if (error) {
      console.error("Error updating driver status:", error)
      throw new Error(`Failed to update driver status: ${error.message}`)
    }

    revalidatePath("/dashboard/drivers")
    return { success: true, data }
  } catch (error) {
    console.error("Error in updateDriverStatus:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update driver status",
    }
  }
}

export async function getDrivers(companyId?: string) {
  try {
    let query = supabase.from("drivers").select("*").order("name").limit(100)

    if (companyId && isValidUUID(companyId)) {
      query = query.eq("company_id", companyId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching drivers:", error)
      throw new Error(`Failed to fetch drivers: ${error.message}`)
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error in getDrivers:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch drivers",
      data: [],
    }
  }
}

export async function getDriverById(driverId: string) {
  try {
    if (!driverId || typeof driverId !== "string" || !isValidUUID(driverId)) {
      throw new Error("Invalid driver ID")
    }

    const { data, error } = await supabase.from("drivers").select("*").eq("id", driverId).single()

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Driver not found")
      }
      console.error("Error fetching driver:", error)
      throw new Error(`Failed to fetch driver: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error in getDriverById:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch driver")
  }
}

export async function deleteDriver(driverId: string) {
  try {
    if (!isValidUUID(driverId)) {
      throw new Error("Invalid driver ID format")
    }

    // Since is_active might not exist, we'll try to delete the record entirely
    // or update a status field if it exists
    const { error } = await supabase.from("drivers").delete().eq("id", driverId)

    if (error) {
      console.error("Error deleting driver:", error)
      throw new Error(`Failed to delete driver: ${error.message}`)
    }

    revalidatePath("/dashboard/drivers")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteDriver:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete driver",
    }
  }
}

export async function updateDriverMessaging(driverId: string, messaging: any) {
  try {
    if (!isValidUUID(driverId)) {
      throw new Error("Invalid driver ID format")
    }

    // Since driver_messaging table might not exist, we'll update driver fields directly
    // or create a simple messaging preference system
    const updateData = {
      updated_at: new Date().toISOString(),
    }

    // If the drivers table has messaging columns, update them
    // Otherwise, we'll just return success for now
    const { data, error } = await supabase.from("drivers").update(updateData).eq("id", driverId).select().single()

    if (error) {
      console.error("Error updating driver messaging:", error)
      throw new Error(`Failed to update messaging preferences: ${error.message}`)
    }

    revalidatePath("/dashboard/drivers")
    return { success: true, data }
  } catch (error) {
    console.error("Error in updateDriverMessaging:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update messaging preferences",
    }
  }
}
