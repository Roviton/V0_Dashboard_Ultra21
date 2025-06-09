"use server"

import { supabase } from "@/lib/supabase-client"
import { revalidatePath } from "next/cache"

interface CreateLoadInput {
  customer_name: string
  company_id: string
  load_number?: string
  pickup_location?: string
  delivery_location?: string
  pickup_datetime?: string
  delivery_datetime?: string
  status?: string
  rate?: number
  miles?: number
  weight?: number
  commodity?: string
  equipment_type?: string
  special_instructions_pickup?: string
  special_instructions_delivery?: string
  special_instructions_general?: string
  broker_email?: string
  broker_phone?: string
  dispatcher_id?: string
  vin_number?: string
  [key: string]: any // Allow additional properties
}

export async function createLoad(input: CreateLoadInput) {
  console.log("🚀 Server Action: createLoad called with:", input)

  if (!input.company_id) {
    console.error("❌ Missing company_id in createLoad")
    throw new Error("Company ID is required to create a load")
  }

  if (!input.customer_name?.trim()) {
    console.error("❌ Missing customer_name in createLoad")
    throw new Error("Customer name is required")
  }

  try {
    // 1. Find or create customer
    let customerIdToUse: string

    const { data: existingCustomer, error: customerError } = await supabase
      .from("customers")
      .select("id")
      .eq("name", input.customer_name)
      .eq("company_id", input.company_id)
      .maybeSingle()

    if (customerError) {
      console.error("❌ Error fetching customer:", customerError)
      throw new Error(`Failed to check for existing customer: ${customerError.message}`)
    }

    if (existingCustomer) {
      console.log("✅ Found existing customer:", existingCustomer.id)
      customerIdToUse = existingCustomer.id
    } else {
      console.log("🆕 Creating new customer")
      // Create new customer
      const newCustomerData = {
        name: input.customer_name,
        company_id: input.company_id,
        email: input.broker_email || null,
        phone: input.broker_phone || null,
      }

      const { data: newCustomer, error: newCustomerError } = await supabase
        .from("customers")
        .insert(newCustomerData)
        .select("id")
        .single()

      if (newCustomerError || !newCustomer) {
        console.error("❌ Error creating new customer:", newCustomerError)
        throw new Error(`Failed to create new customer: ${newCustomerError?.message || "Unknown error"}`)
      }

      console.log("✅ Created new customer:", newCustomer.id)
      customerIdToUse = newCustomer.id
    }

    // 2. Prepare load data
    const finalLoadData = {
      ...input,
      customer_id: customerIdToUse,
      load_number: input.load_number || `LOAD-${Date.now().toString().slice(-6)}`,
      status: input.status || "new",
      created_at: new Date().toISOString(),
    }

    // Remove customer_name as it's not a field in the loads table
    delete finalLoadData.customer_name

    // 3. Insert the load
    console.log("📝 Inserting load with data:", finalLoadData)
    const { data: newLoad, error: loadError } = await supabase.from("loads").insert(finalLoadData).select().single()

    if (loadError) {
      console.error("❌ Error inserting load:", loadError)
      throw new Error(`Failed to create load: ${loadError.message}`)
    }

    console.log("✅ Load created successfully:", newLoad)
    revalidatePath("/dashboard/loads")
    return newLoad
  } catch (error: any) {
    console.error("❌ Error in createLoad:", error)
    throw error
  }
}
