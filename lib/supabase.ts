import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase environment variables. Using fallback values for development.")
}

// Create a singleton instance of the Supabase client
export const supabase = createClient<Database>(
  supabaseUrl || "https://example.supabase.co",
  supabaseAnonKey || "public-anon-key",
)

// Re-export createClient for convenience
export { createClient }

// Re-export types for convenience
export type {
  Database,
  Tables,
  InsertTables,
  UpdateTables,
  Company,
  User,
  Driver,
  Load,
  Customer,
  LoadDriver,
  LoadDocument,
  CompanyInsert,
  UserInsert,
  DriverInsert,
  LoadInsert,
  CustomerInsert,
  LoadDriverInsert,
  LoadDocumentInsert,
  CompanyUpdate,
  UserUpdate,
  DriverUpdate,
  LoadUpdate,
  CustomerUpdate,
  LoadDriverUpdate,
  LoadDocumentUpdate,
  LoadStatus,
  DriverStatus,
  UserRole,
  LoadDriverStatus,
  ContactMethod,
} from "@/types/database"

// Helper function to create a typed Supabase client
export function createSupabaseClient() {
  return createClient<Database>(supabaseUrl || "https://example.supabase.co", supabaseAnonKey || "public-anon-key")
}

// Default export for convenience
export default supabase
