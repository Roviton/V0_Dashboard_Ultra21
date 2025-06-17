"use client"

import { createClient } from "@supabase/supabase-js"
import { useAuth } from "@clerk/nextjs"
import type { Database } from "@/types/database"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function useSupabaseClient() {
  const { getToken } = useAuth()

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      // Get the custom Supabase token from Clerk
      fetch: async (url, options = {}) => {
        const clerkToken = await getToken({
          template: "supabase",
        })

        // Insert the Clerk Supabase token into the headers
        const headers = new Headers(options?.headers)
        headers.set("Authorization", `Bearer ${clerkToken}`)

        // Now call the default fetch
        return fetch(url, {
          ...options,
          headers,
        })
      },
    },
  })

  return supabase
}

// Server-side client for API routes
export function createServerSupabaseClient(clerkToken: string) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  })
}
