import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database"

// Create a single instance of the Supabase client for client-side use
export const supabase = createClientComponentClient<Database>()

// Log configuration for debugging
if (typeof window !== "undefined") {
  console.log("🔧 Supabase Client Configuration:")
  console.log("- Environment:", process.env.NODE_ENV)
  console.log("- Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("- Current Origin:", window.location.origin)
}
