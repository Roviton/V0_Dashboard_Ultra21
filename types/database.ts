export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          address: string | null
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
          password_hash: string
          name: string
          role: "admin" | "dispatcher"
          avatar_url: string | null
          phone: string | null
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          email: string
          password_hash: string
          name: string
          role: "admin" | "dispatcher"
          avatar_url?: string | null
          phone?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          email?: string
          password_hash?: string
          name?: string
          role?: "admin" | "dispatcher"
          avatar_url?: string | null
          phone?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      drivers: {
        Row: {
          id: string
          company_id: string
          name: string
          email: string | null
          phone: string
          license_number: string | null
          license_type: string | null
          license_expiry: string | null
          equipment_type_id: string | null
          status: "available" | "booked"
          telegram_user_id: string | null
          telegram_username: string | null
          avatar_url: string | null
          hire_date: string | null
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          email?: string | null
          phone: string
          license_number?: string | null
          license_type?: string | null
          license_expiry?: string | null
          equipment_type_id?: string | null
          status?: "available" | "booked"
          telegram_user_id?: string | null
          telegram_username?: string | null
          avatar_url?: string | null
          hire_date?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          email?: string | null
          phone?: string
          license_number?: string | null
          license_type?: string | null
          license_expiry?: string | null
          equipment_type_id?: string | null
          status?: "available" | "booked"
          telegram_user_id?: string | null
          telegram_username?: string | null
          avatar_url?: string | null
          hire_date?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      loads: {
        Row: {
          id: string
          company_id: string
          load_number: string
          reference_number: string | null
          customer_id: string
          dispatcher_id: string
          pickup_address: string
          pickup_city: string
          pickup_state: string
          pickup_zip: string | null
          pickup_date: string
          pickup_time: string | null
          pickup_contact_name: string | null
          pickup_contact_phone: string | null
          pickup_instructions: string | null
          delivery_address: string
          delivery_city: string
          delivery_state: string
          delivery_zip: string | null
          delivery_date: string
          delivery_time: string | null
          delivery_contact_name: string | null
          delivery_contact_phone: string | null
          delivery_instructions: string | null
          commodity: string | null
          weight: number | null
          pieces: number | null
          dimensions: string | null
          equipment_type_id: string | null
          rate: number
          distance: number | null
          rpm: number | null
          vin: string | null
          vehicle_year: number | null
          vehicle_make: string | null
          vehicle_model: string | null
          status: "new" | "assigned" | "accepted" | "refused" | "in_progress" | "completed" | "cancelled"
          is_partial_load: boolean
          parent_load_id: string | null
          is_hazmat: boolean
          temperature_controlled: boolean
          temperature_range: string | null
          special_instructions: string | null
          dispatcher_notes: string | null
          manager_comments: string | null
          rate_confirmation_pdf_id: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          load_number: string
          reference_number?: string | null
          customer_id: string
          dispatcher_id: string
          pickup_address: string
          pickup_city: string
          pickup_state: string
          pickup_zip?: string | null
          pickup_date: string
          pickup_time?: string | null
          pickup_contact_name?: string | null
          pickup_contact_phone?: string | null
          pickup_instructions?: string | null
          delivery_address: string
          delivery_city: string
          delivery_state: string
          delivery_zip?: string | null
          delivery_date: string
          delivery_time?: string | null
          delivery_contact_name?: string | null
          delivery_contact_phone?: string | null
          delivery_instructions?: string | null
          commodity?: string | null
          weight?: number | null
          pieces?: number | null
          dimensions?: string | null
          equipment_type_id?: string | null
          rate: number
          distance?: number | null
          rpm?: number | null
          vin?: string | null
          vehicle_year?: number | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          status?: "new" | "assigned" | "accepted" | "refused" | "in_progress" | "completed" | "cancelled"
          is_partial_load?: boolean
          parent_load_id?: string | null
          is_hazmat?: boolean
          temperature_controlled?: boolean
          temperature_range?: string | null
          special_instructions?: string | null
          dispatcher_notes?: string | null
          manager_comments?: string | null
          rate_confirmation_pdf_id?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          load_number?: string
          reference_number?: string | null
          customer_id?: string
          dispatcher_id?: string
          pickup_address?: string
          pickup_city?: string
          pickup_state?: string
          pickup_zip?: string | null
          pickup_date?: string
          pickup_time?: string | null
          pickup_contact_name?: string | null
          pickup_contact_phone?: string | null
          pickup_instructions?: string | null
          delivery_address?: string
          delivery_city?: string
          delivery_state?: string
          delivery_zip?: string | null
          delivery_date?: string
          delivery_time?: string | null
          delivery_contact_name?: string | null
          delivery_contact_phone?: string | null
          delivery_instructions?: string | null
          commodity?: string | null
          weight?: number | null
          pieces?: number | null
          dimensions?: string | null
          equipment_type_id?: string | null
          rate?: number
          distance?: number | null
          rpm?: number | null
          vin?: string | null
          vehicle_year?: number | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          status?: "new" | "assigned" | "accepted" | "refused" | "in_progress" | "completed" | "cancelled"
          is_partial_load?: boolean
          parent_load_id?: string | null
          is_hazmat?: boolean
          temperature_controlled?: boolean
          temperature_range?: string | null
          special_instructions?: string | null
          dispatcher_notes?: string | null
          manager_comments?: string | null
          rate_confirmation_pdf_id?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
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
          preferred_rate: number | null
          contract_start_date: string | null
          contract_end_date: string | null
          is_active: boolean
          notes: string | null
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
          preferred_rate?: number | null
          contract_start_date?: string | null
          contract_end_date?: string | null
          is_active?: boolean
          notes?: string | null
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
          preferred_rate?: number | null
          contract_start_date?: string | null
          contract_end_date?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
