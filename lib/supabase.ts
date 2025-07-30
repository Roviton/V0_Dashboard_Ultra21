import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database schema
export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          phone: string | null
          email: string | null
          mc_number: string | null
          dot_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          phone?: string | null
          email?: string | null
          mc_number?: string | null
          dot_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          phone?: string | null
          email?: string | null
          mc_number?: string | null
          dot_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          company_id: string
          email: string
          name: string
          role: "admin" | "dispatcher"
          avatar_url: string | null
          telegram_username: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          email: string
          name: string
          role: "admin" | "dispatcher"
          avatar_url?: string | null
          telegram_username?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          email?: string
          name?: string
          role?: "admin" | "dispatcher"
          avatar_url?: string | null
          telegram_username?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      loads: {
        Row: {
          id: string
          company_id: string
          load_number: string
          status: "new" | "assigned" | "picked_up" | "in_transit" | "delivered" | "completed" | "cancelled"
          pickup_date: string | null
          delivery_date: string | null
          pickup_location: any | null
          delivery_location: any | null
          commodity: string | null
          weight: number | null
          rate: number | null
          distance_miles: number | null
          rpm: number | null
          customer_id: string | null
          special_instructions: string | null
          created_by: string
          assigned_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          load_number: string
          status?: "new" | "assigned" | "picked_up" | "in_transit" | "delivered" | "completed" | "cancelled"
          pickup_date?: string | null
          delivery_date?: string | null
          pickup_location?: any | null
          delivery_location?: any | null
          commodity?: string | null
          weight?: number | null
          rate?: number | null
          distance_miles?: number | null
          rpm?: number | null
          customer_id?: string | null
          special_instructions?: string | null
          created_by: string
          assigned_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          load_number?: string
          status?: "new" | "assigned" | "picked_up" | "in_transit" | "delivered" | "completed" | "cancelled"
          pickup_date?: string | null
          delivery_date?: string | null
          pickup_location?: any | null
          delivery_location?: any | null
          commodity?: string | null
          weight?: number | null
          rate?: number | null
          distance_miles?: number | null
          rpm?: number | null
          customer_id?: string | null
          special_instructions?: string | null
          created_by?: string
          assigned_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      drivers: {
        Row: {
          id: string
          company_id: string
          name: string
          phone: string | null
          email: string | null
          license_number: string | null
          equipment_type: string | null
          status: "available" | "booked"
          current_loads_count: number
          max_loads_capacity: number
          telegram_username: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          phone?: string | null
          email?: string | null
          license_number?: string | null
          equipment_type?: string | null
          status?: "available" | "booked"
          current_loads_count?: number
          max_loads_capacity?: number
          telegram_username?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          phone?: string | null
          email?: string | null
          license_number?: string | null
          equipment_type?: string | null
          status?: "available" | "booked"
          current_loads_count?: number
          max_loads_capacity?: number
          telegram_username?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          company_id: string
          name: string
          contact_name: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          payment_terms: number | null
          credit_limit: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          payment_terms?: number | null
          credit_limit?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          payment_terms?: number | null
          credit_limit?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
